/*
 * ============================================================
 * GESTIONE DATI LOCALI
 * ============================================================
 */
function salvaToken(token) {
    localStorage.setItem("token", token); // Salva il JWT nel localStorage del browser
}

function leggiToken() {
    return localStorage.getItem("token"); // Recupera il JWT salvato
}

function salvaUtente(utente) {
    localStorage.setItem("utente", 
        JSON.stringify(utente) // Converte l'oggetto JavaScript in stringa JSON
    );
}

function leggiUtente() {
    const utente = localStorage.getItem("utente"); // Recupera la stringa JSON dal localStorage

    return utente
        ? JSON.parse(utente) // Riconverte la stringa JSON in oggetto JavaScript
        : null;
}

function utenteAutenticato() {
    return leggiToken() !== null; // Considera autenticato l'utente se è presente un token
}

function logout() {
    localStorage.removeItem("token"); // Elimina il JWT
    localStorage.removeItem("utente"); // Elimina i dati locali dell'utente
    localStorage.removeItem("carrello"); // Elimina anche l'eventuale carrello
    window.location.href = "login.html"; // Reindirizza alla pagina di login
}

/*
 * ============================================================
 * MESSAGGI
 * ============================================================
 */
function mostraMessaggio(idElemento, testo, tipo = "info") { // tipo ha "info" come valore predefinito
    const elemento = document.getElementById(idElemento); // Recupera dal DOM l'elemento destinato al messaggio

    if (!elemento) {
        return;
    }

    elemento.innerHTML = `
        <div class="alert alert-${tipo} mt-3" role="alert">
            ${testo}
        </div>
    `;
}

function pulisciMessaggio(idElemento) {
    const elemento = document.getElementById(idElemento);

    if (elemento) {
        elemento.innerHTML = ""; // Rimuove il messaggio precedentemente visualizzato
    }
}

/*
 * ============================================================
 * NAVBAR DINAMICA
 * ============================================================
 */
function aggiornaNavbar() {
    const listaNavigazione = document.getElementById("listaNavigazione"); // Recupera il contenitore della navbar

    if (!listaNavigazione) {
        return;
    }

    const siamoInPagine = window.location.pathname.includes("/pagine/"); // Controlla la posizione della pagina corrente
    const percorsoHome = siamoInPagine ? "../index.html" : "index.html"; // Gestisce correttamente i percorsi relativi
    const percorsoPagine = siamoInPagine ? "" : "pagine/";
    const utente = leggiUtente(); // Recupera l'utente salvato nel browser

    let link = `
        <li class="nav-item">
            <a class="nav-link" href="${percorsoHome}">
                Home
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="${percorsoPagine}ristorante.html">
                Ristoranti
            </a>
        </li>
    `;

    if (!utenteAutenticato() || !utente) { // Navbar per utente non autenticato
        link += `
            <li class="nav-item">
                <a class="nav-link" href="${percorsoPagine}login.html">
                    Login
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="${percorsoPagine}registrazione.html">
                    Sign up
                </a>
            </li>
        `;
    } else {
        const paginaArea = utente.tipoUtente === "cliente"
                ? "area-cliente.html"
                : "area-ristoratore.html"; // Sceglie la pagina dell'area in base al ruolo

        const nomeArea = utente.tipoUtente === "cliente"
                ? "Area cliente"
                : "Area ristoratore"; // Sceglie il testo del link in base al ruolo

        link += `
            <li class="nav-item">
                <a class="nav-link" href="${percorsoPagine}${paginaArea}">
                    ${nomeArea}
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="${percorsoPagine}profilo.html">
                    Profilo
                </a>
            </li>
        `; // Aggiunge alla navbar i link disponibili per l'utente autenticato
    }
    listaNavigazione.innerHTML = link; // Inserisce nel DOM la navbar costruita dinamicamente
}

document.addEventListener("DOMContentLoaded", aggiornaNavbar); // Aggiorna la navbar quando il DOM della pagina è stato completamente caricato