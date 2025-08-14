const apiKey = 'b0d2c9cd-ccb0-40d9-9a86-37f4153ebfaa';
const language = 'it';
const headers = { 'Authorization': apiKey };

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${sectionId}-btn`).classList.add('active');
    if (sectionId === 'shop') fetchShop();
    if (sectionId === 'map') fetchMap();
    if (sectionId === 'news') fetchNews();
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
        const response = await fetch(`https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(name)}&accountType=epic&image=all`, { headers });
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
        } else {
            content.innerHTML = 'Errore: Assicurati che il nome del giocatore sia corretto e che sia un account Epic Games.';
        }
    } catch (error) {
        content.innerHTML = 'Errore: ' + error.message;
    }
}

// Aggiungi listener di eventi per i pulsanti
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('shop-btn').addEventListener('click', () => showSection('shop'));
    document.getElementById('map-btn').addEventListener('click', () => showSection('map'));
    document.getElementById('news-btn').addEventListener('click', () => showSection('news'));
    document.getElementById('stats-btn').addEventListener('click', () => showSection('stats'));
    document.getElementById('stats-search-btn').addEventListener('click', fetchStats);
});