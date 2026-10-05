


// ==================================================
// SÉLECTION DES ÉLÉMENTS
// ==================================================

// Formulaire de contact
const formulaire = document.getElementById("formContact");
const nom = document.querySelector("#nom");
const email = document.querySelector("#email");
const message = document.querySelector("#message");
const messageErreur = document.querySelector("#messageErreur");

// Formulaire de projet
const publierProjet = document.querySelector("#publierProjet");
const titreProjet = document.querySelector("#titreProjet");
const descriptionProjet = document.querySelector("#descriptionProjet");
const budgetProjet = document.querySelector("#budgetProjet");
const categorieProjet = document.querySelector("#categorieProjet");

const projetsGrid = document.getElementById("projetsGrid");
const formProjet = document.querySelector("#formProjet");
const messageProjet = document.querySelector("#messageProjet");

// Messages d'erreur projet
const erreurTitre = document.querySelector("#erreurTitre");
const erreurDescription = document.querySelector("#erreurDescription");
const erreurBudget = document.querySelector("#erreurBudget");
const erreurCategorie = document.querySelector("#erreurCategorie");

// Recherche et filtre projets
const filtreCategorie = document.querySelector("#filtreCategorie");
const rechercheProjet = document.querySelector("#rechercheProjet");
const aucunProjet = document.querySelector("#aucunProjet");
const compteurProjets = document.querySelector("#compteurProjets");

// Freelances
const boutonsProfil = document.querySelectorAll(".voir-profil");
const rechercheFreelance = document.querySelector("#rechercheFreelance");
const freelancesGrid = document.getElementById("freelancesGrid");
const cartesFreelances = freelancesGrid.querySelectorAll("article");
const aucunFreelance = document.querySelector("#aucunFreelance");
const compteurFreelances = document.querySelector("#compteurFreelances");
const boutonsContacter =
    document.querySelectorAll(".contacter-freelance");


// ==================================================
// LOCALSTORAGE
// ==================================================

let projetsSauvegardes =
    JSON.parse(localStorage.getItem("projets")) || [];


// ==================================================
// PROFILS DES FREELANCES
// ==================================================

boutonsProfil.forEach(function(bouton) {

    bouton.addEventListener("click", function() {

        const carteFreelance =
            bouton.closest("article");

        const details =
            carteFreelance.querySelector(".details-profil");

        details.hidden = !details.hidden;

        bouton.textContent =
            details.hidden
                ? "Voir le profil"
                : "Masquer le profil";
    });

});


// ==================================================
// CONTACT DES FREELANCES
// ==================================================

boutonsContacter.forEach(function(bouton) {

    const carteFreelance =
        bouton.closest("article");

    const formulaireContact =
        carteFreelance.querySelector(
            ".form-contact-freelance"
        );

    const envoyerMessage =
        carteFreelance.querySelector(
            ".envoyer-message"
        );

    const messageFreelance =
        carteFreelance.querySelector(
            ".message-freelance"
        );

    const messageSucces =
        carteFreelance.querySelector(
            ".message-succes-freelance"
        );


    // Ouvrir / fermer
    bouton.addEventListener("click", function() {

        formulaireContact.hidden =
            !formulaireContact.hidden;

        bouton.textContent =
            formulaireContact.hidden
                ? "Contacter"
                : "Fermer";
    });


    // Effacer l'ancien succès
    messageFreelance.addEventListener(
        "input",
        function() {

            messageSucces.textContent = "";

        }
    );


    // Envoyer le message
    envoyerMessage.addEventListener(
        "click",
        function() {

            const messageUtilisateur =
                messageFreelance.value.trim();

            if (messageUtilisateur === "") {

                alert("Veuillez écrire un message.");
                return;
            }

            const nomFreelance =
                carteFreelance
                    .querySelector("h3")
                    .textContent;

            messageSucces.textContent =
                "Message envoyé à "
                + nomFreelance
                + " !";

            messageFreelance.value = "";
        }
    );

});


