const apiKey = 'b0d2c9cd-ccb0-40d9-9a86-37f4153ebfaa';
const language = 'it';
const headers = { 'Authorization': apiKey };
const backendUrl = 'http://lea-script.tech:40005'; // URL del backend Node.js (cambia se necessario)

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${sectionId}-btn`).classList.add('active');
    if (sectionId === 'shop') fetchShop();
    if (sectionId === 'map') fetchMap();
    if (sectionId === 'news') fetchNews();
    if (sectionId === 'watchlist') showWatchlist();
}

async function fetchShop() {
    const content = document.getElementById('shop-content');
    content.innerHTML = 'Caricamento...';
    try {
        const response = await fetch(`https://fortnite-api.com/v2/shop?language=${language}`, { headers });
        const data = await response.json();
        content.innerHTML = '';
        if (data.status === 200) {
            const shopData = data.data;
            const groups = {};
            shopData.entries.forEach(entry => {
                const groupName = entry.section?.name || entry.layout?.name || 'Other';
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(entry);
            });
            for (const group in groups) {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('shop-group');
                groupDiv.innerHTML = `<h3>${group}</h3>`;
                const grid = document.createElement('div');
                grid.classList.add('shop-section');
                groups[group].forEach(entry => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('shop-item');
                    const isJamTrack = entry.tracks?.[0]?.type?.value === 'jamtrack' || entry.offerTag?.id === 'sparksjamloop';
                    let name, imageUrl, description, rarityValue, rarityDisplay;
                    
                    if (isJamTrack && entry.tracks?.[0]) {
                        name = entry.tracks[0].title || 'Unknown Track';
                        imageUrl = entry.tracks[0].albumArt || '';
                        description = `${entry.tracks[0].artist || 'Unknown Artist'}`;
                        rarityValue = 'jamtrack';
                        rarityDisplay = 'Jam Track';
                    } else {
                        const mainItem = entry.brItems?.[0] || entry.items?.[0] || {};
                        name = entry.bundle?.name || mainItem.name || 'Unknown';
                        imageUrl = entry.bundle?.image || entry.newDisplayAsset?.renderImages?.[0]?.image || mainItem.images?.featured || mainItem.images?.icon || '';
                        description = mainItem.description || '';
                        rarityValue = mainItem.rarity?.value?.toLowerCase() || 'common';
                        rarityDisplay = mainItem.rarity?.displayValue || 'Common';
                    }

                    itemDiv.classList.add(`rarity-${rarityValue}`);
                    let bundleInfo = '';
                    if (entry.bundle) {
                        bundleInfo = `<p class="bundle-info">${entry.bundle.name}</p>`;
                    }
                    let trackInfo = '';
                    if (isJamTrack && entry.tracks?.[0]) {
                        trackInfo = `<p class="track-info">${entry.tracks[0].title} - ${entry.tracks[0].artist}</p>`;
                    }
                    itemDiv.innerHTML = `
                        <div class="rarity-header">${rarityDisplay}</div>
                        <img src="${imageUrl}" alt="${name}">
                        <h3>${name}</h3>
                        <p class="description">${description}</p>
                        <p class="price">${entry.finalPrice} V-Bucks</p>
                        ${bundleInfo}
                        ${trackInfo}
                    `;
                    grid.appendChild(itemDiv);
                });
                groupDiv.appendChild(grid);
                content.appendChild(groupDiv);
            }
        } else {
            content.innerHTML = 'Errore nel caricamento dello shop: ' + data.error;
        }
    } catch (error) {
        content.innerHTML = 'Errore: ' + error.message;
    }
}

async function fetchMap() {
    const img = document.getElementById('map-image');
    try {
        const response = await fetch(`https://fortnite-api.com/v1/map?language=${language}`, { headers });
        const data = await response.json();
        if (data.status === 200) {
            img.src = data.data.images.pois;
        } else {
            img.alt = 'Errore nel caricamento della mappa: ' + data.error;
        }
    } catch (error) {
        img.alt = 'Errore: ' + error.message;
    }
}

async function fetchNews() {
    const content = document.getElementById('news-content');
    content.innerHTML = 'Caricamento...';
    try {
        const response = await fetch(`https://fortnite-api.com/v2/news?language=${language}`, { headers });
        const data = await response.json();
        content.innerHTML = '';
        if (data.status === 200) {
            const modes = ['br', 'creative'];
            modes.forEach(mode => {
                if (data.data[mode]) {
                    const modeDiv = document.createElement('div');
                    modeDiv.innerHTML = `<h3>${mode.toUpperCase()}</h3>`;
                    data.data[mode].motds?.forEach(motd => {
                        const motdDiv = document.createElement('div');
                        motdDiv.classList.add('news-motd');
                        motdDiv.innerHTML = `
                            <img src="${motd.image}" alt="${motd.title}">
                            <h4>${motd.title}</h4>
                            <p>${motd.body}</p>
                        `;
                        modeDiv.appendChild(motdDiv);
                    });
                    content.appendChild(modeDiv);
                }
            });
        } else {
            content.innerHTML = 'Errore nel caricamento delle news: ' + data.error;
        }
    } catch (error) {
        content.innerHTML = 'Errore: ' + error.message;
    }
}

