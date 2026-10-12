/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const utenteRistoratore = leggiUtente(); // Recupera i dati dell'utente salvati nel browser
const formRicercaCatalogo = document.getElementById("formRicercaCatalogo"); // Recupera gli elementi HTML dal DOM
const inputRicercaNome = document.getElementById("ricercaNomeCatalogo");
const listaCatalogoPiatti = document.getElementById("listaCatalogoPiatti");
const bottonePrecedente = document.getElementById("bottonePrecedente");
const bottoneSuccessivo = document.getElementById("bottoneSuccessivo");
const testoPagina = document.getElementById("testoPagina");
const piattiPerPagina = 8; // Numero massimo di piatti mostrati in ogni pagina
let mioRistorante = null; // Conterrà il ristorante del ristoratore
let catalogo = []; // Array che conterrà i piatti ricevuti dal backend
let paginaCorrente = 1; // Pagina iniziale della paginazione

/*
 * ============================================================
 * CONTROLLO ACCESSO RISTORATORE
 * ============================================================
 */
async function inizializzaCatalogo() {
    if (!utenteAutenticato() || !utenteRistoratore) { // Controlla che l'utente sia autenticato
        window.location.href = "login.html"; // Reindirizza al login
        return;
    }

    if (utenteRistoratore.tipoUtente !== "ristoratore") { // Controlla il ruolo dell'utente
        window.location.href = "area-cliente.html"; // Impedisce l'accesso ai clienti
        return;
    }

    try {
        const ristoranti = await richiestaAPI( // Recupera il ristorante dell'utente dal backend
            "/ristoranti/miei",
            "GET",
            null,
            true // Richiesta autenticata tramite JWT
        );

        if (!ristoranti || ristoranti.length === 0) {
            window.location.href = "area-ristoratore.html"; // Se non ha un ristorante torna all'area ristoratore
            return;
        }

        mioRistorante = ristoranti[0]; // Memorizza il ristorante recuperato
        await caricaCatalogo(); // Carica i piatti del catalogo
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * CARICAMENTO CATALOGO
 * ============================================================
 */
async function caricaCatalogo(nome = "") { // Il parametro nome è opzionale
    try {
        pulisciMessaggio("messaggioCatalogo");

        const query = nome
            ? `?nome=${encodeURIComponent(nome)}` // Crea la query URL e codifica il testo inserito
            : "";

        catalogo = await richiestaAPI(
            `/catalogo${query}`, // Endpoint con eventuale parametro di ricerca
            "GET"
        );

        paginaCorrente = 1; // Dopo ogni ricerca riparte dalla prima pagina
        mostraPaginaCatalogo(); // Visualizza la pagina corrente del catalogo
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * VISUALIZZAZIONE CATALOGO
 * ============================================================
 */
function mostraPaginaCatalogo() {
    listaCatalogoPiatti.innerHTML = ""; // Svuota il catalogo visualizzato prima di ricrearlo

    if (!catalogo || catalogo.length === 0) {
        listaCatalogoPiatti.innerHTML = `
            <div class="col-12">
                <p class="text-muted">
                    Nessun piatto trovato nel catalogo.
                </p>
            </div>
        `;

        aggiornaPaginazione();
        return;
    }

    const inizio = (paginaCorrente - 1) * piattiPerPagina; // Calcola l'indice iniziale della pagina
    const fine = inizio + piattiPerPagina; // Calcola l'indice finale della pagina
    const piattiPagina = catalogo.slice(inizio, fine); // Estrae solo i piatti della pagina corrente

    piattiPagina.forEach(function (piatto) { // Scorre i piatti della pagina corrente
        const colonna = document.createElement("div"); // Crea dinamicamente un elemento HTML

        colonna.className = "col-sm-6 col-md-4 col-lg-3"; // Classi Bootstrap Grid responsive

        const ingredienti = piatto.ingredienti && 
            piatto.ingredienti.length > 0
                ? piatto.ingredienti.join(", ") // Converte l'array degli ingredienti in testo
                : "Ingredienti non disponibili";

        const immagine = piatto.immagine && piatto.immagine !== ""
                ? piatto.immagine
                : "../immagini/piatto-default.jpg"; // Usa l'immagine di default se assente

        colonna.innerHTML = ` 
            <div class="card h-100 shadow-sm">
                <img src="${immagine}" class="card-img-top immagine-card"
                    alt="Immagine piatto">
                <div class="card-body d-flex flex-column">
                    <h2 class="h5">${piatto.nome}</h2>
                    <p class="mb-1">
                        <strong>Categoria:</strong>
                        ${piatto.categoria}
                    </p>
                    <p class="mb-3">
                        <strong>Ingredienti:</strong>
                        ${ingredienti}
                    </p>
                    <div class="mt-auto">
                        <label for="prezzoCatalogo-${piatto._id}"
                            class="form-label">
                            Prezzo nel tuo menu
                        </label>
                        <input type="number" id="prezzoCatalogo-${piatto._id}"
                            class="form-control mb-2" min="0.01"
                            step="0.01" placeholder="Esempio: 8.50">
                        <button type="button" class="btn btn-danger w-100"
                            onclick="aggiungiPiattoAlMenu('${piatto._id}')">
                            Aggiungi al menu
                        </button>
                    </div>
                </div>
            </div>
        `;

        listaCatalogoPiatti.appendChild(colonna); // Aggiunge la card alla pagina
    });

    aggiornaPaginazione(); // Aggiorna testo e stato dei pulsanti della paginazione
}

/*
 * ============================================================
 * PAGINAZIONE
 * ============================================================
 */
function aggiornaPaginazione() {
    const numeroPagine = Math.ceil(catalogo.length / piattiPerPagina); // Calcola il numero totale di pagine arrotondando per eccesso

    if (numeroPagine === 0) {
        testoPagina.textContent = "";
        bottonePrecedente.disabled = true; // Disabilita i pulsanti se non ci sono risultati
        bottoneSuccessivo.disabled = true;
        return;
    }

    testoPagina.textContent = `Pagina ${paginaCorrente} di ${numeroPagine}`;
    bottonePrecedente.disabled = paginaCorrente === 1; // Disabilita Precedente nella prima pagina
    bottoneSuccessivo.disabled = paginaCorrente === numeroPagine; // Disabilita Successivo nell'ultima pagina
}

bottonePrecedente.addEventListener("click", function () { // Gestisce il click sul pulsante Precedente
    if (paginaCorrente > 1) {
        paginaCorrente--; // Passa alla pagina precedente
        mostraPaginaCatalogo(); // Ridisegna i piatti della nuova pagina
        window.scrollTo({ top: 0, behavior: "smooth" }); // Torna in cima alla pagina con scorrimento fluido
    }
});

bottoneSuccessivo.addEventListener("click", function () { // Gestisce il click sul pulsante Successivo
    const numeroPagine = Math.ceil(catalogo.length / piattiPerPagina); // Ricalcola il numero totale di pagine

    if (paginaCorrente < numeroPagine) {
        paginaCorrente++; // Passa alla pagina successiva
        mostraPaginaCatalogo();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

/*
 * ============================================================
 * RICERCA PER NOME
 * ============================================================
 */
formRicercaCatalogo.addEventListener( // Intercetta l'invio del form di ricerca
    "submit", async function (evento) {
        evento.preventDefault(); // Evita il normale refresh della pagina
        const nome = inputRicercaNome.value.trim(); // Legge il testo inserito
        await caricaCatalogo(nome); } // Ricarica il catalogo applicando la ricerca
);

/*
 * ============================================================
 * AGGIUNTA PIATTO AL MENU
 * ============================================================
 */
async function aggiungiPiattoAlMenu(idPiattoCatalogo) {
    pulisciMessaggio("messaggioCatalogo");

    const inputPrezzo = document.getElementById(
            `prezzoCatalogo-${idPiattoCatalogo}` // Recupera l'input prezzo specifico del piatto
        );

    const prezzo = Number(inputPrezzo.value); // Converte il valore dell'input in numero

    if (!prezzo || prezzo <= 0) { // Verifica che il prezzo sia valido
        mostraMessaggio(
            "messaggioCatalogo",
            "Inserisci un prezzo valido per aggiungere il piatto al menu.",
            "warning"
        );
        return;
    }

    const datiPiatto = { idPiattoCatalogo, ristorante: mioRistorante._id, prezzo, }; // Costruisce i dati da inviare al backend

    try {
        const risposta = await richiestaAPI(
            "/piatti/da-catalogo",
            "POST", // Crea nel menu un piatto basato sul catalogo
            datiPiatto,
            true // Richiesta autenticata tramite JWT
        );

        mostraMessaggio("messaggioCatalogo", risposta.messaggio || "Piatto aggiunto correttamente al menu.", "success");

        inputPrezzo.value = ""; // Svuota il campo prezzo dopo l'aggiunta
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * GESTIONE ERRORI
 * ============================================================
 */
function gestisciErrore(errore) {
    mostraMessaggio("messaggioCatalogo", errore.message, "danger"); // Mostra l'errore nella pagina
    
    console.error(errore); // Mostra l'errore anche nella console
}

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
inizializzaCatalogo(); // Avvia controllo accesso e caricamento iniziale