// ==================================================
// RECHERCHE DES FREELANCES
// ==================================================

function filtrerFreelances() {

    const texteRecherche =
        rechercheFreelance.value
            .toLowerCase()
            .trim();

    let nombreFreelancesVisibles = 0;

    cartesFreelances.forEach(function(carte) {

        const nomFreelance =
            carte.querySelector("h3")
                .textContent
                .toLowerCase();

        const paragraphes =
            carte.querySelectorAll("p");

        const competencesFreelance =
            paragraphes[1]
                .textContent
                .toLowerCase();

        const correspondRecherche =
            nomFreelance.includes(texteRecherche) ||
            competencesFreelance.includes(
                texteRecherche
            );

        if (correspondRecherche) {

            carte.style.display = "";
            nombreFreelancesVisibles++;

        } else {

            carte.style.display = "none";

        }

    });


    compteurFreelances.textContent =
        nombreFreelancesVisibles === 1
            ? "1 freelance trouvé"
            : nombreFreelancesVisibles
                + " freelances trouvés";


    aucunFreelance.hidden =
        nombreFreelancesVisibles !== 0;
}


rechercheFreelance.addEventListener(
    "input",
    filtrerFreelances
);


// ==================================================
// CANDIDATURE AUX PROJETS
// ==================================================



function activerCandidature(carteProjet, projet) {

    const formulaireCandidature =
        carteProjet.querySelector(
            ".form-candidature"
        );

    const bouton =
        carteProjet.querySelector(
            ".postuler-projet"
        );

    const messageCandidature =
        carteProjet.querySelector(
            ".message-candidature"
        );

    const envoyerCandidature =
        carteProjet.querySelector(
            ".envoyer-candidature"
        );

    const messageSuccesCandidature =
        carteProjet.querySelector(
            ".message-succes-candidature"
        );


    // Sécurité
    if (
        bouton === null ||
        formulaireCandidature === null ||
        messageCandidature === null ||
        envoyerCandidature === null ||
        messageSuccesCandidature === null
    ) {
        return;
    }


    // Ouvrir / fermer
    bouton.addEventListener(
        "click",
        function() {

            formulaireCandidature.hidden =
                !formulaireCandidature.hidden;

            bouton.textContent =
                formulaireCandidature.hidden
                    ? "Postuler"
                    : "Fermer";
        }
    );


    // Effacer l'ancien succès
    messageCandidature.addEventListener(
        "input",
        function() {

            messageSuccesCandidature.textContent =
                "";

        }
    );


    // Envoyer candidature
    envoyerCandidature.addEventListener(
        "click",
        function() {

            const messageUtilisateur =
                messageCandidature.value.trim();

            if (messageUtilisateur === "") {

                alert(
                    "Veuillez écrire un message de candidature."
                );

                return;
            }

            const titre =
                carteProjet
                    .querySelector("h3")
                    .textContent;

            messageSuccesCandidature.textContent =
                "Candidature envoyée pour le projet : "
                + titre
                + " !";
                if (!projet.listeCandidatures) {
    projet.listeCandidatures = [];
}
projet.listeCandidatures.push({
    message: messageUtilisateur,
    statut: "En attente"
});
       projet.candidatures =
    (projet.candidatures || 0) + 1;

const compteurCandidatures =
    carteProjet.querySelector(".compteur-candidatures");

if (compteurCandidatures) {
    compteurCandidatures.textContent =
        "Candidatures : " + projet.candidatures;
}

    localStorage.setItem(
    "projets",
    JSON.stringify(projetsSauvegardes)
);
if (projet.cleSauvegarde) {
    localStorage.setItem(
        projet.cleSauvegarde,
        JSON.stringify(projet)
    );
}
messageCandidature.value = "";

    }
);
}

// ==================================================
// AJOUT DU BOUTON POSTULER À UNE CARTE DYNAMIQUE
// ==================================================