async function fetchStats() {
    const name = document.getElementById('player-name').value.trim();
    const content = document.getElementById('stats-content');
    const statsImg = document.getElementById('stats-image');
    content.innerHTML = 'Caricamento...';
    statsImg.style.display = 'none';
    if (!name) {
        content.innerHTML = 'Inserisci un nome giocatore valido.';
        return;
    }
    try {
        const encodedName = encodeURIComponent(name);
        const url = `https://fortnite-api.com/v2/stats/br/v2?name=${encodedName}&accountType=epic&image=all`;
        console.log(`Fetching stats for: ${name} at ${url}`);
        const response = await fetch(url, { headers });
        const data = await response.json();
        content.innerHTML = '';
        if (data.status === 200) {
            const statsData = data.data;
            if (statsData.image) {
                statsImg.src = statsData.image;
                statsImg.style.display = 'block';
            }
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Modalità</th><th>Vittorie</th><th>Uccisioni</th><th>K/D</th><th>Partite</th><th>Win Rate</th></tr>';
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            const modes = ['overall', 'solo', 'duo', 'trio', 'squad', 'ltm'];
            modes.forEach(mode => {
                if (statsData.stats?.all?.[mode]) {
                    const stat = statsData.stats.all[mode];
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${mode.charAt(0).toUpperCase() + mode.slice(1)}</td>
                        <td>${stat.wins || 0}</td>
                        <td>${stat.kills || 0}</td>
                        <td>${stat.kd || 0}</td>
                        <td>${stat.matches || 0}</td>
                        <td>${stat.winRate || 0}%</td>
                    `;
                    tbody.appendChild(row);
                }
            });
            table.appendChild(tbody);
            content.appendChild(table);
        } else if (data.status === 403) {
            content.innerHTML = `Errore: Le statistiche per "${name}" non sono pubbliche. Imposta le statistiche come pubbliche nelle impostazioni del tuo account Epic Games. (Codice: 403)`;
        } else {
            content.innerHTML = `Errore: Impossibile trovare le statistiche per "${name}". Verifica che il nome sia corretto e che l'account sia Epic Games. (Codice: ${data.status})`;
        }
    } catch (error) {
        content.innerHTML = `Errore di rete: ${error.message}. Verifica la connessione o il nome del giocatore.`;
        console.error('Fetch stats error:', error);
    }
}

// Funzione per mostrare la sezione watchlist (con login se non autenticato)
async function showWatchlist() {
    const watchlistContent = document.getElementById('watchlist');
    watchlistContent.innerHTML = 'Caricamento...';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            renderLoginForm(watchlistContent);
            return;
        }

        // Verifica token
        const response = await fetch(`${backendUrl}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
            localStorage.removeItem('token');
            renderLoginForm(watchlistContent);
            return;
        }

        renderWatchlistUI(watchlistContent, data.user);
    } catch (error) {
        watchlistContent.innerHTML = 'Errore: ' + error.message;
    }
}

// Render del form di login
function renderLoginForm(container) {
    container.innerHTML = `
        <h2>Login</h2>
        <form id="login-form">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="button" id="login-btn">Accedi</button>
        </form>
    `;
    document.getElementById('login-btn').addEventListener('click', login);
}

// Funzione di login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showWatchlist();
        } else {
            alert(data.message || 'Errore di login');
        }
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Funzione di logout
async function logout() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch(`${backendUrl}/api/whatsapp/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        localStorage.removeItem('token');
        showWatchlist();
    } catch (error) {
        console.error('Errore logout:', error);
        alert('Errore durante il logout');
    }
}

// Render UI watchlist dopo login
async function renderWatchlistUI(container, user) {
    container.innerHTML = `
        <h2>Watchlist Cosmetici</h2>
        <div style="text-align: right; margin-bottom: 10px;">
            <span>Benvenuto, ${user.username}</span>
            <button id="logout-btn" style="margin-left: 10px;">Logout</button>
        </div>
        <div id="search-section">
            <input type="text" id="cosmetic-search" placeholder="Cerca cosmetico...">
            <div id="results-list"></div>
        </div>
        <h3>I tuoi selezionati</h3>
        <div id="selected-list"></div>
    `;

    if (user.isAdmin) {
        renderAdminSection(container);
    }

    document.getElementById('cosmetic-search').addEventListener('input', debounce(searchCosmetics, 300));
    document.getElementById('logout-btn').addEventListener('click', logout);
    loadSelectedCosmetics();
    loadShopForSelection();
}

// Funzione debounce per ricerca
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// Ricerca cosmetici
async function searchCosmetics() {
    const query = document.getElementById('cosmetic-search').value.toLowerCase();
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = 'Caricamento...';
    if (query.length < 3) {
        resultsList.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://fortnite-api.com/v2/cosmetics/br?language=it`, { headers });
        const data = await response.json();
        if (data.status !== 200) {
            resultsList.innerHTML = 'Errore API: ' + data.error;
            return;
        }
        const results = data.data.filter(item => item.name.toLowerCase().includes(query));

        // Aggiungi anche dallo shop attuale
        const shopResponse = await fetch(`https://fortnite-api.com/v2/shop?language=it`, { headers });
        const shopData = await shopResponse.json();
        if (shopData.status === 200) {
            shopData.data.entries.forEach(entry => {
                entry.brItems?.forEach(brItem => {
                    if (brItem.name.toLowerCase().includes(query) && !results.some(r => r.id === brItem.id)) {
                        results.push(brItem);
                    }
                });
            });
        }

        renderCosmeticList(results, 'results-list', 'Aggiungi');
    } catch (error) {
        console.error('Errore ricerca:', error);
        resultsList.innerHTML = 'Errore: ' + error.message;
    }
}

// Carica cosmetici selezionati
async function loadSelectedCosmetics() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const ids = await response.json();
        const cosmetics = await Promise.all(ids.map(async id => {
            try {
                const res = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}?language=it`, { headers });
                const data = await res.json();
                return data.status === 200 ? data.data : null;
            } catch {
                return null;
            }
        }));
        renderCosmeticList(cosmetics.filter(c => c), 'selected-list', 'Rimuovi', true);
    } catch (error) {
        console.error('Errore caricamento watchlist:', error);
    }
}

// Carica shop attuale per selezione
async function loadShopForSelection() {
    try {
        const response = await fetch(`https://fortnite-api.com/v2/shop?language=it`, { headers });
        const data = await response.json();
        if (data.status === 200) {
            const shopItems = [];
            data.data.entries.forEach(entry => {
                entry.brItems?.forEach(brItem => shopItems.push(brItem));
            });
        }
    } catch (error) {
        console.error('Errore caricamento shop:', error);
    }
}

// Render lista cosmetici
function renderCosmeticList(items, containerId, buttonText, isRemove = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!items || items.length === 0) {
        container.innerHTML = '<p>Nessun elemento trovato.</p>';
        return;
    }
    items.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cosmetic-item');
        div.innerHTML = `
            <img src="${item.images?.icon || item.images?.smallIcon || ''}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
            <button class="${isRemove ? 'remove' : ''}" data-id="${item.id}">${buttonText}</button>
        `;
        div.querySelector('button').addEventListener('click', () => toggleWatchlist(item.id, isRemove));
        container.appendChild(div);
    });
}

