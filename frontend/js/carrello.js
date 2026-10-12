/*
 * ============================================================
 * GESTIONE DEL CARRELLO
 * ============================================================
 */
function leggiCarrello() {
    const carrello = localStorage.getItem("carrello"); // Recupera il carrello salvato nel localStorage

    if (!carrello) {
        return { ristorante: null, nomeRistorante: "", piatti: [] }; // Restituisce un carrello vuoto se non esiste
    }
    return JSON.parse(carrello); // Converte la stringa JSON in oggetto JavaScript
}

function salvaCarrello(carrello) {
    localStorage.setItem("carrello", JSON.stringify(carrello)); // Converte l'oggetto in JSON e lo salva nel localStorage
}

function svuotaCarrello() {
    localStorage.removeItem("carrello"); // Elimina completamente il carrello dal localStorage
}

/*
 * ============================================================
 * AGGIUNTA AL CARRELLO
 * ============================================================
 */
function aggiungiAlCarrello(piatto, idRistorante) {
    const utente = leggiUtente(); // Recupera i dati dell'utente

    if (!utenteAutenticato() || !utente) { // Verifica che l'utente sia autenticato
        window.location.href = "login.html"; // Reindirizza al login
        return;
    }

    if (utente.tipoUtente !== "cliente") { // Solo i clienti possono aggiungere al carrello
        return;
    }

    const carrello = leggiCarrello(); // Recupera il carrello corrente

    if (!carrello.ristorante) { // Se è il primo piatto, associa il carrello al ristorante
        carrello.ristorante = idRistorante;

        carrello.nomeRistorante = piatto.ristorante 
            && piatto.ristorante.nomeRistorante
                ? piatto.ristorante.nomeRistorante
                : ""; // Salva il nome del ristorante se disponibile
    }

    if (carrello.ristorante !== idRistorante) { // Impedisce piatti di ristoranti diversi
        alert(
            "Puoi ordinare piatti da un solo ristorante alla volta."
        );
        return;
    }

    const piattoEsistente = carrello.piatti.find( // Cerca il piatto nel carrello
        function (elemento) {
            return elemento.piatto === piatto._id;
        });

    if (piattoEsistente) {
        piattoEsistente.quantita++; // Se già presente aumenta la quantità
    } else {
        carrello.piatti.push({ // Altrimenti aggiunge un nuovo elemento all'array
            piatto: piatto._id,
            nome: piatto.nome,
            prezzo: piatto.prezzo,
            quantita: 1
        });
    }
    salvaCarrello(carrello); // Salva il carrello aggiornato
}

/*
 * ============================================================
 * ELEMENTI DELLA PAGINA CARRELLO
 * ============================================================
 */
const tabellaCarrello = document.getElementById("tabellaCarrello"); // Recupera gli elementi HTML dal DOM
const totaleCarrello = document.getElementById("totaleCarrello");
const titoloCarrello = document.getElementById("titoloCarrello");
const bottoneSvuotaCarrello = document.getElementById("bottoneSvuotaCarrello");
const bottoneConfermaOrdine = document.getElementById("bottoneConfermaOrdine");

/*
 * ============================================================
 * VISUALIZZAZIONE DEL CARRELLO
 * ============================================================
 */