function ajouterCandidature(carteProjet, projet) {

    const boutonPostuler =
        document.createElement("button");

    boutonPostuler.textContent = "Postuler";

    boutonPostuler.classList.add(
        "postuler-projet"
    );
   if (
    projet.statut === "En cours" ||
    projet.statut === "Terminé"
) {
    boutonPostuler.disabled = true;
}


    const formulaireCandidature =
        document.createElement("div");

    formulaireCandidature.classList.add(
        "form-candidature"
    );

    formulaireCandidature.hidden = true;


    formulaireCandidature.innerHTML = `
        <textarea
            class="message-candidature"
            placeholder="Présentez votre candidature..."
        ></textarea>

        <button class="envoyer-candidature">
            Envoyer ma candidature
        </button>

        <p class="message-succes-candidature"></p>
    `;


    carteProjet.appendChild(
        boutonPostuler
    );

    carteProjet.appendChild(
        formulaireCandidature
    );
    const compteurExemple =
    carteProjet.querySelector(
        ".compteur-candidatures"
    );

compteurExemple.textContent =
    "Candidatures : " + projet.candidatures;

activerCandidature(
    carteProjet,
    projet
);
}

// ==================================================
// SUPPRESSION D'UN PROJET SAUVEGARDÉ
// ==================================================

function ajouterSuppression(
    carteProjet,
    projet
) {

    const boutonSupprimer =
        document.createElement("button");

    boutonSupprimer.textContent =
        "Supprimer";

    boutonSupprimer.classList.add(
        "btn-supprimer"
    );


    boutonSupprimer.addEventListener(
        "click",
        function() {

            const confirmation =
                confirm(
                    "Voulez-vous vraiment supprimer ce projet ?"
                );

            if (!confirmation) {
                return;
            }


            projetsSauvegardes =
                projetsSauvegardes.filter(
                    function(projetSauvegarde) {

                        return (
                            projetSauvegarde.id !==
                            projet.id
                        );

                    }
                );


            localStorage.setItem(
                "projets",
                JSON.stringify(
                    projetsSauvegardes
                )
            );


            carteProjet.remove();


            messageProjet.textContent =
                "Le projet a bien été supprimé.";

            messageProjet.classList.add(
                "succes"
            );


            filtrerProjets();
        }
    );


    carteProjet.appendChild(
        boutonSupprimer
    );
}


// ==================================================
// CRÉATION D'UNE CARTE PROJET
// ==================================================

