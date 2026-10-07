const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./kertech.db");

db.run(`
    CREATE TABLE IF NOT EXISTS projets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titre TEXT NOT NULL,
        categorie TEXT NOT NULL,
        statut TEXT NOT NULL
    )
       
`);



db.all("SELECT * FROM projets", (err, projets) => {
    if (err) {
        console.error(err.message);
        return;
    }

    console.log(projets);
});