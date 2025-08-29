const backendUrl = 'http://lea-script.tech:40005'; // backend Node.js

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

// Funzione di login con debug
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('Tentativo login con:', username, password);

    try {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        console.log('Risposta fetch:', response);

        const data = await response.json();
        console.log('Body risposta:', data);

        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login riuscito! Token salvato.');
        } else {
            alert(data.message || 'Errore di login');
        }
    } catch (error) {
        console.error('Errore fetch login:', error);
        alert('Errore: ' + error.message);
    }
}