function creerCarteProjet(projet) {

    const nouvelleCarte =
        document.createElement("article");


    // =========================
    // TITRE
    // =========================

    const nouveauTitre =
        document.createElement("h3");

    nouveauTitre.textContent =
        projet.titre;


    // =========================
    // DESCRIPTION
    // =========================

    const nouvelleDescription =
        document.createElement("p");

    nouvelleDescription.textContent =
        projet.description;


    // =========================
    // BUDGET
    // =========================

    const nouveauBudget =
        document.createElement("p");

    nouveauBudget.textContent =
        "Budget : "
        + projet.budget
        + " €";


    // =========================
    // CATÉGORIE
    // =========================

    const nouvelleCategorie =
        document.createElement("p");

    nouvelleCategorie.textContent =
        "Catégorie : "
        + projet.categorie;

    nouvelleCategorie.classList.add(
        "categorie-projet"
    );


    // =========================
    // STATUT
    // =========================

    const nouveauStatut =
        document.createElement("p");

    nouveauStatut.textContent =
    "Statut : " + (projet.statut || "Ouvert");

    nouveauStatut.classList.add(
        "statut-projet"
    );
    const compteurCandidatures =
    document.createElement("p");

compteurCandidatures.textContent =
    "Candidatures : " + (projet.candidatures || 0);

compteurCandidatures.classList.add(
    "compteur-candidatures"
);
const boutonVoirCandidatures =
    document.createElement("button");

boutonVoirCandidatures.textContent =
    "Voir les candidatures";

boutonVoirCandidatures.classList.add(
    "voir-candidatures"
);
const listeCandidatures =
    document.createElement("div");

listeCandidatures.classList.add(
    "liste-candidatures"
);

listeCandidatures.hidden = true;
    // =========================
// BOUTON CHANGER LE STATUT
// =========================

const boutonStatut =
    document.createElement("button");

boutonStatut.textContent =
    "Changer le statut";

boutonStatut.classList.add(
    "changer-statut"
);


    // =========================
    // AJOUT DU CONTENU
    // =========================

    nouvelleCarte.appendChild(
        nouveauTitre
    );

    nouvelleCarte.appendChild(
        nouvelleDescription
    );

    nouvelleCarte.appendChild(
        nouveauBudget
    );

    nouvelleCarte.appendChild(
        nouvelleCategorie
    );

    nouvelleCarte.appendChild(
        nouveauStatut
    );
    nouvelleCarte.appendChild(
    compteurCandidatures
);
nouvelleCarte.appendChild(
    boutonVoirCandidatures
);
nouvelleCarte.appendChild(
    listeCandidatures
);
ajouterCandidature(
    nouvelleCarte,
    projet
);


const boutonPostuler =
    nouvelleCarte.querySelector(".postuler-projet");
boutonVoirCandidatures.addEventListener(
    "click",
    function() {
        listeCandidatures.innerHTML = "";
        (projet.listeCandidatures || []).forEach(
            function(candidature) {
const message = document.createElement("p");
message.textContent =
    typeof candidature === "string"
        ? candidature
        : candidature.message + " — " + candidature.statut;
const boutonAccepter =
    document.createElement("button");

boutonAccepter.textContent = "Accepter";


boutonAccepter.classList.add(
    "accepter-candidature"
);
const boutonRefuser =
    document.createElement("button");

boutonRefuser.textContent = "Refuser";

boutonRefuser.classList.add(
    "refuser-candidature"
);
if (
    typeof candidature !== "string" &&
    (
        candidature.statut === "Acceptée" ||
        candidature.statut === "Refusée"
    )
) {
    boutonAccepter.disabled = true;
    boutonRefuser.disabled = true;
}
listeCandidatures.appendChild(message);
listeCandidatures.appendChild(boutonAccepter);
listeCandidatures.appendChild(boutonRefuser);
boutonAccepter.addEventListener(
    "click",
    function() {
        if (typeof candidature !== "string") {
    candidature.statut = "Acceptée";
    projet.statut = "En cours";
    nouveauStatut.textContent = "Statut : En cours";
    boutonPostuler.textContent = "Postuler";
    nouvelleCarte.querySelector(".form-candidature").hidden = true;
    localStorage.setItem(
    "projets",
    JSON.stringify(projetsSauvegardes)   
);
}
boutonAccepter.disabled = true;
        boutonRefuser.disabled = true;

        message.textContent =
    (typeof candidature === "string"
        ? candidature
        : candidature.message)
    + " — Acceptée";
            
    }
    
);
boutonRefuser.addEventListener(
    "click",
    function() {
        if (typeof candidature !== "string") {
    candidature.statut = "Refusée";
    localStorage.setItem(
    "projets",
    JSON.stringify(projetsSauvegardes)
);
}
boutonAccepter.disabled = true;
boutonRefuser.disabled = true;
        message.textContent =
    (typeof candidature === "string"
        ? candidature
        : candidature.message)
    + " — Refusée";
    }
);
            }
            
        );
        
        listeCandidatures.hidden =
            !listeCandidatures.hidden;
            
    }
);
    nouvelleCarte.appendChild(
    boutonStatut
);

boutonStatut.addEventListener("click", function() {
if (nouveauStatut.textContent === "Statut : Ouvert") {

    nouveauStatut.textContent =
        "Statut : En cours";

    projet.statut = "En cours";
    boutonPostuler.disabled = true;
    const formulaireCandidature =
    nouvelleCarte.querySelector(".form-candidature");

formulaireCandidature.hidden = true;
boutonPostuler.textContent = "Postuler";



        
} else if (nouveauStatut.textContent === "Statut : En cours") {

    nouveauStatut.textContent =
        "Statut : Terminé";

    projet.statut = "Terminé";
     boutonPostuler.disabled = true;
} else {
    return;
}
    

    localStorage.setItem(
        "projets",
        JSON.stringify(projetsSauvegardes)
    );

});



    // =========================
    // BOUTON SUPPRIMER
    // =========================

    ajouterSuppression(
        nouvelleCarte,
        projet
    );


    // =========================
    // CANDIDATURE
    // =========================

  


    // =========================
    // AJOUT À LA PAGE
    // =========================

    projetsGrid.appendChild(
        nouvelleCarte
    );
}
function afficherProjetSauvegarde(projet) {

    creerCarteProjet(projet);

}

