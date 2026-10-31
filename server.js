
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const initialiserDatabase = require("./initialiser-db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

const app = express();

app.set("trust proxy", 1);

// Servir uniquement les fichiers du dossier public
app.use(express.static("public"));

const db = new sqlite3.Database("./kertech.db", (err) => {
    if (err) {
        console.error("Erreur de connexion SQLite :", err.message);
    } else {
        console.log("Connexion SQLite réussie !");
    }
});

db.run("PRAGMA foreign_keys = ON", (err) => {
    if (err) {
        console.error("Erreur activation clés étrangères :", err.message);
        return;
    }

    db.get("PRAGMA foreign_keys;", (erreur, resultat) => {
        if (erreur) {
            console.error("Erreur vérification SQLite :", erreur.message);
        } else {
            console.log(
                "Clés étrangères réellement activées :",
                resultat.foreign_keys
            );
        }
    });
});

const PORT = process.env.PORT || 3000;

// =====================================
// CONFIGURATION DU SERVEUR
// =====================================

app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

app.use(express.json());

app.use(session({
    name: "kertech.sid",
    store: new SQLiteStore({
        db: "kertech-sessions.db",
        dir: "./"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}));


/* =====================================
   DECONNEXION UTILISATEUR
===================================== */

app.post("/deconnexion", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.error("Erreur de déconnexion :", err);

            return res.status(500).json({
                erreur: "Impossible de se déconnecter."
            });
        }

        res.clearCookie("kertech.sid", {
            path: "/"
        });

        return res.status(200).json({
            message: "Déconnexion réussie !"
        });

    });

});


// =====================================
// TABLE DES CANDIDATURES
// =====================================

db.run(`
    CREATE TABLE IF NOT EXISTS candidatures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projet_id INTEGER NOT NULL,
        freelance_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        statut TEXT NOT NULL DEFAULT 'En attente',
        date_candidature DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projet_id) REFERENCES projets(id),
        FOREIGN KEY (freelance_id) REFERENCES utilisateurs(id)
    )
`, (err) => {
    if (err) {
        console.error("Erreur table candidatures :", err.message);
    } else {
        console.log("Table candidatures prête !");
    }
});

// =====================================
// ACCUEIL
// =====================================

app.get("/", (req, res) => {
    res.sendFile("index.html", {
        root: __dirname + "/public"
    });
});

// =====================================
// INSCRIPTION
// =====================================

