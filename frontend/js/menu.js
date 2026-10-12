/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const listaPiatti = document.getElementById("listaPiatti"); // Recupera dal DOM il contenitore dei piatti
const formRicercaPiatti = document.getElementById("formRicercaPiatti");
const inputNomePiatto = document.getElementById("nomePiatto");
const inputCategoriaPiatto = document.getElementById("categoriaPiatto");
const inputPrezzoMin = document.getElementById("prezzoMin");
const inputPrezzoMax = document.getElementById("prezzoMax");
const bottoneResetPiatti = document.getElementById("bottoneResetPiatti");
const titoloMenu = document.getElementById("titoloMenu");
const infoRistorante = document.getElementById("infoRistorante");
const bottoneVaiCarrello = document.getElementById("bottoneVaiCarrello");
const idRistorante = new URLSearchParams(window.location.search).get("idRistorante"); // Legge idRistorante dai parametri dell'URL
const bottonePrecedente = document.getElementById("bottonePrecedente");
const bottoneSuccessivo = document.getElementById("bottoneSuccessivo");
const testoPagina = document.getElementById("testoPagina");
const piattiPerPagina = 8; // Numero massimo di piatti mostrati per pagina
const utenteMenu = leggiUtente(); // Recupera i dati dell'utente salvati nel browser
let piattiMenu = []; // Contiene tutti i piatti ricevuti dal backend
let piattiVisualizzati = []; // Contiene i piatti attualmente mostrabili dopo eventuali filtri
let paginaCorrente = 1; // Pagina iniziale

/*
 * ============================================================
 * CONFIGURAZIONE DELLA PAGINA
 * ============================================================
 */
if (utenteMenu && utenteMenu.tipoUtente === "cliente") { // Mostra il carrello solo ai clienti
    bottoneVaiCarrello.classList.remove("d-none"); // Rimuove la classe Bootstrap che nasconde il bottone
}

/*
 * ============================================================
 * CARICAMENTO DEL MENU
 * ============================================================
 */
async function caricaPiattiRistorante() {
    pulisciMessaggio("messaggioPiatti");

    if (!idRistorante) { // Controlla che l'ID del ristorante sia presente nell'URL
        mostraMessaggio(
            "messaggioPiatti",
            "ID ristorante mancante nell'URL.",
            "danger"
        );
        return;
    }

    try {
        const piatti = await richiestaAPI(
            `/piatti/ristorante/${idRistorante}`, // Inserisce dinamicamente l'ID nell'endpoint
            "GET"
        );

        piattiMenu = piatti; // Salva tutti i piatti ricevuti
        piattiVisualizzati = piatti; // All'inizio visualizza tutti i piatti
        paginaCorrente = 1;
        aggiornaIntestazioneRistorante(piatti);
        mostraPaginaPiatti(); // Visualizza la prima pagina
    } catch (errore) {
        mostraMessaggio("messaggioPiatti", errore.message, "danger");

        console.error(errore);
    }
}

/*
 * ============================================================
 * INTESTAZIONE DEL RISTORANTE
 * ============================================================
 */
function aggiornaIntestazioneRistorante(piatti) {
    if (!piatti || piatti.length === 0) {
        titoloMenu.textContent = "Menu ristorante";
        infoRistorante.textContent = "";
        return;
    }

    const ristorante = piatti[0].ristorante; // Recupera i dati del ristorante dal primo piatto

    if (ristorante) {
        titoloMenu.textContent = `Menu di ${ristorante.nomeRistorante}`; // Aggiorna il titolo nel DOM
        infoRistorante.textContent = `${ristorante.indirizzo}, ${ristorante.citta}`;
    }
}

/*
 * ============================================================
 * VISUALIZZAZIONE DEI PIATTI
 * ============================================================
 */
function mostraPaginaPiatti() {
    const inizio = (paginaCorrente - 1) * piattiPerPagina; // Calcola l'indice iniziale
    const fine = inizio + piattiPerPagina; // Calcola l'indice finale
    mostraPiatti(piattiVisualizzati.slice(inizio, fine)); // Estrae solo i piatti della pagina corrente
    aggiornaPaginazione(); // Aggiorna pulsanti e numero pagina
}

