console.log("KërTech Talent : JavaScript connecté !");

// =========================
// SÉLECTION DES ÉLÉMENTS
// =========================

const formulaire = document.getElementById("formContact");
const nom = document.querySelector("#nom");
const email = document.querySelector("#email");
const message = document.querySelector("#message");
const messageErreur = document.querySelector("#messageErreur");

const publierProjet = document.querySelector("#publierProjet");
const titreProjet = document.querySelector("#titreProjet");
const descriptionProjet = document.querySelector("#descriptionProjet");
const budgetProjet = document.querySelector("#budgetProjet");
const categorieProjet = document.querySelector("#categorieProjet");

const projetsGrid = document.getElementById("projetsGrid");
const formProjet = document.querySelector("#formProjet");
const messageProjet = document.querySelector("#messageProjet");

const erreurTitre = document.querySelector("#erreurTitre");
const erreurDescription = document.querySelector("#erreurDescription");
const erreurBudget = document.querySelector("#erreurBudget");
const erreurCategorie = document.querySelector("#erreurCategorie");

const filtreCategorie = document.querySelector("#filtreCategorie");


// =========================
// FORMULAIRE DE CONTACT
// =========================

formulaire.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomUtilisateur = nom.value;
    const emailUtilisateur = email.value;
    const messageUtilisateur = message.value;

    if (nomUtilisateur.trim() === "") {
        messageErreur.textContent = "Veuillez saisir votre nom.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    if (emailUtilisateur.trim() === "") {
        messageErreur.textContent = "Veuillez saisir votre email.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    if (messageUtilisateur.trim() === "") {
        messageErreur.textContent = "Veuillez saisir votre message.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

    if (!emailUtilisateur.includes("@")) {
        messageErreur.textContent = "Veuillez saisir une adresse email valide.";
        messageErreur.classList.remove("succes");
        messageErreur.classList.add("erreur");
        return;
    }

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

    // Effacement des anciennes erreurs
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

    // Arrêt si au moins une erreur existe
    if (formulaireValide === false) {
        return;
    }

    // Création de la carte
    const nouvelleCarte = document.createElement("article");

    const nouveauTitre = document.createElement("h3");
    nouveauTitre.textContent = titre;

    const nouvelleDescription = document.createElement("p");
    nouvelleDescription.textContent = description;

    const nouveauBudget = document.createElement("p");
    nouveauBudget.textContent = "Budget : " + budget + " €";

    const nouvelleCategorie = document.createElement("p");
    nouvelleCategorie.textContent = "Catégorie : " + categorie;
    nouvelleCategorie.classList.add("categorie-projet");

    // Ajout des informations dans la carte
    nouvelleCarte.appendChild(nouveauTitre);
    nouvelleCarte.appendChild(nouvelleDescription);
    nouvelleCarte.appendChild(nouveauBudget);
    nouvelleCarte.appendChild(nouvelleCategorie);

    // Création du bouton Supprimer
    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.classList.add("btn-supprimer");

    // Suppression avec confirmation
    boutonSupprimer.addEventListener("click", function() {
        const confirmation = confirm(
            "Voulez-vous vraiment supprimer ce projet ?"
        );

        if (confirmation) {
            nouvelleCarte.remove();
            messageProjet.textContent = "Le projet a bien été supprimé.";
        }
    });

    nouvelleCarte.appendChild(boutonSupprimer);

    // Ajout de la carte dans la grille
    projetsGrid.appendChild(nouvelleCarte);

    // Réinitialisation
    formProjet.reset();
    formProjet.hidden = true;

    messageProjet.textContent = "Votre projet a bien été publié !";
    messageProjet.classList.add("succes");
});


// =========================
// FILTRE PAR CATÉGORIE
// =========================

filtreCategorie.addEventListener("change", function() {
    const categorieChoisie = filtreCategorie.value;
    const cartesProjets = projetsGrid.querySelectorAll("article");

    cartesProjets.forEach(function(carte) {
        const categorieCarte = carte.querySelector(".categorie-projet");

        // Les anciennes cartes HTML n'ont pas encore de catégorie
        if (categorieCarte === null) {
            return;
        }

        const categorieCarteTexte =
            categorieCarte.textContent.replace("Catégorie : ", "");

        if (
            categorieChoisie === "tous" ||
            categorieChoisie === categorieCarteTexte
        ) {
            carte.style.display = "";
        } else {
            carte.style.display = "none";
        }
    });
});