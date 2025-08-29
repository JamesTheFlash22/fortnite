const apiKey = 'b0d2c9cd-ccb0-40d9-9a86-37f4153ebfaa';
const language = 'it';
const headers = { 'Authorization': apiKey };
const backendUrl = 'https://jtf.weissx.net'; // URL del backend Node.js

// Mostra una sezione specifica e nasconde le altre
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

// Carica lo shop di Fortnite
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
                    if (entry.bundle) bundleInfo = `<p class="bundle-info">${entry.bundle.name}</p>`;
                    let trackInfo = '';
                    if (isJamTrack && entry.tracks?.[0]) trackInfo = `<p class="track-info">${entry.tracks[0].title} - ${entry.tracks[0].artist}</p>`;
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

// Carica la mappa di Fortnite
async function fetchMap() {
    const img = document.getElementById('map-image');
    try {
        const response = await fetch(`https://fortnite-api.com/v1/map?language=${language}`, { headers });
        const data = await response.json();
        if (data.status === 200) img.src = data.data.images.pois;
        else img.alt = 'Errore nel caricamento della mappa: ' + data.error;
    } catch (error) {
        img.alt = 'Errore: ' + error.message;
    }
}

// Carica le news di Fortnite
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
        } else content.innerHTML = 'Errore nel caricamento delle news: ' + data.error;
    } catch (error) {
        content.innerHTML = 'Errore: ' + error.message;
    }
}

// Carica le statistiche del giocatore
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
            content.innerHTML = `Errore: Le statistiche per "${name}" non sono pubbliche. (Codice: 403)`;
        } else {
            content.innerHTML = `Errore: Impossibile trovare le statistiche per "${name}". (Codice: ${data.status})`;
        }
    } catch (error) {
        content.innerHTML = `Errore di rete: ${error.message}`;
        console.error('Fetch stats error:', error);
    }
}

// ==================== WATCHLIST ====================

// Mostra la watchlist o il form di login
async function showWatchlist() {
    const watchlistContent = document.getElementById('watchlist');
    watchlistContent.innerHTML = 'Caricamento...';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            renderLoginForm(watchlistContent);
            return;
        }

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

// Gestisce il login
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

// Gestisce il logout
async function logout() {
    localStorage.removeItem('token');
    showWatchlist();
}

// Render dell'interfaccia della watchlist
async function renderWatchlistUI(container, user) {
    container.innerHTML = `
        <h2>Watchlist Cosmetici</h2>
        <div style="text-align: right; margin-bottom: 10px;">
            <span>Benvenuto, ${user.username}</span>
            <button type="button" id="logout-btn" style="margin-left: 10px;">Logout</button>
        </div>
        <div id="search-section">
            <input type="text" id="cosmetic-search" placeholder="Cerca cosmetico...">
            <div id="results-list"></div>
        </div>
        <h3>I tuoi selezionati</h3>
        <div id="selected-list"></div>
    `;

    if (user.isAdmin) renderAdminSection(container);

    document.getElementById('cosmetic-search').addEventListener('input', debounce(searchCosmetics, 300));
    document.getElementById('logout-btn').addEventListener('click', logout);

    await loadSelectedCosmetics();
}

// Funzione debounce per la ricerca
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// ==================== COSMETICS ====================

// Cerca cosmetici
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
        let results = data.data.filter(item => item.name.toLowerCase().includes(query));

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

        await renderCosmeticList(results, 'results-list', 'Aggiungi');
    } catch (error) {
        console.error('Errore ricerca:', error);
        resultsList.innerHTML = 'Errore: ' + error.message;
    }
}

// Carica i cosmetici selezionati
async function loadSelectedCosmetics() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

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

        await renderCosmeticList(cosmetics.filter(c => c), 'selected-list', 'Rimuovi', true);
    } catch (error) {
        console.error('Errore caricamento watchlist:', error);
    }
}

