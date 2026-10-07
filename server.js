const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const db = new sqlite3.Database("./kertech.db");
app.use(cors());
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

app.listen(PORT, () => {
        console.log(`Serveur KërTech Talent démarré sur le port ${PORT}`);
});