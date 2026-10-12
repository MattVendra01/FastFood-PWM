/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const formRicercaRistoranti = document.getElementById("formRicercaRistoranti"); // Recupera dal DOM il form di ricerca
const inputNomeRistorante = document.getElementById("nomeRistorante");
const inputCittaRistorante = document.getElementById("cittaRistorante");
const bottoneResetRicerca = document.getElementById("bottoneResetRicerca");
const listaRistoranti = document.getElementById("listaRistoranti");
const bottonePrecedente = document.getElementById("bottonePrecedente");
const bottoneSuccessivo = document.getElementById("bottoneSuccessivo");
const testoPagina = document.getElementById("testoPagina");
const ristorantiPerPagina = 6; // Numero massimo di ristoranti mostrati per pagina
let ristoranti = []; // Contiene i ristoranti ricevuti dal backend
let paginaCorrente = 1; // Pagina iniziale

/*
 * ============================================================
 * CARICAMENTO RISTORANTI
 * ============================================================
 */
async function caricaRistoranti(nome = "", citta = "") { // I parametri di ricerca sono opzionali
    try {
        pulisciMessaggio("messaggioRistoranti");

        const parametri = new URLSearchParams(); // Costruisce in modo sicuro i parametri della query string

        if (nome) {
            parametri.append("nome", nome); // Aggiunge ?nome=... se presente
        }

        if (citta) {
            parametri.append("citta", citta); // Aggiunge citta=... se presente
        }

        const query = parametri.toString(); // Converte i parametri in una query string
        const percorso = query
            ? `/ristoranti?${query}` // Endpoint con filtri
            : "/ristoranti"; // Endpoint senza filtri

        ristoranti = await richiestaAPI(percorso, "GET"); // Recupera i ristoranti dal backend
        paginaCorrente = 1; // Dopo ogni ricerca riparte dalla prima pagina
        mostraPaginaRistoranti();
    } catch (errore) {
        mostraMessaggio("messaggioRistoranti", errore.message, "danger");
        console.error(errore);
    }
}

/*
 * ============================================================
 * VISUALIZZAZIONE RISTORANTI
 * ============================================================
 */
function mostraPaginaRistoranti() {
    listaRistoranti.innerHTML = ""; // Svuota il contenitore prima di ridisegnarlo

    if (!ristoranti || ristoranti.length === 0) {
        mostraMessaggio("messaggioRistoranti", "Nessun ristorante trovato.", "warning");
        aggiornaPaginazione();
        return;
    }

    const inizio = (paginaCorrente - 1) * ristorantiPerPagina; // Calcola l'indice iniziale
    const fine = inizio + ristorantiPerPagina; // Calcola l'indice finale
    const ristorantiPagina = ristoranti.slice(inizio, fine); // Estrae solo i ristoranti della pagina corrente

    ristorantiPagina.forEach(function (ristorante) { // Scorre i ristoranti da visualizzare
        const immagine = ristorante.immagine || "../immagini/ristorante-default.jpg"; // Usa immagine di default se assente
        const colonna = document.createElement("div"); // Crea dinamicamente una colonna HTML
        colonna.className = "col-sm-6 col-md-4"; // Classi Bootstrap Grid responsive
        colonna.innerHTML = `
            <div class="card card-app shadow-sm">
                <img src="${immagine}" class="card-img-top card-app-img"
                    alt="Immagine ristorante">
                <div class="card-body d-flex flex-column">
                    <h2 class="h5 card-title">${ristorante.nomeRistorante}</h2>
                    <p class="card-text mb-1">
                        <strong>Città:</strong>
                        ${ristorante.citta}
                    </p>
                    <p class="card-text mb-1">
                        <strong>Indirizzo:</strong>
                        ${ristorante.indirizzo}
                    </p>
                    <p class="card-text">
                        <strong>Telefono:</strong>
                        ${ristorante.telefono}
                    </p>
                    <a href="menu.html?idRistorante=${ristorante._id}"
                        class="btn btn-danger mt-auto">
                        Visualizza menu
                    </a>
                </div>
            </div>
        `; // Passa l'ID del ristorante alla pagina menu tramite parametro URL
        listaRistoranti.appendChild(colonna); // Inserisce la card nel DOM
    });
    aggiornaPaginazione();
}

/*
 * ============================================================
 * PAGINAZIONE
 * ============================================================
 */
function aggiornaPaginazione() {
    const numeroPagine = Math.ceil(ristoranti.length / ristorantiPerPagina); // Calcola il numero totale di pagine

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
        paginaCorrente--; // Passa alla pagina precedente
        mostraPaginaRistoranti();

        window.scrollTo({ top: 0, behavior: "smooth" }); // Torna in cima con scorrimento fluido
    }
});

bottoneSuccessivo.addEventListener("click", function () { // Evento sul pulsante Successivo
    const numeroPagine = Math.ceil(ristoranti.length / ristorantiPerPagina);

    if (paginaCorrente < numeroPagine) {
        paginaCorrente++; // Passa alla pagina successiva
        mostraPaginaRistoranti();

        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

/*
 * ============================================================
 * RICERCA RISTORANTI
 * ============================================================
 */
formRicercaRistoranti.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault(); // Evita il submit tradizionale e il refresh della pagina

        const nome = inputNomeRistorante.value.trim(); // Recupera i criteri di ricerca
        const citta = inputCittaRistorante.value.trim();

        caricaRistoranti(nome, citta); // Ricarica i ristoranti applicando i filtri
    }
);

bottoneResetRicerca.addEventListener(
    "click",
    function () {
        inputNomeRistorante.value = ""; // Svuota i filtri
        inputCittaRistorante.value = "";

        caricaRistoranti(); // Ricarica tutti i ristoranti senza filtri
    }
);

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
caricaRistoranti(); // Carica tutti i ristoranti all'apertura della pagina