// Aggiunge o rimuove un cosmetico dalla watchlist
async function toggleWatchlist(id, isRemove) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Devi essere loggato per modificare la watchlist.');
            return;
        }

        // Feedback visivo
        const buttons = document.querySelectorAll(`button[data-id="${id}"]`);
        buttons.forEach(button => {
            button.disabled = true;
            button.textContent = 'Caricamento...';
        });

        const endpoint = isRemove ? 'remove' : 'add';
        const response = await fetch(`${backendUrl}/api/watchlist/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ cosmeticId: id })
        });

        if (response.ok) {
            // Aggiorna i pulsanti dinamicamente
            buttons.forEach(button => {
                const wasRemove = button.classList.contains('remove');
                button.classList.toggle('remove');
                button.textContent = wasRemove ? 'Aggiungi' : 'Rimuovi';
                button.disabled = false;
                button.onclick = () => toggleWatchlist(id, !wasRemove);
            });

            // Se rimuoviamo, elimina l'elemento dalla lista selezionata
            if (isRemove) {
                const selectedList = document.getElementById('selected-list');
                const itemToRemove = selectedList.querySelector(`.cosmetic-item button[data-id="${id}"]`)?.parentElement;
                if (itemToRemove) {
                    itemToRemove.remove();
                    if (selectedList.children.length === 0) {
                        selectedList.innerHTML = '<p>Nessun elemento trovato.</p>';
                    }
                }
            }

            // Se aggiungiamo, ricarica la lista selezionata solo se necessario
            if (!isRemove) {
                await loadSelectedCosmetics(); // Ricarica solo la lista selezionata
            }
        } else {
            buttons.forEach(button => {
                button.disabled = false;
                button.textContent = isRemove ? 'Rimuovi' : 'Aggiungi';
            });
            alert('Errore durante l\'aggiornamento della watchlist.');
        }
    } catch (error) {
        console.error('Errore toggle watchlist:', error);
        buttons.forEach(button => {
            button.disabled = false;
            button.textContent = isRemove ? 'Rimuovi' : 'Aggiungi';
        });
        alert('Errore: ' + error.message);
    }
}

// Render della lista dei cosmetici
async function renderCosmeticList(items, containerId, buttonText, isRemove = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (!items || items.length === 0) {
        container.innerHTML = '<p>Nessun elemento trovato.</p>';
        return;
    }

    const token = localStorage.getItem('token');
    let currentWatchlist = [];
    if (token) {
        try {
            const response = await fetch(`${backendUrl}/api/watchlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            currentWatchlist = await response.json();
        } catch (err) {
            console.error('Errore recupero watchlist:', err);
        }
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cosmetic-item');

        let buttonLabel = buttonText;
        let removeFlag = isRemove;
        if (currentWatchlist.includes(item.id)) {
            buttonLabel = 'Rimuovi';
            removeFlag = true;
        }

        div.innerHTML = `
            <img src="${item.images?.icon || item.images?.smallIcon || ''}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
            <button type="button" class="${removeFlag ? 'remove' : ''}" data-id="${item.id}">${buttonLabel}</button>
        `;

        const button = div.querySelector('button');
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await toggleWatchlist(item.id, removeFlag);
        });

        container.appendChild(div);
    });
}

// ==================== ADMIN ====================

// Render della sezione admin
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

// Crea un nuovo utente
async function createUser() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const phone = document.getElementById('new-phone').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/auth/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ username, password, phone })
        });
        if (response.ok) loadUsers();
        else alert('Errore creazione utente');
    } catch (error) {
        console.error('Errore creazione utente:', error);
    }
}

// Carica la lista degli utenti
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendUrl}/api/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const users = await response.json();
        const list = document.getElementById('user-list');
        list.innerHTML = '';
        users.forEach(user => {
            const div = document.createElement('div');
            div.classList.add('user-item');
            div.innerHTML = `<span>${user.username} (${user.phone})</span><button type="button" data-id="${user.id}">Elimina</button>`;
            div.querySelector('button').addEventListener('click', () => deleteUser(user.id));
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Errore caricamento utenti:', error);
    }
}

// Elimina un utente
async function deleteUser(id) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`${backendUrl}/api/auth/delete/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        loadUsers();
    } catch (error) {
        console.error('Errore eliminazione utente:', error);
    }
}

// ==================== INIT ====================

// Inizializzazione degli event listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('shop-btn').addEventListener('click', () => showSection('shop'));
    document.getElementById('map-btn').addEventListener('click', () => showSection('map'));
    document.getElementById('news-btn').addEventListener('click', () => showSection('news'));
    document.getElementById('stats-btn').addEventListener('click', () => showSection('stats'));
    document.getElementById('stats-search-btn').addEventListener('click', fetchStats);
    document.getElementById('watchlist-btn').addEventListener('click', () => showSection('watchlist'));
});