app.post("/inscription", async (req, res) => {
    const { nom, email, mot_de_passe, role } = req.body || {};

    if (
        typeof nom !== "string" || nom.trim() === "" ||
        typeof email !== "string" || email.trim() === "" ||
        typeof mot_de_passe !== "string" || mot_de_passe.trim() === "" ||
        typeof role !== "string" || role.trim() === ""
    ) {
        return res.status(400).json({
            erreur: "Tous les champs sont obligatoires."
        });
    }

    if (role !== "freelance" && role !== "client") {
        return res.status(400).json({
            erreur: "Le rôle doit être freelance ou client."
        });
    }

    const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValide.test(email.trim())) {
        return res.status(400).json({
            erreur: "Adresse email invalide."
        });
    }

    if (mot_de_passe.length < 12) {
        return res.status(400).json({
            erreur: "Le mot de passe doit contenir au moins 12 caractères."
        });
    }

    try {
        const motDePasseHash = await bcrypt.hash(mot_de_passe, 12);

        const sql = `
            INSERT INTO utilisateurs
            (nom, email, mot_de_passe, role)
            VALUES (?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                nom.trim(),
                email.trim().toLowerCase(),
                motDePasseHash,
                role
            ],
            function (err) {
                if (err) {
                    console.error(err.message);

                    if (err.code === "SQLITE_CONSTRAINT") {
                        return res.status(409).json({
                            erreur: "Cet email est déjà utilisé ou les données sont invalides."
                        });
                    }

                    return res.status(500).json({
                        erreur: "Erreur lors de la création du compte."
                    });
                }

                return res.status(201).json({
                    message: "Compte créé avec succès !",
                    id: this.lastID
                });
            }
        );
    } catch (err) {
        console.error("Erreur inscription :", err.message);

        return res.status(500).json({
            erreur: "Erreur interne lors de l'inscription."
        });
    }
});

// =====================================
// CONNEXION
// =====================================

app.post("/connexion", (req, res) => {
    const { email, mot_de_passe } = req.body || {};

    if (
        typeof email !== "string" || email.trim() === "" ||
        typeof mot_de_passe !== "string" || mot_de_passe === ""
    ) {
        return res.status(400).json({
            erreur: "Email et mot de passe obligatoires."
        });
    }

    const sql = "SELECT * FROM utilisateurs WHERE email = ?";

    db.get(
        sql,
        [email.trim().toLowerCase()],
        async (err, utilisateur) => {
            if (err) {
                console.error("Erreur SQLite :", err.message);

                return res.status(500).json({
                    erreur: "Erreur interne du serveur."
                });
            }

            if (!utilisateur) {
                return res.status(401).json({
                    erreur: "Email ou mot de passe incorrect."
                });
            }

            let motDePasseValide;

            try {
                motDePasseValide = await bcrypt.compare(
                    mot_de_passe,
                    utilisateur.mot_de_passe
                );
            } catch (err) {
                console.error("Erreur bcrypt :", err.message);

                return res.status(500).json({
                    erreur: "Erreur interne du serveur."
                });
            }

            if (!motDePasseValide) {
                return res.status(401).json({
                    erreur: "Email ou mot de passe incorrect."
                });
            }

            req.session.regenerate((err) => {
                if (err) {
                    console.error("Erreur session :", err.message);

                    return res.status(500).json({
                        erreur: "Impossible de créer la session."
                    });
                }

                req.session.userId = utilisateur.id;

                req.session.save((err) => {
                    if (err) {
                        console.error("Erreur sauvegarde session :", err.message);

                        return res.status(500).json({
                            erreur: "Impossible d'enregistrer la session."
                        });
                    }

                    return res.status(200).json({
                        message: "Connexion réussie !",
                        utilisateur: {
                            id: utilisateur.id,
                            nom: utilisateur.nom,
                            role: utilisateur.role
                        }
                    });
                });
            });
        }
    );
});

// =====================================
// VÉRIFIER LA SESSION
// =====================================

app.get("/session", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            connecte: false,
            message: "Aucun utilisateur connecté."
        });
    }

    const sql = `
        SELECT id, nom, role
        FROM utilisateurs
        WHERE id = ?
    `;

    db.get(sql, [req.session.userId], (err, utilisateur) => {
        if (err) {
            console.error("Erreur SQLite :", err.message);

            return res.status(500).json({
                erreur: "Erreur interne du serveur."
            });
        }

        if (!utilisateur) {
            return res.status(401).json({
                connecte: false,
                message: "Utilisateur introuvable."
            });
        }

        return res.status(200).json({
            connecte: true,
            message: "Utilisateur connecté.",
            utilisateur: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                role: utilisateur.role
            }
        });
    });
});


// =====================================
// LISTE DES PROJETS
// =====================================


app.get("/projets", (req, res) => {

    const sql = `
        SELECT
            p.*,
            (
                SELECT COUNT(*)
                FROM candidatures AS c
                WHERE c.projet_id = p.id
            ) AS candidatures
        FROM projets AS p
    `;

    db.all(sql, (err, projets) => {

        if (err) {
            console.error("Erreur projets :", err.message);

            return res.status(500).json({
                erreur: "Impossible de récupérer les projets."
            });
        }

        return res.status(200).json(projets);
    });
});



// =====================================
// PUBLIER UN PROJET (CLIENT)
// =====================================

app.post("/projets", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté pour publier un projet."
        });
    }

    // 2. Vérifier le rôle client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                console.error("Erreur utilisateur :", err.message);

                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Seuls les clients peuvent publier un projet."
                });
            }

            // 3. Récupérer les informations du projet
            const {
                titre,
                description,
                budget,
                categorie
            } = req.body || {};

            // 4. Valider les champs obligatoires
            if (
                typeof titre !== "string" ||
                titre.trim() === "" ||
                typeof description !== "string" ||
                description.trim() === ""
            ) {
                return res.status(400).json({
                    erreur: "Le titre et la description sont obligatoires."
                });
            }

            // 5. Enregistrer le projet avec son propriétaire
            db.run(
                `INSERT INTO projets
                 (titre, description, budget, categorie, statut, client_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    titre.trim(),
                    description.trim(),
                    budget ?? null,
                    categorie ?? null,
                    "ouvert",
                    req.session.userId
                ],
                function (err) {

                    if (err) {
                        console.error("Erreur publication :", err.message);

                        return res.status(500).json({
                            erreur: "Erreur lors de la création du projet."
                        });
                    }

                    return res.status(201).json({
                        message: "Projet créé avec succès !",
                        id: this.lastID
                    });
                }
            );
        }
    );
});


