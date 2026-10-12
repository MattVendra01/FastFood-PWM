/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const sezioneCliente = document.getElementById("sezioneCliente"); // Recupera dal DOM la sezione dedicata al cliente
const sezioneRistoratore = document.getElementById("sezioneRistoratore"); // Recupera la sezione dedicata al ristoratore
const listaAcquistiCliente = document.getElementById("listaAcquistiCliente");
const listaOrdiniRistoratore = document.getElementById("listaOrdiniRistoratore");
const statisticheRistorante = document.getElementById("statisticheRistorante");
const nomeRistoranteGestito = document.getElementById("nomeRistoranteGestito");
const bottoneTornaArea = document.getElementById("bottoneTornaArea");
let idRistoranteAttivo = null; // Conterrà l'ID del ristorante gestito dal ristoratore

/*
 * ============================================================
 * FUNZIONE DI SUPPORTO
 * ============================================================
 */
function gestisciErrore(errore) {
    mostraMessaggio("messaggioOrdini", errore.message, "danger"); // Mostra l'errore nella pagina
    console.error(errore); // Mostra l'errore anche nella console
}

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
function inizializzaPagina() {
    if (!utenteAutenticato()) { // Controlla che l'utente sia autenticato
        window.location.href = "login.html"; // Reindirizza al login
        return;
    }

    const utente = leggiUtente(); // Recupera i dati dell'utente dal browser

    if (!utente) {
        window.location.href = "login.html";
        return;
    }

    if (utente.tipoUtente === "cliente") { // Configura la pagina per il ruolo cliente
        bottoneTornaArea.href = "area-cliente.html";

        sezioneCliente.classList.remove("d-none"); // Mostra la sezione cliente

        caricaAcquistiCliente(); // Carica gli ordini del cliente
        return;
    }

    if (utente.tipoUtente === "ristoratore") { // Configura la pagina per il ruolo ristoratore
        bottoneTornaArea.href = "area-ristoratore.html";

        sezioneRistoratore.classList.remove("d-none"); // Mostra la sezione ristoratore

        inizializzaAreaRistoratore(); // Avvia il caricamento del ristorante e dei suoi ordini
        return;
    }

    window.location.href = "login.html"; // Ruoli non previsti vengono reindirizzati
}

/*
 * ============================================================
 * ORDINI CLIENTE
 * ============================================================
 */
async function caricaAcquistiCliente() {
    try {
        const risposta = await richiestaAPI(
            "/ordini/acquisti",
            "GET",
            null,
            true // Richiesta autenticata tramite JWT
        );

        mostraAcquistiCliente(risposta); // Passa i dati alla funzione di visualizzazione
    } catch (errore) {
        gestisciErrore(errore);
    }
}

function mostraAcquistiCliente(risposta) {
    listaAcquistiCliente.innerHTML = ""; // Svuota la lista prima di ricrearla

    const acquistiPresenti = risposta.acquistiPresenti || []; // Ordini ancora in corso
    const acquistiPassati = risposta.acquistiPassati || []; // Ordini conclusi

    if (acquistiPresenti.length === 0 && acquistiPassati.length === 0) {
        listaAcquistiCliente.innerHTML = `
            <p class="text-muted mb-0">
                Non hai ancora effettuato ordini.
            </p>
        `;
        return;
    }

    if (acquistiPresenti.length > 0) {
        listaAcquistiCliente.innerHTML += `<h3 class="h6 mt-3">Ordini presenti</h3>`;

        acquistiPresenti.forEach(function (ordine) { // Scorre gli ordini presenti
            listaAcquistiCliente.appendChild(
                creaCardOrdine(ordine, false) // Crea la card senza cambio stato
            );
        });
    }

    if (acquistiPassati.length > 0) {
        listaAcquistiCliente.innerHTML += `<h3 class="h6 mt-4">Ordini passati</h3>`;

        acquistiPassati.forEach(function (ordine) {
            listaAcquistiCliente.appendChild(
                creaCardOrdine(ordine, false)
            );
        });
    }
}

/*
 * ============================================================
 * AREA RISTORATORE
 * ============================================================
 */
