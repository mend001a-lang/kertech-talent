console.log("KërTech Talent : JavaScript connecté !");

// =========================
// SÉLECTION DES ÉLÉMENTS
// =========================



// Formulaire de contact
const formulaire = document.getElementById("formContact");
const nom = document.querySelector("#nom");
const email = document.querySelector("#email");
const message = document.querySelector("#message");
const messageErreur = document.querySelector("#messageErreur");
const boutonProfil = document.querySelector(".voir-profil");

// Formulaire de projet
const publierProjet = document.querySelector("#publierProjet");
const titreProjet = document.querySelector("#titreProjet");
const descriptionProjet = document.querySelector("#descriptionProjet");
const budgetProjet = document.querySelector("#budgetProjet");
const categorieProjet = document.querySelector("#categorieProjet");

const projetsGrid = document.getElementById("projetsGrid");
const formProjet = document.querySelector("#formProjet");
const messageProjet = document.querySelector("#messageProjet");

// Messages d'erreur
const erreurTitre = document.querySelector("#erreurTitre");
const erreurDescription = document.querySelector("#erreurDescription");
const erreurBudget = document.querySelector("#erreurBudget");
const erreurCategorie = document.querySelector("#erreurCategorie");

// Recherche et filtre
const filtreCategorie = document.querySelector("#filtreCategorie");
const rechercheProjet = document.querySelector("#rechercheProjet");
const aucunProjet = document.querySelector("#aucunProjet");
const compteurProjets = document.querySelector("#compteurProjets");
const detailsProfil = document.querySelector(".details-profil");
const boutonsProfil = document.querySelectorAll(".voir-profil");




let projetsSauvegardes =
    JSON.parse(localStorage.getItem("projets")) || [];

 boutonsProfil.forEach(function(bouton) {

    bouton.addEventListener("click", function() {

        const carteFreelance = bouton.closest("article");
        const details = carteFreelance.querySelector(".details-profil");

        details.hidden = !details.hidden;

        bouton.textContent =
            details.hidden ? "Voir le profil" : "Masquer le profil";

    });

});

    // =========================
// CHARGEMENT DES PROJETS SAUVEGARDÉS
// =========================

function afficherProjetSauvegarde(projet) {

    // Création de la carte
    const nouvelleCarte = document.createElement("article");

    // Titre
    const nouveauTitre = document.createElement("h3");
    nouveauTitre.textContent = projet.titre;

    // Description
    const nouvelleDescription = document.createElement("p");
    nouvelleDescription.textContent = projet.description;

    // Budget
    const nouveauBudget = document.createElement("p");
    nouveauBudget.textContent =
        "Budget : " + projet.budget + " €";

    // Catégorie
    const nouvelleCategorie = document.createElement("p");
    nouvelleCategorie.textContent =
        "Catégorie : " + projet.categorie;

    nouvelleCategorie.classList.add("categorie-projet");


    // Ajout des informations dans la carte
    nouvelleCarte.appendChild(nouveauTitre);
    nouvelleCarte.appendChild(nouvelleDescription);
    nouvelleCarte.appendChild(nouveauBudget);
    nouvelleCarte.appendChild(nouvelleCategorie);


    // =========================
    // BOUTON SUPPRIMER
    // =========================

    const boutonSupprimer = document.createElement("button");

    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.classList.add("btn-supprimer");


    boutonSupprimer.addEventListener("click", function() {

        const confirmation = confirm(
            "Voulez-vous vraiment supprimer ce projet ?"
        );

        if (confirmation) {

            // Supprime le projet du tableau
            projetsSauvegardes = projetsSauvegardes.filter(
                function(projetSauvegarde) {
                    return projetSauvegarde.id !== projet.id;
                }
            );

            // Met à jour localStorage
            localStorage.setItem(
                "projets",
                JSON.stringify(projetsSauvegardes)
            );

            // Supprime la carte de la page
            nouvelleCarte.remove();

            // Message de confirmation
            messageProjet.textContent =
                "Le projet a bien été supprimé.";

            messageProjet.classList.add("succes");

            // Recalcule recherche + filtre
            filtrerProjets();
        }
    });


    // Ajout du bouton à la carte
    nouvelleCarte.appendChild(boutonSupprimer);


    // Ajout de la carte dans la grille
    projetsGrid.appendChild(nouvelleCarte);
}