projetsSauvegardes.forEach(
    function(projet) {

        afficherProjetSauvegarde(projet);

    }
);

// ==================================================
// ACTIVE LES CANDIDATURES DES PROJETS HTML
// ==================================================

document
    .querySelectorAll("#projetsGrid article")
    .forEach(function(carteProjet) {

        // Les cartes dynamiques ont déjà été activées.
        // On active seulement les cartes HTML.
      if (
    !carteProjet.querySelector(
        ".btn-supprimer"
    )
) {

const projetExemple = JSON.parse(
    localStorage.getItem(
        "projetExemple-" +
        carteProjet.querySelector("h3").textContent.trim()
    )
) || {
    candidatures: 0,
    listeCandidatures: [],
    cleSauvegarde:
        "projetExemple-" +
        carteProjet.querySelector("h3").textContent.trim()
};


activerCandidature(
    carteProjet,
    projetExemple
);
}

    });


// ==================================================
// FORMULAIRE DE CONTACT PRINCIPAL
// ==================================================

formulaire.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const nomUtilisateur =
            nom.value;

        const emailUtilisateur =
            email.value;

        const messageUtilisateur =
            message.value;


        if (
            nomUtilisateur.trim() === ""
        ) {

            messageErreur.textContent =
                "Veuillez saisir votre nom.";

            messageErreur.classList.remove(
                "succes"
            );

            messageErreur.classList.add(
                "erreur"
            );

            return;
        }


        if (
            emailUtilisateur.trim() === ""
        ) {

            messageErreur.textContent =
                "Veuillez saisir votre email.";

            messageErreur.classList.remove(
                "succes"
            );

            messageErreur.classList.add(
                "erreur"
            );

            return;
        }


        if (
            messageUtilisateur.trim() === ""
        ) {

            messageErreur.textContent =
                "Veuillez saisir votre message.";

            messageErreur.classList.remove(
                "succes"
            );

            messageErreur.classList.add(
                "erreur"
            );

            return;
        }


        if (
            !emailUtilisateur.includes("@")
        ) {

            messageErreur.textContent =
                "Veuillez saisir une adresse email valide.";

            messageErreur.classList.remove(
                "succes"
            );

            messageErreur.classList.add(
                "erreur"
            );

            return;
        }


        messageErreur.classList.remove(
            "erreur"
        );

        messageErreur.classList.add(
            "succes"
        );

        messageErreur.textContent =
            "Votre message a bien été envoyé !";


        formulaire.reset();
    }
);


// ==================================================
// OUVERTURE DU FORMULAIRE PROJET
// ==================================================

publierProjet.addEventListener(
    "click",
    function(event) {

        event.preventDefault();

       

        formProjet.hidden = false;

       

        messageProjet.textContent = "";
    }
);


// ==================================================
// PUBLICATION D'UN PROJET
// ==================================================