// =====================================
// ENVOYER UNE CANDIDATURE (FREELANCE)
// =====================================

app.post("/candidatures", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté pour postuler."
        });
    }

    // 2. Récupérer et valider les données
    const { projet_id, message } = req.body || {};

    if (
        !Number.isSafeInteger(projet_id) ||
        projet_id <= 0 ||
        typeof message !== "string" ||
        message.trim() === ""
    ) {
        return res.status(400).json({
            erreur: "Projet ou message invalide."
        });
    }

    // 3. Vérifier le rôle freelance
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                console.error("Erreur utilisateur :", err.message);

                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "freelance") {
                return res.status(403).json({
                    erreur: "Seuls les freelances peuvent postuler."
                });
            }

            // 4. Vérifier que le projet est ouvert
            db.get(
                "SELECT id, statut FROM projets WHERE id = ?",
                [projet_id],
                (err, projet) => {

                    if (err) {
                        console.error("Erreur projet :", err.message);

                        return res.status(500).json({
                            erreur: "Erreur de vérification du projet."
                        });
                    }


                    console.log("SECURITE DELETE :", {
                    projetId,
                    clientId,
                  autorise: Boolean(projet)
                   });
                    if (!projet) {
                        return res.status(404).json({
                            erreur: "Projet introuvable."
                        });
                    }

                    if (
                        typeof projet.statut !== "string" ||
                        projet.statut.toLowerCase() !== "ouvert"
                    ) {
                        return res.status(403).json({
                            erreur: "Ce projet n'accepte plus de candidatures."
                        });
                    }

                    // 5. Enregistrer la candidature
                    db.run(
                        `INSERT INTO candidatures
                         (projet_id, freelance_id, message, statut)
                         VALUES (?, ?, ?, ?)`,
                        [
                            projet_id,
                            req.session.userId,
                            message.trim(),
                            "En attente"
                        ],
                        function (err) {

                            if (err) {
                                console.error("Erreur candidature :", err.message);

                                return res.status(500).json({
                                    erreur: "Impossible d'enregistrer la candidature."
                                });
                            }

                            return res.status(201).json({
                                message: "Candidature envoyée avec succès !",
                                id: this.lastID
                            });
                        }
                    );
                }
            );
        }
    );
});


// =====================================
// CONSULTER LES CANDIDATURES (CLIENT)
// =====================================

