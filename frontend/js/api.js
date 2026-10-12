/*
 * ============================================================
 * CONFIGURAZIONE API
 * ============================================================
 */
const URL_BACKEND = "http://localhost:3000/api"; // URL base delle API del backend

/*
 * ============================================================
 * RICHIESTE AL BACKEND
 * ============================================================
 */
async function richiestaAPI(percorso, metodo = "GET", dati = null, usaToken = false) { // Funzione comune per tutte le richieste HTTP
    const headers = { "Content-Type": "application/json" }; // Indica che i dati inviati sono in formato JSON

    if (usaToken) { // Controlla se la richiesta richiede autenticazione
        const token = leggiToken(); // Recupera il JWT dal localStorage

        if (token) { // Se il token esiste
            headers.Authorization = `Bearer ${token}`; // Inserisce il JWT nell'header Authorization
        }
    }

    const opzioni = { method: metodo, headers }; // Imposta metodo HTTP e header della richiesta

    if (dati !== null) { // Se ci sono dati da inviare
        opzioni.body = JSON.stringify(dati); // Converte i dati in JSON e li inserisce nel body
    }

    const risposta = await fetch(`${URL_BACKEND}${percorso}`, opzioni); // Invia la richiesta HTTP al backend
    const risultato = await risposta.json(); // Converte la risposta JSON in un oggetto JavaScript

    if (!risposta.ok) { // Controlla se la risposta HTTP indica un errore
        throw new Error(
            risultato.messaggio || "Errore nella richiesta al backend" // Usa il messaggio del backend o quello predefinito
        );
    }
    
    return risultato; // Restituisce i dati ricevuti dal backend
}