formProjet.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const titre =
            titreProjet.value;

        const description =
            descriptionProjet.value;

        const budget =
            budgetProjet.value;

        const categorie =
            categorieProjet.value;


        let formulaireValide = true;


        // Efface les anciennes erreurs
        erreurTitre.textContent = "";
        erreurDescription.textContent = "";
        erreurBudget.textContent = "";
        erreurCategorie.textContent = "";


        // Titre
        if (titre.trim() === "") {

            erreurTitre.textContent =
                "Veuillez saisir un titre.";

            erreurTitre.classList.add(
                "erreur"
            );

            formulaireValide = false;
        }


        // Description
        if (
            description.trim() === ""
        ) {

            erreurDescription.textContent =
                "Veuillez saisir une description.";

            erreurDescription.classList.add(
                "erreur"
            );

            formulaireValide = false;
        }


        // Budget
        if (
            budget === "" ||
            Number(budget) < 1
        ) {

            erreurBudget.textContent =
                "Veuillez saisir un budget valide.";

            erreurBudget.classList.add(
                "erreur"
            );

            formulaireValide = false;
        }


        // Catégorie
        if (categorie === "") {

            erreurCategorie.textContent =
                "Veuillez choisir une catégorie.";

            erreurCategorie.classList.add(
                "erreur"
            );

            formulaireValide = false;
        }


        if (!formulaireValide) {
            return;
        }


        // Création de l'objet projet
    const projet = {

    id: Date.now(),
    titre: titre.trim(),
    description:
        description.trim(),
    budget: budget,
    categorie: categorie,
    statut: "Ouvert",
    candidatures: 0

};


        // Sauvegarde
        projetsSauvegardes.push(
            projet
        );

        localStorage.setItem(
            "projets",
            JSON.stringify(
                projetsSauvegardes
            )
        );


        // Affichage de la carte
        creerCarteProjet(projet);
        // ==================================================
// CHARGEMENT DES PROJETS SAUVEGARDÉS
// ==================================================

function afficherProjetSauvegarde(projet) {

    creerCarteProjet(projet);

}

projetsSauvegardes.forEach(
    function(projet) {

        afficherProjetSauvegarde(projet);

    }
);


        // Réinitialisation
        formProjet.reset();
        formProjet.hidden = true;


        // Succès
        messageProjet.textContent =
            "Votre projet a bien été publié !";

        messageProjet.classList.add(
            "succes"
        );


        filtrerProjets();
    }
);


// ==================================================
// RECHERCHE ET FILTRE DES PROJETS
// ==================================================

function filtrerProjets() {

    const texteRecherche =
        rechercheProjet.value
            .toLowerCase()
            .trim();

    const categorieChoisie =
        filtreCategorie.value;

    const cartesProjets =
        projetsGrid.querySelectorAll(
            "article"
        );

    let nombreProjetsVisibles = 0;


    cartesProjets.forEach(
        function(carte) {

            const titreElement =
                carte.querySelector("h3");

            const categorieCarte =
                carte.querySelector(
                    ".categorie-projet"
                );


            if (
                titreElement === null ||
                categorieCarte === null
            ) {
                return;
            }


            const titreCarte =
                titreElement.textContent
                    .toLowerCase();


            const categorieCarteTexte =
                categorieCarte.textContent
                    .replace(
                        "Catégorie : ",
                        ""
                    )
                    .trim();


            const correspondRecherche =
                titreCarte.includes(
                    texteRecherche
                );


            const correspondCategorie =
                categorieChoisie === "tous" ||
                categorieChoisie ===
                    categorieCarteTexte;


            if (
                correspondRecherche &&
                correspondCategorie
            ) {

                carte.style.display = "";
                nombreProjetsVisibles++;

            } else {

                carte.style.display = "none";

            }

        }
    );


    compteurProjets.textContent =
        nombreProjetsVisibles === 1
            ? "1 projet trouvé"
            : nombreProjetsVisibles
                + " projets trouvés";


    aucunProjet.hidden =
        nombreProjetsVisibles !== 0;
}


// Recherche projet
rechercheProjet.addEventListener(
    "input",
    filtrerProjets
);


// Filtre catégorie
filtreCategorie.addEventListener(
    "change",
    filtrerProjets
);


// ==================================================
// AFFICHAGE INITIAL DES COMPTEURS
// ==================================================

filtrerFreelances();
filtrerProjets();