// Aggiungi/Rimuovi da watchlist
async function toggleWatchlist(id, isRemove) {
    try {
        const token = localStorage.getItem('token');
        const endpoint = isRemove ? 'remove' : 'add';
        await fetch(`${backendUrl}/api/watchlist/${endpoint}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cosmeticId: id })
        });
        loadSelectedCosmetics();
        // Non svuotare la barra di ricerca
    } catch (error) {
        console.error('Errore toggle watchlist:', error);
    }
}

// Sezione admin
function renderAdminSection(container) {
    const adminDiv = document.createElement('div');
    adminDiv.id = 'admin-section';
    adminDiv.innerHTML = `
        <h3>Admin: Gestisci Utenti</h3>
        <form id="admin-form">
            <input type="text" id="new-username" placeholder="Nuovo Username" required>
            <input type="password" id="new-password" placeholder="Nuova Password" required>
            <input type="text" id="new-phone" placeholder="Numero Telefono (es. 1234567890)" required>
            <button type="button" id="create-user-btn">Crea Utente</button>
        </form>
        <div id="user-list"></div>
    `;
    container.appendChild(adminDiv);
    document.getElementById('create-user-btn').addEventListener('click', createUser);
    loadUsers();
}

// Crea utente (solo admin)
async function createUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const phone = document.getElementById('new-phone').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/auth/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, password, phone })
        });
        if (response.ok) {
            loadUsers();
        } else {
            alert('Errore creazione utente');
        }
    } catch (error) {
        console.error('Errore creazione utente:', error);
    }
}

// Carica lista utenti (admin)
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        const list = document.getElementById('user-list');
        list.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            div.classList.add('user-item');
            div.innerHTML = `
                <span>${user.username} (${user.phone})</span>
                <button data-id="${user.id}">Elimina</button>
            `;
            div.querySelector('button').addEventListener('click', () => deleteUser(user.id));
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Errore caricamento utenti:', error);
    }
}

// Elimina utente (admin)
async function deleteUser(id) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${backendUrl}/api/auth/delete/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadUsers();
    } catch (error) {
        console.error('Errore eliminazione utente:', error);
    }
}

// Aggiungi listener di eventi per i pulsanti
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('shop-btn').addEventListener('click', () => showSection('shop'));
    document.getElementById('map-btn').addEventListener('click', () => showSection('map'));
    document.getElementById('news-btn').addEventListener('click', () => showSection('news'));
    document.getElementById('stats-btn').addEventListener('click', () => showSection('stats'));
    document.getElementById('stats-search-btn').addEventListener('click', fetchStats);
    document.getElementById('watchlist-btn').addEventListener('click', () => showSection('watchlist'));
});