app.get("/projets/:id/candidatures", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Valider l'identifiant du projet
    const projetId = Number(req.params.id);

    if (!Number.isSafeInteger(projetId) || projetId <= 0) {
        return res.status(400).json({
            erreur: "Identifiant du projet invalide."
        });
    }

    // 3. Vérifier le rôle client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                console.error("Erreur utilisateur :", err.message);

                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Accès réservé aux clients."
                });
            }

            // 4. Vérifier que le client possède le projet
            db.get(
                `SELECT id FROM projets
                 WHERE id = ? AND client_id = ?`,
                [projetId, req.session.userId],
                (err, projet) => {

                    if (err) {
                        console.error("Erreur propriétaire :", err.message);

                        return res.status(500).json({
                            erreur: "Erreur de vérification du projet."
                        });
                    }

                    if (!projet) {
                        return res.status(403).json({
                            erreur: "Vous ne pouvez pas consulter les candidatures de ce projet."
                        });
                    }

                    // 5. Récupérer les candidatures et les noms
                    db.all(
                        `SELECT
                            c.id,
                            c.projet_id,
                            c.freelance_id,
                            c.message,
                            c.statut,
                            c.date_candidature,
                            u.nom AS freelance_nom
                         FROM candidatures AS c
                         JOIN utilisateurs AS u
                         ON c.freelance_id = u.id
                         WHERE c.projet_id = ?
                         ORDER BY c.date_candidature DESC, c.id DESC`,
                        [projetId],
                        (err, candidatures) => {

                            if (err) {
                                console.error("Erreur candidatures :", err.message);

                                return res.status(500).json({
                                    erreur: "Impossible de récupérer les candidatures."
                                });
                            }

                            return res.status(200).json(candidatures);
                        }
                    );
                }
            );
        }
    );
});



/* ==========================================
   MES CANDIDATURES - ESPACE FREELANCE
========================================== */

app.get("/mes-candidatures", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Vérifier le rôle freelance
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "freelance") {
                return res.status(403).json({
                    erreur: "Accès réservé aux freelances."
                });
            }

            // 3. Récupérer uniquement ses candidatures
            const sql = `
                SELECT
                    c.id,
                    c.projet_id,
                    c.message,
                    c.statut,
                    c.date_candidature,
                    p.titre AS projet_titre
                FROM candidatures AS c
                JOIN projets AS p ON c.projet_id = p.id
                WHERE c.freelance_id = ?
                ORDER BY c.date_candidature DESC, c.id DESC
            `;

            db.all(sql, [req.session.userId], (err, candidatures) => {

                if (err) {
                    console.error("Erreur mes candidatures :", err.message);

                    return res.status(500).json({
                        erreur: "Impossible de récupérer vos candidatures."
                    });
                }

                return res.status(200).json(candidatures);
            });
        }
    );
});



/* ==========================================
   ACCEPTER UNE CANDIDATURE
========================================== */

// ==========================================
// ACCEPTER UNE CANDIDATURE
// ==========================================

