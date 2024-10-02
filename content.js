// Fonction pour masquer le lien du menu des paramètres sur fanvue.com
function hideSettingsMenu() {
    // Sélectionner toutes les balises <a> sur la page
    const links = document.querySelectorAll("a");
    // Parcourir tous les liens pour trouver celui qui contient le texte "Settings"
    links.forEach(link => {
        if (link.textContent.trim() === "Settings") {
        // Masquer le lien s'il contient le texte "Settings"
        link.style.display = 'none';
        console.log("Lien des paramètres masqué.");
        }
    });
}

// Fonction pour remplacer le contenu de la page si l'URL est "/settings" sur fanvue.com
function checkUrlAndRestrictAccess() {
    const currentUrl = window.location.href;

    // Vérifier si l'URL contient '/settings'
    if (currentUrl.includes("/settings")) {
        // Remplacer le contenu de la page par un message d'accès restreint
        document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center;">
            <h1>Accès restreint</h1>
            <p>Vous n'avez pas l'autorisation d'accéder aux paramètres.</p>
        </div>
        `;
        document.title = "Accès restreint";
    }
}

// Exécuter les deux fonctions après le chargement complet de la page
window.addEventListener('load', () => {
    hideSettingsMenu();
    checkUrlAndRestrictAccess();
});