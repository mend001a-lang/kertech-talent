const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const PORT = 3000;

app.get("/", (req, res) => {
res.send("Bienvenue sur le serveur KërTech Talent !");
});

app.get("/projets", (req, res) => {
    const projets = [
        {
            id: 1,
            titre: "Créer un site vitrine",
            categorie: "Développement web",
            statut: "Ouvert"
        },
        {
            id: 2,
            titre: "Créer une identité visuelle",
            categorie: "Graphisme",
            statut: "Ouvert"
        },
        {
            id: 3,
            titre: "Rédiger des contenus web",
            categorie: "Rédaction",
            statut: "Ouvert"
        }
    ];

    res.json(projets);
});

app.listen(PORT, () => {
        console.log(`Serveur KërTech Talent démarré sur le port ${PORT}`);
});