app.patch("/candidatures/:id/accepter", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    const candidatureId = Number(req.params.id);

    // 2. Vérifier l'identifiant
    if (!Number.isSafeInteger(candidatureId) || candidatureId <= 0) {
        return res.status(400).json({
            erreur: "Identifiant de candidature invalide."
        });
    }

    // 3. Vérifier le rôle client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Accès réservé aux clients."
                });
            }

            // 4. Démarrer une transaction
            db.serialize(() => {

                db.run("BEGIN IMMEDIATE TRANSACTION", (err) => {

                    if (err) {
                        return res.status(500).json({
                            erreur: "Impossible de démarrer l'opération."
                        });
                    }

                    // Annuler les modifications en cas d'échec
                    function annuler(statutHTTP, message) {

                        db.run("ROLLBACK", (rollbackErr) => {

                            if (rollbackErr) {
                                console.error(
                                    "Erreur ROLLBACK :",
                                    rollbackErr.message
                                );
                            }

                            return res.status(statutHTTP).json({
                                erreur: message
                            });
                        });
                    }

                    // 5. Vérifier la candidature et le projet
                    db.get(
                        `SELECT
                            c.id,
                            c.statut AS statut_candidature,
                            c.projet_id,
                            p.statut AS statut_projet
                         FROM candidatures AS c
                         JOIN projets AS p ON c.projet_id = p.id
                         WHERE c.id = ? AND p.client_id = ?`,
                        [candidatureId, req.session.userId],
                        (err, candidature) => {

                            if (err) {
                                return annuler(
                                    500,
                                    "Erreur de vérification de la candidature."
                                );
                            }

                            if (!candidature) {
                                return annuler(
                                    403,
                                    "Candidature introuvable ou accès interdit."
                                );
                            }

                            if (candidature.statut_candidature !== "En attente") {
                                return annuler(
                                    409,
                                    "Cette candidature n'est plus en attente."
                                );
                            }

                            if (candidature.statut_projet !== "ouvert") {
                                return annuler(
                                    409,
                                    "Ce projet n'est plus ouvert."
                                );
                            }

                            // 6. Accepter la candidature
                            db.run(
                                `UPDATE candidatures
                                 SET statut = 'Acceptée'
                                 WHERE id = ? AND statut = 'En attente'`,
                                [candidatureId],
                                function (err) {

                                    if (err) {
                                        return annuler(
                                            500,
                                            "Impossible d'accepter la candidature."
                                        );
                                    }

                                    if (this.changes !== 1) {
                                        return annuler(
                                            409,
                                            "La candidature a changé de statut."
                                        );
                                    }

                                    // 7. Passer le projet en cours
                                    db.run(
                                        `UPDATE projets
                                         SET statut = 'en cours'
                                         WHERE id = ? AND statut = 'ouvert'`,
                                        [candidature.projet_id],
                                        function (err) {

                                            if (err) {
                                                return annuler(
                                                    500,
                                                    "Impossible de modifier le projet."
                                                );
                                            }

                                            if (this.changes !== 1) {
                                                return annuler(
                                                    409,
                                                    "Le projet a changé de statut."
                                                );
                                            }

                                            // 8. Refuser les autres candidatures
                                            db.run(
                                                `UPDATE candidatures
                                                 SET statut = 'Refusée'
                                                 WHERE projet_id = ?
                                                   AND id != ?
                                                   AND statut = 'En attente'`,
                                                [
                                                    candidature.projet_id,
                                                    candidatureId
                                                ],
                                                (err) => {

                                                    if (err) {
                                                        return annuler(
                                                            500,
                                                            "Impossible de mettre à jour les autres candidatures."
                                                        );
                                                    }

                                                    // 9. Valider la transaction
                                                    db.run("COMMIT", (err) => {

                                                        if (err) {
                                                            return annuler(
                                                                500,
                                                                "Impossible de finaliser l'acceptation."
                                                            );
                                                        }

                                                        return res.status(200).json({
                                                            message: "Candidature acceptée et projet en cours.",
                                                            candidature_id: candidatureId,
                                                            projet_id: candidature.projet_id,
                                                            statut: "Acceptée",
                                                            statut_projet: "en cours"
                                                        });
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            });
        }
    );
});


/* ==========================================
   REFUSER UNE CANDIDATURE
========================================== */

app.patch("/candidatures/:id/refuser", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Vérifier l'identifiant
    const candidatureId = Number(req.params.id);

    if (!Number.isSafeInteger(candidatureId) || candidatureId <= 0) {
        return res.status(400).json({
            erreur: "Identifiant de candidature invalide."
        });
    }

    // 3. Vérifier le rôle client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Accès réservé aux clients."
                });
            }

            // 4. Vérifier que le client possède le projet
            db.get(
                `SELECT c.id, c.statut
                 FROM candidatures AS c
                 JOIN projets AS p ON c.projet_id = p.id
                 WHERE c.id = ? AND p.client_id = ?`,
                [candidatureId, req.session.userId],
                (err, candidature) => {

                    if (err) {
                        return res.status(500).json({
                            erreur: "Erreur de vérification de la candidature."
                        });
                    }

                    if (!candidature) {
                        return res.status(403).json({
                            erreur: "Candidature introuvable ou accès interdit."
                        });
                    }

                    // 5. Refuser uniquement une candidature en attente
                    if (candidature.statut !== "En attente") {
                        return res.status(409).json({
                            erreur: "Cette candidature n'est plus en attente."
                        });
                    }

                    // 6. Enregistrer le refus dans SQLite
                    db.run(
                        `UPDATE candidatures
                         SET statut = ?
                         WHERE id = ? AND statut = ?`,
                        ["Refusée", candidatureId, "En attente"],
                        function (err) {

                            if (err) {
                                return res.status(500).json({
                                    erreur: "Impossible de refuser la candidature."
                                });
                            }

                            if (this.changes === 0) {
                                return res.status(409).json({
                                    erreur: "La candidature a déjà changé de statut."
                                });
                            }

                            return res.status(200).json({
                                message: "Candidature refusée avec succès.",
                                candidature_id: candidatureId,
                                statut: "Refusée"
                            });
                        }
                    );
                }
            );
        }
    );
});

// =====================================
// MODIFIER LE STATUT D'UN PROJET (CLIENT)
// =====================================

app.patch("/projets/:id", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Vérifier l'identifiant du projet
    const projetId = Number(req.params.id);
    const { statut } = req.body || {};

    if (!Number.isSafeInteger(projetId) || projetId <= 0) {
        return res.status(400).json({
            erreur: "Identifiant de projet invalide."
        });
    }

    // 3. Vérifier le nouveau statut
    const statutsAutorises = ["ouvert", "en cours", "terminé"];

    if (!statutsAutorises.includes(statut)) {
        return res.status(400).json({
            erreur: "Statut invalide."
        });
    }

    // 4. Vérifier le rôle client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                console.error("Erreur utilisateur :", err.message);

                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Accès réservé aux clients."
                });
            }

            // 5. Autoriser uniquement la fin d'une mission
            if (statut !== "terminé") {
                return res.status(400).json({
                    erreur: "Seul le passage à terminé est autorisé ici."
                });
            }

            // 6. Modifier uniquement un projet en cours appartenant au client
            db.run(
                `UPDATE projets
     SET statut = 'terminé'
     WHERE id = ?
       AND client_id = ?
       AND statut = 'en cours'`,
                [projetId, req.session.userId],
                function (err) {

                    if (err) {
                        console.error("Erreur modification :", err.message);

                        return res.status(500).json({
                            erreur: "Impossible de modifier le statut."
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(409).json({
                            erreur: "Projet introuvable, non autorisé ou statut incompatible."
                        });
                    }

                    return res.status(200).json({
                        message: "Mission terminée avec succès !",
                        id: projetId,
                        statut: "terminé"
                    });
                }
            );
        }
    );
});






