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


// =========================
// RECHERCHE + FILTRE
// =========================

function filtrerProjets() {

    // Texte tapé dans la recherche
    const texteRecherche =
        rechercheProjet.value.toLowerCase();

    // Catégorie choisie
    const categorieChoisie =
        filtreCategorie.value;

    // Toutes les cartes
    const cartesProjets =
        projetsGrid.querySelectorAll("article");


    // Parcours de chaque carte
    cartesProjets.forEach(function(carte) {

        // Récupération du titre
        const titreElement =
            carte.querySelector("h3");

        // Récupération de la catégorie
        const categorieCarte =
            carte.querySelector(".categorie-projet");


        // Sécurité si une carte n'a pas
        // les éléments nécessaires
        if (
            titreElement === null ||
            categorieCarte === null
        ) {
            return;
        }


        // Texte du titre en minuscules
        const titreCarte =
            titreElement.textContent.toLowerCase();


        // Récupération du nom de la catégorie
        const categorieCarteTexte =
            categorieCarte.textContent.replace(
                "Catégorie : ",
                ""
            );


        // Vérifie la recherche
        const correspondRecherche =
            titreCarte.includes(texteRecherche);


        // Vérifie la catégorie
        const correspondCategorie =
            categorieChoisie === "tous" ||
            categorieChoisie === categorieCarteTexte;


        // Les DEUX conditions doivent être vraies
        if (
            correspondRecherche &&
            correspondCategorie
        ) {
            carte.style.display = "";
        } else {
            carte.style.display = "none";
        }
    });
}


// =========================
// ÉVÉNEMENTS RECHERCHE + FILTRE
// =========================

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