function mostraPiatti(piatti) {
    listaPiatti.innerHTML = ""; // Svuota il contenitore prima di ridisegnare i piatti

    if (!piatti || piatti.length === 0) {
        mostraMessaggio("messaggioPiatti", "Nessun piatto trovato.", "warning");
        return;
    }

    piatti.forEach(function (piatto) { // Scorre tutti i piatti da visualizzare
        const immagine = piatto.immagine && piatto.immagine !== ""
            ? piatto.immagine
            : "../immagini/piatto-default.jpg"; // Usa immagine di default se mancante

        const ingredienti = piatto.ingredienti && piatto.ingredienti.length > 0
            ? piatto.ingredienti.join(", ") // Converte l'array in testo separato da virgole
            : "Ingredienti non disponibili";

        const allergeni = piatto.allergeni && piatto.allergeni.length > 0
            ? piatto.allergeni.join(", ")
            : "Nessun allergene indicato";

        const colonna = document.createElement("div"); // Crea dinamicamente un elemento HTML
        colonna.className = "col-sm-6 col-md-4 col-lg-3"; // Classi Bootstrap Grid responsive

        const bottoneCarrello = utenteMenu && utenteMenu.tipoUtente === "cliente"
            ? `
                <button type="button" class="btn btn-danger" 
                    onclick="aggiungiPiattoAlCarrello('${piatto._id}')"> 
                        Aggiungi al carrello
                </button>
            `
            : ""; // Il bottone viene creato solo se l'utente è cliente

        colonna.innerHTML = `
            <div class="card card-app shadow-sm">
                <img src="${immagine}" class="card-img-top immagine-card"
                    alt="Immagine piatto">
                <div class="card-body d-flex flex-column">
                    <h2 class="h5 card-title">${piatto.nome}</h2>
                    <p class="card-text testo-piccolo">
                        <strong>Ingredienti:</strong>
                        ${ingredienti}
                    </p>
                    <p class="card-text testo-piccolo">
                        <strong>Allergeni:</strong>
                        ${allergeni}
                    </p>
                    <p class="prezzo-piatto mt-auto">
                        € ${Number(piatto.prezzo).toFixed(2)}
                    </p>
                    ${bottoneCarrello}
                </div>
            </div>
        `;

        listaPiatti.appendChild(colonna); // Aggiunge la card al DOM
    });
}

/*
 * ============================================================
 * PAGINAZIONE
 * ============================================================
 */
function aggiornaPaginazione() {
    const numeroPagine = Math.ceil(piattiVisualizzati.length / piattiPerPagina); // Calcola il numero totale di pagine

    if (numeroPagine === 0) {
        testoPagina.textContent = "";
        bottonePrecedente.disabled = true;
        bottoneSuccessivo.disabled = true;
        return;
    }

    testoPagina.textContent = `Pagina ${paginaCorrente} di ${numeroPagine}`;
    bottonePrecedente.disabled = paginaCorrente === 1; // Disabilita Precedente nella prima pagina
    bottoneSuccessivo.disabled = paginaCorrente === numeroPagine; // Disabilita Successivo nell'ultima
}

bottonePrecedente.addEventListener("click", function () { // Evento sul pulsante Precedente
    if (paginaCorrente > 1) {
        paginaCorrente--; // Decrementa il numero della pagina
        mostraPaginaPiatti();
    }
});

bottoneSuccessivo.addEventListener("click", function () { // Evento sul pulsante Successivo
    const numeroPagine = Math.ceil(piattiVisualizzati.length / piattiPerPagina);

    if (paginaCorrente < numeroPagine) {
        paginaCorrente++; // Incrementa il numero della pagina
        mostraPaginaPiatti();
    }
});

/*
 * ============================================================
 * AGGIUNTA AL CARRELLO
 * ============================================================
 */
function aggiungiPiattoAlCarrello(idPiatto) {
    const piatto = piattiMenu.find(function (elemento) { // Cerca il piatto completo tramite ID
        return elemento._id === idPiatto;
    });

    if (!piatto) {
        mostraMessaggio("messaggioPiatti", "Piatto non trovato.", "danger");

        return;
    }

    aggiungiAlCarrello(piatto, idRistorante); // Richiama la funzione definita nel file del carrello
    mostraMessaggio("messaggioPiatti", "Piatto aggiunto al carrello.", "success");
}

/*
 * ============================================================
 * RICERCA NEL MENU
 * ============================================================
 */
function filtraPiatti() {
    const nome = inputNomePiatto.value.trim().toLowerCase(); // Normalizza il testo della ricerca
    const categoria = inputCategoriaPiatto.value.trim().toLowerCase();
    const prezzoMin = inputPrezzoMin.value;
    const prezzoMax = inputPrezzoMax.value;

    const piattiFiltrati = piattiMenu.filter(function (piatto) { // Filtra lato frontend l'array completo
        return (
            (!nome || piatto.nome.toLowerCase().includes(nome)) && // Ricerca parziale per nome
            (!categoria || piatto.categoria.toLowerCase().includes(categoria)) && // Ricerca parziale per categoria
            (!prezzoMin || piatto.prezzo >= Number(prezzoMin)) && // Controlla il prezzo minimo
            (!prezzoMax || piatto.prezzo <= Number(prezzoMax)) // Controlla il prezzo massimo
        );
    });

    piattiVisualizzati = piattiFiltrati; // Sostituisce l'insieme attualmente visualizzato
    paginaCorrente = 1; // Dopo il filtro torna alla prima pagina
    mostraPaginaPiatti();
}

/*
 * ============================================================
 * EVENTI DI RICERCA
 * ============================================================
 */
formRicercaPiatti.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault(); // Evita il refresh standard del form
        pulisciMessaggio("messaggioPiatti");
        filtraPiatti(); // Applica i filtri inseriti
    }
);

bottoneResetPiatti.addEventListener(
    "click",
    function () {
        formRicercaPiatti.reset(); // Svuota tutti i campi del form
        pulisciMessaggio("messaggioPiatti");
        mostraPiatti(piattiMenu); // Mostra nuovamente tutti i piatti
    }
);

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
caricaPiattiRistorante(); // Avvia il caricamento del menu all'apertura della pagina