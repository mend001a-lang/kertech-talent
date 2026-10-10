const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();
const db = new sqlite3.Database("./kertech.db");
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
res.send("Bienvenue sur le serveur KërTech Talent !");
});
app.post("/inscription", async (req, res) => {
    const { nom, email, mot_de_passe, role } = req.body;
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
const sql = "INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)";

db.run(
    sql,
    [nom.trim(), email.trim().toLowerCase(), motDePasseHash, role],
    function (err) {

        // 1. Vérifier les erreurs
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

        // 2. Confirmer la création du compte
        return res.status(201).json({
            message: "Compte créé avec succès !",
            id: this.lastID
        });

    }
);
} catch (err) {
    console.error("Erreur lors du hachage :", err.message);

    return res.status(500).json({
        erreur: "Erreur interne lors de l'inscription."
    });
}

});
    // =========================
// CONNEXION KËRTECH TALENT
// =========================

app.post("/connexion", async (req, res) => {

    const { email, mot_de_passe } = req.body;
    if (
    typeof email !== "string" || email.trim() === "" ||
    typeof mot_de_passe !== "string" || mot_de_passe === ""
) {
    return res.status(400).json({
        erreur: "Email et mot de passe obligatoires."
        
    });
    
}
    const sql = "SELECT * FROM utilisateurs WHERE email = ?";
    db.get(sql, [email.trim().toLowerCase()], async (err, utilisateur) => {
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


try {
const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
if (!motDePasseValide) {
    return res.status(401).json({
        erreur: "Email ou mot de passe incorrect."
    });
}
} catch (err) {
    console.error("Erreur bcrypt :", err.message);

    return res.status(500).json({
        erreur: "Erreur interne du serveur."
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







app.get("/projets", (req, res) => {
    db.all("SELECT * FROM projets", (err, projets) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ erreur: "Erreur serveur" });
        }

        res.json(projets);
    });
});
app.post("/projets", (req, res) => {
    console.log(req.body);
   const { titre, description, budget, categorie, statut } = req.body;
   db.run(
    `INSERT INTO projets (titre, description, budget, categorie, statut) VALUES (?, ?, ?, ?, ?)`,
    [titre, description, budget, categorie, statut],
    function (err) {
    if (err) {
        console.error(err.message);
        return res.status(500).json({
            erreur: "Erreur lors de la création du projet"
            
        });
        
    }

    console.log("Projet enregistré avec l'id :", this.lastID);
    res.status(201).json({
    message: "Projet créé avec succès",
    id: this.lastID
});
}
);

   
});
// Modification du statut d'un projet
// ======================================
// MODIFIER LE STATUT D'UN PROJET (PATCH)
// ======================================

app.patch("/projets/:id", (req, res) => {

    const id = Number(req.params.id);
    const { statut } = req.body;

    // Vérifier l'identifiant
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            erreur: "Identifiant de projet invalide"
        });
    }

    // Vérifier le statut
    if (!["Ouvert", "En cours", "Terminé"].includes(statut)) {
        return res.status(400).json({
            erreur: "Statut invalide"
        });
    }

    // Modifier le statut dans SQLite
    db.run(
        "UPDATE projets SET statut = ? WHERE id = ?",
        [statut, id],
        function (err) {

            if (err) {
                console.error(err.message);

                return res.status(500).json({
                    erreur: "Impossible de modifier le statut"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    erreur: "Projet introuvable"
                });
            }

            return res.status(200).json({
                message: "Statut modifié avec succès",
                id: id,
                statut: statut
            });
        }
    );
});


// ======================================
// SUPPRIMER UN PROJET (DELETE)
// ======================================

app.delete("/projets/:id", (req, res) => {

    const id = Number(req.params.id);

    // Vérifier l'identifiant
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            erreur: "Identifiant de projet invalide."
        });
    }

    const sql = "DELETE FROM projets WHERE id = ?";

    // Supprimer le projet dans SQLite
    db.run(sql, [id], function (err) {

        if (err) {
            console.error(err.message);

            return res.status(500).json({
                erreur: "Erreur lors de la suppression du projet."
            });
        }

        // Vérifier si le projet existe
        if (this.changes === 0) {
            return res.status(404).json({
                erreur: "Projet introuvable."
            });
        }

        // Confirmer la suppression
        return res.status(200).json({
            message: "Projet supprimé avec succès."
        });
    });
});


// ======================================
// DÉMARRAGE DU SERVEUR
// ======================================


app.listen(PORT, () => {
        console.log(`Serveur KërTech Talent démarré sur le port ${PORT}`);
});