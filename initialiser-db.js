function initialiserDatabase(db) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("PRAGMA foreign_keys = ON");

            db.run(`
                CREATE TABLE IF NOT EXISTS utilisateurs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nom TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    mot_de_passe TEXT NOT NULL,
                    role TEXT NOT NULL
                        CHECK(role IN ('freelance', 'client'))
                )
            `, (err) => {
                if (err) {
                    return reject(err);
                }

                db.run(`
                    CREATE TABLE IF NOT EXISTS projets (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        titre TEXT NOT NULL,
                        categorie TEXT NOT NULL,
                        statut TEXT NOT NULL,
                        description TEXT,
                        budget REAL,
                        client_id INTEGER
                    )
                `, (err) => {
                    if (err) {
                        return reject(err);
                    }

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
                            return reject(err);
                        }

                        console.log("Tables SQLite initialisées !");
                        resolve();
                    });
                });
            });
        });
    });
}

module.exports = initialiserDatabase;