async function inizializzaAreaRistoratore() {
    try {
        const ristoranti = await richiestaAPI(
            "/ristoranti/miei",
            "GET",
            null,
            true // Recupera i ristoranti dell'utente autenticato
        );

        if (!ristoranti || ristoranti.length === 0) {
            nomeRistoranteGestito.textContent = "Nessun ristorante trovato.";

            mostraMessaggio(
                "messaggioOrdini",
                "Prima di gestire gli ordini devi creare un ristorante.",
                "warning"
            );
            return;
        }

        const ristorante = ristoranti[0]; // Recupera il ristorante gestito

        idRistoranteAttivo = ristorante._id; // Salva l'ID per le richieste successive

        nomeRistoranteGestito.textContent = `Ristorante gestito: ${ristorante.nomeRistorante}`;

        await caricaOrdiniRistoratore(); // Carica gli ordini del ristorante
        await caricaStatisticheRistorante(); // Carica le statistiche
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * ORDINI RISTORATORE
 * ============================================================
 */
async function caricaOrdiniRistoratore() {
    try {
        const ordini = await richiestaAPI(
            `/ordini/ristorante/${idRistoranteAttivo}`, // Endpoint specifico del ristorante
            "GET",
            null,
            true
        );

        mostraOrdiniRistoratore(ordini);
    } catch (errore) {
        gestisciErrore(errore);
    }
}

function mostraOrdiniRistoratore(ordini) {
    listaOrdiniRistoratore.innerHTML = "";

    if (!ordini || ordini.length === 0) {
        listaOrdiniRistoratore.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body text-muted">
                    Nessun ordine trovato per questo ristorante.
                </div>
            </div>
        `;
        return;
    }

    ordini.forEach(function (ordine) { // Scorre tutti gli ordini del ristorante
        listaOrdiniRistoratore.appendChild(
            creaCardOrdine(ordine, true) // true abilita l'area per cambiare stato
        );
    });
}

/*
 * ============================================================
 * CAMBIO STATO ORDINE
 * ============================================================
 */
async function cambiaStatoOrdine(idOrdine, nuovoStato) {
    const dati = { stato: nuovoStato }; // Oggetto da inviare al backend

    if (nuovoStato === "in preparazione") {
        const minuti = Number(
            document.getElementById(`tempo-${idOrdine}`).value // Recupera i minuti inseriti
        );

        if (!minuti || minuti <= 0) {
            mostraMessaggio(
                "messaggioOrdini",
                "Inserisci un tempo di preparazione valido.",
                "warning"
            );
            return;
        }

        dati.tempoPreparazioneMinuti = minuti; // Aggiunge il tempo solo per lo stato in preparazione
    }

    try {
        await richiestaAPI(
            `/ordini/${idOrdine}/stato`, // Endpoint dell'ordine specifico
            "PUT", // Aggiorna lo stato dell'ordine
            dati,
            true
        );

        mostraMessaggio(
            "messaggioOrdini",
            "Stato ordine aggiornato correttamente.",
            "success"
        );

        await caricaOrdiniRistoratore(); // Ricarica gli ordini aggiornati
        await caricaStatisticheRistorante(); // Aggiorna anche le statistiche
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * STATISTICHE RISTORANTE
 * ============================================================
 */
async function caricaStatisticheRistorante() {
    try {
        const statistiche = await richiestaAPI(
            `/ordini/ristorante/${idRistoranteAttivo}/statistiche`, // Richiesta delle statistiche del ristorante
            "GET",
            null,
            true
        );

        mostraStatistiche(statistiche);
    } catch (errore) {
        gestisciErrore(errore);
    }
}

function mostraStatistiche(statistiche) {
    statisticheRistorante.innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="border rounded p-3 h-100">
                    <div class="text-muted">
                        Ordini totali
                    </div>
                    <div class="h4 mb-0">
                        ${statistiche.numeroOrdini || 0}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="border rounded p-3 h-100">
                    <div class="text-muted">
                        Totale incassato
                    </div>
                    <div class="h4 mb-0">
                        € ${Number(statistiche.incassoTotale || 0).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/*
 * ============================================================
 * CREAZIONE CARD ORDINE
 * ============================================================
 */
function creaCardOrdine(ordine, mostraCambioStato) {
    const card = document.createElement("div"); // Crea dinamicamente una card

    card.className = "card shadow-sm mb-3"; // Applica classi Bootstrap

    const totale = Number(ordine.totale || 0); // Converte il totale in numero

    const dataOrdine = ordine.dataCreazione
        ? new Date(ordine.dataCreazione).toLocaleString("it-IT") // Converte la data in formato italiano
        : "Data non disponibile";

    const statoOrdine = ordine.stato || "Stato non disponibile";

    let righePiatti = "";

    if (ordine.piatti && ordine.piatti.length > 0) {
        ordine.piatti.forEach(function (elemento) { // Costruisce le righe dei piatti ordinati
            righePiatti += `
                <tr>
                    <td>${elemento.nome || "Piatto non disponibile"}</td>
                    <td>${elemento.quantita}</td>
                </tr>
            `;
        });
    } else {
        righePiatti = `
            <tr>
                <td colspan="2" class="text-muted">Nessun piatto disponibile</td>
            </tr>
        `;
    }

    let areaTempoPreparazione = "";

    if (ordine.tempoPreparazioneMinuti) {
        let testoTempoPreparazione = `${ordine.tempoPreparazioneMinuti} minuti`;

        if (ordine.stato === "in preparazione" && ordine.finePreparazioneStimata) {
            const fine = new Date(ordine.finePreparazioneStimata); // Converte la fine stimata in oggetto Date
            const minutiRimanenti = Math.max(0, Math.ceil((fine - new Date()) / 60000)); // Calcola i minuti rimanenti
            testoTempoPreparazione += ` - circa ${minutiRimanenti} minuti rimanenti`;
        }

        areaTempoPreparazione = `
            <div class="col-md-6">
                <p class="mb-1">
                    <strong>Tempo preparazione:</strong>
                    ${testoTempoPreparazione}
                </p>
            </div>
        `;
    }

    let areaCambioStato = "";

    if (mostraCambioStato) { // Crea i controlli solo nella vista del ristoratore
        areaCambioStato = `
            <div class="mt-3">
                <label for="stato-${ordine._id}" class="form-label">
                    Cambia stato ordine
                </label>
                <div class="d-flex gap-2">
                    <select class="form-select" id="stato-${ordine._id}">
                        <option value="ordinato"
                            ${statoOrdine === "ordinato" ? "selected" : ""}>
                            Ordinato
                        </option>
                        <option value="in preparazione"
                            ${statoOrdine === "in preparazione" ? "selected" : ""}>
                            In preparazione
                        </option>
                        <option value="in consegna"
                            ${statoOrdine === "in consegna" ? "selected" : ""}>
                            In consegna
                        </option>
                        <option value="consegnato"
                            ${statoOrdine === "consegnato" ? "selected" : ""}>
                            Consegnato
                        </option>
                    </select>
                    <input type="number" min="1" class="form-control"
                        id="tempo-${ordine._id}" placeholder="Minuti">
                    <button type="button" class="btn btn-danger"
                        onclick="cambiaStatoOrdine(
                            '${ordine._id}',
                            document.getElementById(
                                'stato-${ordine._id}'
                            ).value
                        )">
                        Aggiorna
                    </button>
                </div>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h3 class="h5 mb-1">Ordine del ${dataOrdine}</h3>
                    <p class="text-muted mb-0">
                        Codice ordine: ${ordine._id}
                    </p>
                    <p class="text-muted mb-0">
                        Ristorante:
                        ${ordine.nomeRistorante ||
                        "Ristorante non disponibile"}
                    </p>
                </div>
                <span class="badge bg-danger">${statoOrdine}</span>
            </div>
            <div class="table-responsive">
                <table class="table table-sm align-middle">
                    <thead>
                        <tr>
                            <th>Piatto</th>
                            <th>Quantità</th>
                        </tr>
                    </thead>
                    <tbody>${righePiatti}</tbody>
                </table>
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <p class="mb-1">
                        <strong>Totale:</strong>
                        € ${totale.toFixed(2)}
                    </p>
                </div>
                ${areaTempoPreparazione}
            </div>
            ${areaCambioStato}
        </div>
    `;
    return card; // Restituisce la card pronta da inserire nel DOM
}

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
inizializzaPagina(); // Avvia la configurazione della pagina in base al ruolo