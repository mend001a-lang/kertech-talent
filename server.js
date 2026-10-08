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
app.patch("/projets/:id", (req, res) => {
    const id = req.params.id;
    const { statut } = req.body;
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({
        erreur: "Identifiant de projet invalide"
    });
}
    if (!["Ouvert", "En cours", "Terminé"].includes(statut)) {
    return res.status(400).json({
        erreur: "Statut invalide"
    });
}
    
    db.run(
    "UPDATE projets SET statut = ? WHERE id = ?",
    [statut, id],
    function(err) {

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
    res.status(200).json({
    message: "Statut modifié avec succès",
    id: id,
    statut: statut
});
    }
);

});

app.listen(PORT, () => {
        console.log(`Serveur KërTech Talent démarré sur le port ${PORT}`);
});