// =====================================
// SUPPRIMER UN PROJET (CLIENT)
// =====================================



app.delete("/projets/:id", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Vérifier l'identifiant du projet
    const projetId = Number(req.params.id);

    if (!Number.isSafeInteger(projetId) || projetId <= 0) {
        return res.status(400).json({
            erreur: "Identifiant de projet invalide."
        });
    }

    const clientId = req.session.userId;

    // 3. Ouvrir une connexion SQLite dédiée
    const transactionDb = new sqlite3.Database(
        "./kertech.db",
        (err) => {

            if (err) {
                console.error("Connexion SQLite :", err.message);

                return res.status(500).json({
                    erreur: "Impossible d'ouvrir la base de données."
                });
            }

            let terminee = false;
            let transactionActive = false;

            // Fermer la connexion et répondre une seule fois
            function terminer(statut, resultat) {

                if (terminee) return;
                terminee = true;

                transactionDb.close((closeErr) => {

                    if (closeErr) {
                        console.error(
                            "Fermeture SQLite :",
                            closeErr.message
                        );
                    }

                    return res.status(statut).json(resultat);
                });
            }

            // Annuler uniquement une transaction active
            function annuler(statut, message) {

                console.log("AUDIT - Annulation :", {
                    statut,
                    message,
                    transactionActive
                });

                if (!transactionActive) {
                    return terminer(statut, {
                        erreur: message
                    });
                }

                transactionDb.run("ROLLBACK", (rollbackErr) => {

                    if (rollbackErr) {
                        console.error(
                            "ROLLBACK :",
                            rollbackErr.message
                        );

                        return terminer(500, {
                            erreur: "Erreur lors de l'annulation de la transaction."
                        });
                    }

                    transactionActive = false;

                    return terminer(statut, {
                        erreur: message
                    });
                });
            }

            // 4. Activer les clés étrangères
            transactionDb.run(
                "PRAGMA foreign_keys = ON",
                (err) => {

                    if (err) {
                        console.error(
                            "Clés étrangères :",
                            err.message
                        );

                        return terminer(500, {
                            erreur: "Erreur de configuration SQLite."
                        });
                    }

                    // 5. Démarrer la transaction
                    transactionDb.run(
                        "BEGIN IMMEDIATE TRANSACTION",
                        (err) => {

                            if (err) {
                                console.error(
                                    "BEGIN :",
                                    err.message
                                );

                                return terminer(500, {
                                    erreur: "Impossible de démarrer la transaction."
                                });
                            }

                            transactionActive = true;

                            console.log(
                                "AUDIT - Transaction démarrée"
                            );

                            // 6. Vérifier le rôle
                            transactionDb.get(
                                "SELECT role FROM utilisateurs WHERE id = ?",
                                [clientId],
                                (err, utilisateur) => {

                                    if (err) {
                                        console.error(
                                            "Utilisateur :",
                                            err.message
                                        );

                                        return annuler(
                                            500,
                                            "Erreur de vérification du compte."
                                        );
                                    }

                                    if (!utilisateur || utilisateur.role !== "client") {
                                        return annuler(
                                            403,
                                            "Accès réservé aux clients."
                                        );
                                    }


                                    // 7. Vérifier le propriétaire, le statut et les candidatures
                                    transactionDb.get(
                                        `SELECT p.id
                                     FROM projets p
                                    WHERE p.id = ?
                                    AND p.client_id = ?
                                   AND p.statut = 'ouvert'
                                   AND NOT EXISTS (
                                  SELECT 1
                                  FROM candidatures c
                                  WHERE c.projet_id = p.id
                                   )`,
                                        [projetId, clientId],
                                        (err, projet) => {

                                            if (err) {
                                                console.error(
                                                    "Projet :",
                                                    err.message
                                                );

                                                return annuler(
                                                    500,
                                                    "Erreur de vérification du projet."
                                                );
                                            }

                                            console.log(
                                                "AUDIT - Propriétaire :",
                                                { projetId, clientId, projet }
                                            );

                                            if (!projet) {
                                                return annuler(
                                                    404,
                                                    "Projet introuvable ou accès non autorisé."
                                                );
                                            }


                                                    transactionDb.run(
                                                        `DELETE FROM projets
                                                         WHERE id = ? AND client_id = ?`,
                                                        [projetId, clientId],
                                                        function (err) {

                                                            if (err) {
                                                                console.error(
                                                                    "Suppression :",
                                                                    err.message
                                                                );

                                                                return annuler(
                                                                    500,
                                                                    "Impossible de supprimer le projet."
                                                                );
                                                            }

                                                            console.log(
                                                                "AUDIT - Lignes supprimées :",
                                                                this.changes
                                                            );

                                                            if (this.changes === 0) {
                                                                return annuler(
                                                                    404,
                                                                    "Projet introuvable ou accès non autorisé."
                                                                );
                                                            }

                                                            // 10. Valider la transaction
                                                            transactionDb.run(
                                                                "COMMIT",
                                                                (err) => {

                                                                    if (err) {
                                                                        console.error(
                                                                            "COMMIT :",
                                                                            err.message
                                                                        );

                                                                        return annuler(
                                                                            500,
                                                                            "Impossible de finaliser la suppression."
                                                                        );
                                                                    }

                                                                    transactionActive = false;

                                                                    console.log(
                                                                        "AUDIT - COMMIT réussi"
                                                                    );

                                                                    return terminer(200, {
                                                                        message: "Projet supprimé avec succès !"
                                                                    });
                                                                }
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );




// =====================================
// SUPPRIMER UN PROJET (CLIENT)
// =====================================






/* =====================================
   CANDIDATURES REÇUES PAR LE CLIENT
===================================== */

app.get("/client/candidatures", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Vérifier le rôle client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {
            if (err) {
                console.error("Erreur utilisateur :", err.message);

                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Accès réservé aux clients."
                });
            }

            // 3. Récupérer les candidatures reçues
            const sql = `
                SELECT
                    c.*,
                    p.titre AS projet_titre
                FROM candidatures AS c
                INNER JOIN projets AS p
                    ON c.projet_id = p.id
                WHERE p.client_id = ?
                ORDER BY c.id DESC
            `;

            db.all(
                sql,
                [req.session.userId],
                (err, candidatures) => {

                    if (err) {
                        console.error(
                            "Erreur candidatures client :",
                            err.message
                        );

                        return res.status(500).json({
                            erreur: "Impossible de récupérer les candidatures."
                        });
                    }

                    return res.status(200).json(candidatures);
                }
            );
        }
    );
});



/* =====================================
   STATISTIQUES DU TABLEAU DE BORD CLIENT
===================================== */

app.get("/client/statistiques", (req, res) => {

    // 1. Vérifier la connexion
    if (!req.session.userId) {
        return res.status(401).json({
            erreur: "Vous devez être connecté."
        });
    }

    // 2. Vérifier que l'utilisateur est un client
    db.get(
        "SELECT role FROM utilisateurs WHERE id = ?",
        [req.session.userId],
        (err, utilisateur) => {

            if (err) {
                console.error("Erreur utilisateur :", err.message);

                return res.status(500).json({
                    erreur: "Erreur de vérification du compte."
                });
            }

            if (!utilisateur || utilisateur.role !== "client") {
                return res.status(403).json({
                    erreur: "Accès réservé aux clients."
                });
            }

            // 3. Calculer les statistiques du client connecté
            const clientId = req.session.userId;

            const sql = `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM projets
                        WHERE client_id = ?
                    ) AS totalProjets,

                    (
                        SELECT COUNT(*)
                        FROM candidatures
                        WHERE projet_id IN (
                            SELECT id
                            FROM projets
                            WHERE client_id = ?
                        )
                    ) AS totalCandidatures,

                    (
                        SELECT COUNT(*)
                        FROM projets
                        WHERE client_id = ?
                        AND LOWER(TRIM(statut)) = 'terminé'
                    ) AS projetsTermines
            `;

            db.get(
                sql,
                [clientId, clientId, clientId],
                (err, statistiques) => {

                    if (err) {
                        console.error(
                            "Erreur statistiques client :",
                            err.message
                        );

                        return res.status(500).json({
                            erreur: "Impossible de récupérer les statistiques."
                        });
                    }

                    return res.status(200).json(statistiques);
                }
            );
        }
    );
});


// Initialiser les tables avant de démarrer le serveur
initialiserDatabase(db)
    .then(() => {
        app.listen(PORT, () => {
            console.log(
                `Serveur KërTech Talent démarré sur le port ${PORT}`
            );
        });
    })
    .catch((err) => {
        console.error(
            "Erreur lors de l'initialisation SQLite :",
            err.message
        );

        process.exit(1);
    });
