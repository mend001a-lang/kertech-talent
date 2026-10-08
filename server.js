const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const db = new sqlite3.Database("./kertech.db");
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
res.send("Bienvenue sur le serveur KërTech Talent !");
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

app.listen(PORT, () => {
        console.log(`Serveur KërTech Talent démarré sur le port ${PORT}`);
});