function mostraCarrello() {
    if (!tabellaCarrello) {
        return;
    }

    const carrello = leggiCarrello(); // Recupera i dati aggiornati del carrello
    tabellaCarrello.innerHTML = ""; // Svuota la tabella prima di ricrearla

    if (carrello.piatti.length === 0) {
        titoloCarrello.textContent = "Il carrello è vuoto"; // Modifica il testo nel DOM

        tabellaCarrello.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Non hai ancora aggiunto piatti al carrello.
                </td>
            </tr>
        `;
        totaleCarrello.textContent = "0.00";
        return;
    }

    titoloCarrello.textContent = carrello.nomeRistorante
            ? `Piatti selezionati - ${carrello.nomeRistorante}`
            : "Piatti selezionati"; // Operatore ternario per scegliere il titolo

    let totale = 0; // Inizializza il totale dell'ordine

    carrello.piatti.forEach(function (elemento) { // Scorre tutti i piatti del carrello
        const subtotale = elemento.prezzo * elemento.quantita; // Calcola il subtotale del piatto

        totale += subtotale; // Somma il subtotale al totale
        const riga = document.createElement("tr"); // Crea dinamicamente una riga della tabella

        riga.innerHTML = `
            <td>${elemento.nome}</td>
            <td>€ ${Number(elemento.prezzo).toFixed(2)}</td>
            <td>
                <input type="number" class="form-control" min="1"
                    value="${elemento.quantita}" onchange="modificaQuantita(
                        '${elemento.piatto}',
                        this.value
                    )" style="width: 90px;"
                >
            </td>
            <td>€ ${subtotale.toFixed(2)}</td>
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-danger"
                    onclick="rimuoviDalCarrello('${elemento.piatto}')">
                    Rimuovi
                </button>
            </td>
        `;
        tabellaCarrello.appendChild(riga); // Aggiunge la riga alla tabella nel DOM
    });
    totaleCarrello.textContent = totale.toFixed(2); // Visualizza il totale con due decimali
}

/*
 * ============================================================
 * MODIFICA DEL CARRELLO
 * ============================================================
 */
function modificaQuantita(idPiatto, nuovaQuantita) {
    const quantita = Number(nuovaQuantita); // Converte il valore dell'input in numero

    if (quantita < 1) {
        return;
    }

    const carrello = leggiCarrello();

    const piatto = carrello.piatti.find(function (elemento) { // Cerca il piatto tramite ID
            return elemento.piatto === idPiatto;
        });

    if (!piatto) {
        return;
    }

    piatto.quantita = quantita; // Aggiorna la quantità del piatto

    salvaCarrello(carrello); // Salva la modifica nel localStorage
    mostraCarrello(); // Ridisegna il carrello e ricalcola il totale
}

function rimuoviDalCarrello(idPiatto) {
    const carrello = leggiCarrello();

    carrello.piatti = carrello.piatti.filter( // Crea un array senza il piatto da eliminare
        function (elemento) {
            return elemento.piatto !== idPiatto;
        });

    if (carrello.piatti.length === 0) {
        carrello.ristorante = null; // Se vuoto rimuove anche il riferimento al ristorante
        carrello.nomeRistorante = "";
    }

    salvaCarrello(carrello);
    mostraCarrello(); // Aggiorna la visualizzazione
}

/*
 * ============================================================
 * CONFERMA ORDINE
 * ============================================================
 */
async function confermaOrdine() {
    pulisciMessaggio("messaggioCarrello");

    const carrello = leggiCarrello();

    if (!carrello.ristorante || carrello.piatti.length === 0) { // Impedisce di inviare un carrello vuoto
        mostraMessaggio("messaggioCarrello", "Il carrello è vuoto.", "warning");

        return;
    }

    const datiOrdine = { // Costruisce l'oggetto da inviare al backend
        ristorante: carrello.ristorante,

        piatti: carrello.piatti.map(function (elemento) { // Trasforma i piatti nei soli dati necessari all'ordine
            return {
                piatto: elemento.piatto,
                quantita: elemento.quantita
            };
        })
    };

    try {
        await richiestaAPI("/ordini", "POST", datiOrdine, true); // Invia al backend la richiesta di creazione dell'ordine

        svuotaCarrello(); // Svuota il carrello dopo l'ordine
        mostraCarrello(); // Aggiorna la pagina
        mostraMessaggio("messaggioCarrello", "Ordine creato correttamente.", "success");
    } catch (errore) {
        mostraMessaggio("messaggioCarrello", errore.message, "danger");

        console.error(errore);
    }
}

/*
 * ============================================================
 * EVENTI DELLA PAGINA
 * ============================================================
 */
if (tabellaCarrello) { // Esegue questo blocco solo nella pagina che contiene il carrello
    const utente = leggiUtente();

    if (!utenteAutenticato() || !utente || utente.tipoUtente !== "cliente") { // Verifica autenticazione e ruolo cliente
        window.location.href = "login.html";
    } else {
        bottoneSvuotaCarrello.addEventListener( // Associa un evento click al pulsante
            "click", function () {
                svuotaCarrello();
                mostraCarrello();
                mostraMessaggio(
                    "messaggioCarrello",
                    "Carrello svuotato.",
                    "info"
                );
            }
        );

        bottoneConfermaOrdine.addEventListener("click", confermaOrdine); // Al click richiama la funzione di conferma
        
        mostraCarrello(); // Visualizza il carrello all'apertura della pagina
    }
}