// Recréation des projets enregistrés
projetsSauvegardes.forEach(function(projet) {
    afficherProjetSauvegarde(projet);
});

// =========================
// FORMULAIRE DE CONTACT
// =========================

formulaire.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomUtilisateur = nom.value;
    const emailUtilisateur = email.value;
    const messageUtilisateur = message.value;

    // Validation du nom
    if (nomUtilisateur.trim() === "") {
        messageErreur.textContent = "Veuillez saisir votre nom.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    // Validation de l'email
    if (emailUtilisateur.trim() === "") {
        messageErreur.textContent = "Veuillez saisir votre email.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    // Validation du message
    if (messageUtilisateur.trim() === "") {
        messageErreur.textContent = "Veuillez saisir votre message.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    // Vérification simple de l'adresse email
    if (!emailUtilisateur.includes("@")) {
        messageErreur.textContent = "Veuillez saisir une adresse email valide.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    // Message de succès
    messageErreur.classList.remove("erreur");
    messageErreur.classList.add("succes");
    messageErreur.textContent = "Votre message a bien été envoyé !";

    formulaire.reset();
});


// =========================
// OUVERTURE DU FORMULAIRE PROJET
// =========================

publierProjet.addEventListener("click", function(event) {
    event.preventDefault();

    formProjet.hidden = false;

    // Efface l'ancien message
    messageProjet.textContent = "";
});


// =========================
// PUBLICATION D'UN PROJET
// =========================

formProjet.addEventListener("submit", function(event) {
    event.preventDefault();

    const titre = titreProjet.value;
    const description = descriptionProjet.value;
    const budget = budgetProjet.value;
    const categorie = categorieProjet.value;

    let formulaireValide = true;

    // Effacement des anciens messages d'erreur
    erreurTitre.textContent = "";
    erreurDescription.textContent = "";
    erreurBudget.textContent = "";
    erreurCategorie.textContent = "";

    // Validation du titre
    if (titre.trim() === "") {
        erreurTitre.textContent = "Veuillez saisir un titre.";
        erreurTitre.classList.add("erreur");
        formulaireValide = false;
    }

    // Validation de la description
    if (description.trim() === "") {
        erreurDescription.textContent = "Veuillez saisir une description.";
        erreurDescription.classList.add("erreur");
        formulaireValide = false;
    }

    // Validation du budget
    if (budget === "" || budget < 1) {
        erreurBudget.textContent = "Veuillez saisir un budget valide.";
        erreurBudget.classList.add("erreur");
        formulaireValide = false;
    }

    // Validation de la catégorie
    if (categorie === "") {
        erreurCategorie.textContent = "Veuillez choisir une catégorie.";
        erreurCategorie.classList.add("erreur");
        formulaireValide = false;
    }

    // Arrêt si le formulaire contient une erreur
    if (formulaireValide === false) {
        return;
    }
   const projet = {
    id: Date.now(),
    titre: titre,
    description: description,
    budget: budget,
    categorie: categorie
};
projetsSauvegardes.push(projet);
localStorage.setItem(
    "projets",
    JSON.stringify(projetsSauvegardes)
);


    // =========================
    // CRÉATION DE LA CARTE
    // =========================

    const nouvelleCarte = document.createElement("article");

    // Titre
    const nouveauTitre = document.createElement("h3");
    nouveauTitre.textContent = titre;

    // Description
    const nouvelleDescription = document.createElement("p");
    nouvelleDescription.textContent = description;

    // Budget
    const nouveauBudget = document.createElement("p");
    nouveauBudget.textContent = "Budget : " + budget + " €";

    // Catégorie
    const nouvelleCategorie = document.createElement("p");
    nouvelleCategorie.textContent = "Catégorie : " + categorie;
    nouvelleCategorie.classList.add("categorie-projet");


    // =========================
    // AJOUT DANS LA CARTE
    // =========================

    nouvelleCarte.appendChild(nouveauTitre);
    nouvelleCarte.appendChild(nouvelleDescription);
    nouvelleCarte.appendChild(nouveauBudget);
    nouvelleCarte.appendChild(nouvelleCategorie);


    // =========================
    // BOUTON SUPPRIMER
    // =========================

    const boutonSupprimer = document.createElement("button");

    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.classList.add("btn-supprimer");

    boutonSupprimer.addEventListener("click", function() {

        const confirmation = confirm(
            "Voulez-vous vraiment supprimer ce projet ?"
        );

       if (confirmation) {

    // Supprime le projet du tableau
    projetsSauvegardes = projetsSauvegardes.filter(function(projetSauvegarde) {
        return projetSauvegarde.id !== projet.id;
    });

    // Met à jour le localStorage
    localStorage.setItem(
        "projets",
        JSON.stringify(projetsSauvegardes)
    );

    // Supprime la carte de la page
    nouvelleCarte.remove();

    messageProjet.textContent =
        "Le projet a bien été supprimé.";

    messageProjet.classList.add("succes");
}
    });

    nouvelleCarte.appendChild(boutonSupprimer);


    // =========================
    // AJOUT DU PROJET
    // =========================

    projetsGrid.appendChild(nouvelleCarte);

    // Réinitialisation du formulaire
    formProjet.reset();

    // Masquage du formulaire
    formProjet.hidden = true;

    // Message de succès
    messageProjet.textContent =
        "Votre projet a bien été publié !";

    messageProjet.classList.add("succes");

    // Applique immédiatement la recherche
    // et la catégorie actuellement sélectionnées
    filtrerProjets();
});


function filtrerProjets() {

    const texteRecherche =
        rechercheProjet.value.toLowerCase();

    const categorieChoisie =
        filtreCategorie.value;

    const cartesProjets =
        projetsGrid.querySelectorAll("article");

    // Compteur des cartes visibles
    let nombreProjetsVisibles = 0;

    cartesProjets.forEach(function(carte) {

        const titreElement =
            carte.querySelector("h3");

        const categorieCarte =
            carte.querySelector(".categorie-projet");

        if (
            titreElement === null ||
            categorieCarte === null
        ) {
            return;
        }

        const titreCarte =
            titreElement.textContent.toLowerCase();

        const categorieCarteTexte =
            categorieCarte.textContent.replace(
                "Catégorie : ",
                ""
            );

        const correspondRecherche =
            titreCarte.includes(texteRecherche);

        const correspondCategorie =
            categorieChoisie === "tous" ||
            categorieChoisie === categorieCarteTexte;

        if (
            correspondRecherche &&
            correspondCategorie
        ) {
            carte.style.display = "";

            // Une carte correspond
            nombreProjetsVisibles++;
        } else {
            carte.style.display = "none";
        }
    });

    // Affichage du message si aucune carte ne correspond
compteurProjets.textContent =
    nombreProjetsVisibles === 1
        ? "1 projet trouvé"
        : nombreProjetsVisibles + " projets trouvés";
    if (nombreProjetsVisibles === 0) {
        aucunProjet.hidden = false;
    } else {
        aucunProjet.hidden = true;
    }
}

// Recherche pendant la saisie
rechercheProjet.addEventListener(
    "input",
    filtrerProjets
);

// Filtre lors du changement de catégorie
filtreCategorie.addEventListener(
    "change",
    filtrerProjets
);