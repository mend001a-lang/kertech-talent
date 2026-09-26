console.log("KërTech Talent : JavaScript connecté !");

const formulaire = document.getElementById("formContact");
const nom = document.querySelector("#nom");
const email = document.querySelector("#email");
const message = document.querySelector("#message");
const messageErreur = document.querySelector("#messageErreur");
const publierProjet = document.querySelector("#publierProjet");
const titreProjet = document.querySelector("#titreProjet");
const descriptionProjet = document.querySelector("#descriptionProjet");
const projetsGrid = document.getElementById("projetsGrid");
const formProjet = document.querySelector("#formProjet");
const messageProjet = document.querySelector("#messageProjet");
const erreurTitre = document.querySelector("#erreurTitre");
const erreurDescription = document.querySelector("#erreurDescription");
const categorieProjet = document.querySelector("#categorieProjet");
const erreurCategorie = document.querySelector("#erreurCategorie");

formulaire.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomUtilisateur = nom.value;
    const emailUtilisateur = email.value;
    const messageUtilisateur = message.value;
    const categorie = categorieProjet.value;

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
publierProjet.addEventListener("click", function(event) {
    event.preventDefault();

    formProjet.hidden = false;
});
formProjet.addEventListener("submit", function(event) {
    event.preventDefault();

const titre = titreProjet.value;
const description = descriptionProjet.value;
const budget = budgetProjet.value;
const categorie = categorieProjet.value;

let formulaireValide = true;

erreurTitre.textContent = "";
erreurDescription.textContent = "";
erreurBudget.textContent = "";
erreurCategorie.textContent = "";

if (titre.trim() === "") {
    erreurTitre.textContent = "Veuillez saisir un titre.";
    erreurTitre.classList.add("erreur");
    formulaireValide = false;
}

if (description.trim() === "") {
    erreurDescription.textContent = "Veuillez saisir une description.";
    erreurDescription.classList.add("erreur");
    formulaireValide = false;
}

if (budget === "" || budget < 1) {
    erreurBudget.textContent = "Veuillez saisir un budget valide.";
    erreurBudget.classList.add("erreur");
    formulaireValide = false;
}

if (categorie === "") {
    erreurCategorie.textContent = "Veuillez choisir une catégorie.";
    erreurCategorie.classList.add("erreur");
    formulaireValide = false;
}

if (formulaireValide === false) {
    return;
}   

if (categorie === "") {
    erreurCategorie.textContent = "Veuillez choisir une catégorie.";
    erreurCategorie.classList.add("erreur");
    formulaireValide = false;
}

    const nouvelleCarte = document.createElement("article");

    const nouveauTitre = document.createElement("h3");
    nouveauTitre.textContent = titre;

    const nouvelleDescription = document.createElement("p");
    nouvelleDescription.textContent = description;
    const nouveauBudget = document.createElement("p");
nouveauBudget.textContent = "Budget : " + budget + " €";

const nouvelleCategorie = document.createElement("p");
nouvelleCategorie.textContent = "Catégorie : " + categorie;

    nouvelleCarte.appendChild(nouveauTitre);
    nouvelleCarte.appendChild(nouvelleDescription);
    nouvelleCarte.appendChild(nouveauBudget);
    nouvelleCarte.appendChild(nouvelleCategorie);

    const boutonSupprimer = document.createElement("button");
boutonSupprimer.textContent = "Supprimer";
boutonSupprimer.classList.add("btn-supprimer");

boutonSupprimer.addEventListener("click", function() {
    const confirmation = confirm("Voulez-vous vraiment supprimer ce projet ?");

    if (confirmation) {
        nouvelleCarte.remove();
        messageProjet.textContent = "Le projet a bien été supprimé.";
    }
    

});

nouvelleCarte.appendChild(boutonSupprimer);

    projetsGrid.appendChild(nouvelleCarte);

    formProjet.reset();
    formProjet.hidden = true;
    messageProjet.textContent = "Votre projet a bien été publié !";
messageProjet.classList.add("succes");
});