/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const utenteRistoratore = leggiUtente(); // Recupera dal localStorage i dati dell'utente
const sezioneCreaRistorante = document.getElementById("sezioneCreaRistorante"); // Recupera elemento HTML tramite id
const sezioneMenuRistorante = document.getElementById("sezioneMenuRistorante");
const formCreaRistorante = document.getElementById("formCreaRistorante");
const formModificaRistorante = document.getElementById("formModificaRistorante");
const formCreaPiatto = document.getElementById("formCreaPiatto");
const formModificaPiatto = document.getElementById("formModificaPiatto");
const datiMioRistorante = document.getElementById("datiMioRistorante");
const listaMenuRistoratore = document.getElementById("listaMenuRistoratore");
const bottoneMostraFormRistorante = document.getElementById("bottoneMostraFormRistorante");
const bottoneMostraFormPiatto = document.getElementById("bottoneMostraFormPiatto");
const bottoneAnnullaModificaPiatto = document.getElementById("bottoneAnnullaModificaPiatto");
const bottoneEliminaRistorante = document.getElementById("bottoneEliminaRistorante");
let mioRistorante = null; // Memorizza il ristorante caricato dal backend

/*
 * ============================================================
 * FUNZIONI DI SUPPORTO
 * ============================================================
 */
function valoreCampo(id) {
    return document.getElementById(id).value.trim(); // Legge il valore dell'input e rimuove spazi
}

function creaLista(testo) {
    return testo
        .split(",") // Divide il testo in un array usando le virgole
        .map(function (elemento) { return elemento.trim(); }) // Rimuove gli spazi da ogni elemento
        .filter(function (elemento) { return elemento !== ""; }); // Elimina eventuali elementi vuoti
}

function gestisciErrore(errore) {
    mostraMessaggio("messaggioRistoratore", errore.message, "danger");

    console.error(errore); // Mostra l'errore anche nella console
}

function nascondiPannelli() {
    formModificaRistorante.classList.add("d-none"); // d-none Bootstrap nasconde l'elemento
    formCreaPiatto.classList.add("d-none");
    formModificaPiatto.classList.add("d-none");
}

function alternaPannello(pannello) {
    const pannelloNascosto = pannello.classList.contains("d-none"); // Controlla se è nascosto

    nascondiPannelli();

    if (pannelloNascosto) {
        pannello.classList.remove("d-none"); // Rimuove d-none e mostra il pannello
    }
}

/*
 * ============================================================
 * VALIDAZIONE RISTORANTE
 * ============================================================
 */
function validaDatiRistorante(datiRistorante) {
    if (!/^\d{8,15}$/.test(datiRistorante.telefono)) { // Regex: telefono da 8 a 15 cifre
        mostraMessaggio(
            "messaggioRistoratore",
            "Il telefono del ristorante deve contenere solo numeri, da 8 a 15 cifre.",
            "danger"
        );
        return false;
    }

    if (!/^\d{11}$/.test(datiRistorante.partitaIVA)) { // Regex: Partita IVA di 11 cifre
        mostraMessaggio(
            "messaggioRistoratore",
            "La Partita IVA deve contenere esattamente 11 cifre numeriche.",
            "danger"
        );
        return false;
    }
    return true;
}

/*
 * ============================================================
 * CONTROLLO ACCESSO RISTORATORE
 * ============================================================
 */
function inizializzaAreaRistoratore() {
    if (!utenteAutenticato() || !utenteRistoratore) { // Controlla che l'utente sia autenticato
        window.location.href = "login.html"; // Reindirizza alla pagina di login
        return;
    }

    if (utenteRistoratore.tipoUtente !== "ristoratore") { // Controlla il ruolo
        window.location.href = "area-cliente.html"; // Impedisce l'accesso ai clienti
        return;
    }

    document.getElementById("benvenutoRistoratore").textContent =
        `Benvenuto, ${utenteRistoratore.nome || "ristoratore"}.`; // Modifica il testo nel DOM

    caricaMioRistorante(); // Avvia il caricamento dei dati del ristorante
}

/*
 * ============================================================
 * CARICAMENTO RISTORANTE
 * ============================================================
 */
async function caricaMioRistorante() {
    try {
        const ristoranti = await richiestaAPI( // Richiesta al backend
            "/ristoranti/miei",
            "GET",
            null,
            true // Richiesta autenticata con token JWT
        );

        if (!ristoranti || ristoranti.length === 0) {
            mioRistorante = null;

            sezioneCreaRistorante.classList.remove("d-none"); // Mostra creazione ristorante
            sezioneMenuRistorante.classList.add("d-none"); // Nasconde gestione ristorante

            return;
        }

        mioRistorante = ristoranti[0]; // Salva il ristorante restituito dal backend
        sezioneCreaRistorante.classList.add("d-none");
        sezioneMenuRistorante.classList.remove("d-none");
        mostraDatiMioRistorante();
        riempiFormModificaRistorante();
        await caricaMenuMioRistorante(); // Attende il caricamento del menu
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * VISUALIZZAZIONE RISTORANTE
 * ============================================================
 */
function mostraDatiMioRistorante() {
    datiMioRistorante.innerHTML = `
        <div class="alert alert-light border">
            <strong>${mioRistorante.nomeRistorante}</strong><br>
            ${mioRistorante.indirizzo}, ${mioRistorante.citta}<br>
            Telefono: ${mioRistorante.telefono}<br>
            Partita IVA: ${mioRistorante.partitaIVA}
        </div>
    `;
}

function riempiFormModificaRistorante() {
    document.getElementById("modificaNomeRistorante").value = mioRistorante.nomeRistorante || ""; // Precompila l'input con il valore attuale
    document.getElementById("modificaPartitaIVA").value = mioRistorante.partitaIVA || "";
    document.getElementById("modificaTelefonoRistorante").value = mioRistorante.telefono || "";
    document.getElementById("modificaCittaRistorante").value = mioRistorante.citta || "";
    document.getElementById("modificaIndirizzoRistorante").value = mioRistorante.indirizzo || "";
    document.getElementById("modificaImmagineRistorante").value = mioRistorante.immagine || "";
}

/*
 * ============================================================
 * CREAZIONE RISTORANTE
 * ============================================================
 */
formCreaRistorante.addEventListener( // Ascolta l'invio del form
    "submit",
    async function (evento) {
        evento.preventDefault(); // Impedisce il normale refresh della pagina

        pulisciMessaggio("messaggioRistoratore");

        const datiRistorante = { // Costruisce l'oggetto da inviare al backend
            nomeRistorante: valoreCampo("nomeRistorante"),
            partitaIVA: valoreCampo("partitaIVA"),
            telefono: valoreCampo("telefonoRistorante"),
            citta: valoreCampo("citta"),
            indirizzo: valoreCampo("indirizzo"),
            immagine: valoreCampo("immagine")
        };

        if (!validaDatiRistorante(datiRistorante)) {
            return;
        }

        try {
            const risposta = await richiestaAPI(
                "/ristoranti",
                "POST", // POST per creare una nuova risorsa
                datiRistorante,
                true
            );

            mostraMessaggio("messaggioRistoratore", risposta.messaggio || "Ristorante creato correttamente.", "success");

            formCreaRistorante.reset(); // Svuota i campi del form
            await caricaMioRistorante(); // Ricarica i dati aggiornati
        } catch (errore) {
            gestisciErrore(errore);
        }
    }
);

/*
 * ============================================================
 * MODIFICA RISTORANTE
 * ============================================================
 */
bottoneMostraFormRistorante.addEventListener( // Gestisce il click su Modifica
    "click",
    function () {
        alternaPannello(formModificaRistorante); // Mostra/nasconde il form già presente nell'HTML

        if (!formModificaRistorante.classList.contains("d-none")) {
            riempiFormModificaRistorante(); // Precompila il form con i dati correnti
        }
    }
);

formModificaRistorante.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        pulisciMessaggio("messaggioRistoratore");

        const datiRistorante = { // Legge i nuovi valori inseriti nel form
            nomeRistorante: valoreCampo("modificaNomeRistorante"),
            partitaIVA: valoreCampo("modificaPartitaIVA"),
            telefono: valoreCampo("modificaTelefonoRistorante"),
            citta: valoreCampo("modificaCittaRistorante"),
            indirizzo: valoreCampo("modificaIndirizzoRistorante"),
            immagine: valoreCampo("modificaImmagineRistorante")
        };

        if (!validaDatiRistorante(datiRistorante)) {
            return;
        }

        try {
            const risposta = await richiestaAPI(
                "/ristoranti/mio",
                "PUT", // PUT per modificare la risorsa esistente
                datiRistorante,
                true
            );

            mostraMessaggio("messaggioRistoratore", risposta.messaggio || "Ristorante modificato correttamente.", "success");

            formModificaRistorante.classList.add("d-none"); // Nasconde il form
            await caricaMioRistorante(); // Ricarica i dati dopo la modifica
        } catch (errore) {
            gestisciErrore(errore);
        }
    }
);

/*
 * ============================================================
 * ELIMINAZIONE RISTORANTE
 * ============================================================
 */
bottoneEliminaRistorante.addEventListener(
    "click",
    async function () {
        const conferma = confirm( // Mostra finestra di conferma del browser
            "Sei sicuro di voler eliminare definitivamente il tuo ristorante? Verranno eliminati anche i piatti del menu."
        );

        if (!conferma) {
            return;
        }

        try {
            const risposta = await richiestaAPI(
                "/ristoranti/mio",
                "DELETE", // DELETE per eliminare la risorsa
                null,
                true
            );

            mostraMessaggio("messaggioRistoratore", risposta.messaggio || "Ristorante eliminato correttamente.", "success");

            nascondiPannelli();
            await caricaMioRistorante();
        } catch (errore) {
            gestisciErrore(errore);
        }
    }
);

/*
 * ============================================================
 * CREAZIONE PIATTO
 * ============================================================
 */
bottoneMostraFormPiatto.addEventListener(
    "click",
    function () {
        alternaPannello(formCreaPiatto); // Mostra/nasconde il form di creazione
    }
);

formCreaPiatto.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault(); // Evita il refresh della pagina

        pulisciMessaggio("messaggioRistoratore");

        if (!mioRistorante) {
            mostraMessaggio("messaggioRistoratore",
                "Prima devi creare un ristorante.",
                "warning");
            return;
        }

        const datiPiatto = { // Costruisce il piatto da inviare al backend
            ristorante: mioRistorante._id,
            nome: valoreCampo("nomePiatto"),
            categoria: valoreCampo("categoriaPiatto"),
            prezzo: Number(valoreCampo("prezzoPiatto")), // Converte il valore in numero
            ingredienti: creaLista(valoreCampo("ingredientiPiatto")), // Testo separato da virgole → array
            allergeni: creaLista(valoreCampo("allergeniPiatto")),
            immagine: valoreCampo("immaginePiatto"),
        };

        try {
            const risposta = await richiestaAPI(
                "/piatti",
                "POST", // Crea il nuovo piatto
                datiPiatto,
                true
            );

            mostraMessaggio("messaggioRistoratore", risposta.messaggio || "Piatto aggiunto correttamente.", "success");

            formCreaPiatto.reset();
            formCreaPiatto.classList.add("d-none");
            await caricaMenuMioRistorante(); // Aggiorna il menu visualizzato
        } catch (errore) {
            gestisciErrore(errore);
        }
    }
);

/*
 * ============================================================
 * CARICAMENTO MENU
 * ============================================================
 */
async function caricaMenuMioRistorante() {
    if (!mioRistorante) {
        return;
    }

    try {
        const piatti = await richiestaAPI(
            `/piatti/ristorante/${mioRistorante._id}`, // ID inserito dinamicamente nell'URL
            "GET"
        );

        mostraMenuRistoratore(piatti); // Passa i risultati alla funzione di visualizzazione
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * VISUALIZZAZIONE MENU
 * ============================================================
 */
function mostraMenuRistoratore(piatti) {
    listaMenuRistoratore.innerHTML = ""; // Svuota il menu prima di ricrearlo

    if (!piatti || piatti.length === 0) {
        listaMenuRistoratore.innerHTML = `
            <div class="col-12">
                <p class="text-muted">
                    Non hai ancora aggiunto piatti al menu.
                </p>
            </div>
        `;
        return;
    }

    piatti.forEach(function (piatto) { // Scorre tutti i piatti ricevuti dal backend
        const colonna = document.createElement("div"); // Crea dinamicamente un nuovo div
        colonna.className = "col-sm-6 col-md-4 col-lg-3"; // Applica classi Grid di Bootstrap

        const ingredienti =
            piatto.ingredienti &&
            piatto.ingredienti.length > 0
                ? piatto.ingredienti.join(", ") // Converte l'array in testo separato da virgole
                : "Nessun ingrediente indicato";

        const allergeni =
            piatto.allergeni &&
            piatto.allergeni.length > 0
                ? piatto.allergeni.join(", ")
                : "Nessun allergene indicato";

        const immagine =
            piatto.immagine && piatto.immagine !== ""
                ? piatto.immagine
                : "../immagini/piatto-default.jpg"; // Usa immagine di default se assente

        colonna.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${immagine}" class="card-img-top immagine-card"
                    alt="Immagine piatto">
                <div class="card-body d-flex flex-column">
                    <h4 class="h5">${piatto.nome}</h4>
                    <p class="mb-1">
                        <strong>Categoria:</strong>
                        ${piatto.categoria}
                    </p>
                    <p class="mb-1">
                        <strong>Prezzo:</strong>
                        € ${Number(piatto.prezzo).toFixed(2)}
                    </p>
                    <p class="mb-1">
                        <strong>Ingredienti:</strong>
                        ${ingredienti}
                    </p>
                    <p class="mb-1">
                        <strong>Allergeni:</strong>
                        ${allergeni}
                    </p>
                    <p class="mb-3">
                        <strong>Disponibile:</strong>
                        ${piatto.disponibile ? "Sì" : "No"}
                    </p>
                    <div class="mt-auto d-flex gap-2">
                        <button type="button"
                            class="btn btn-sm btn-outline-danger bottone-modifica-piatto">
                            Modifica
                        </button>
                        <button type="button" class="btn btn-sm btn-danger"
                            onclick="eliminaPiatto('${piatto._id}')">
                            Elimina
                        </button>
                    </div>
                </div>
            </div>
        `;

        const bottoneModifica = colonna.querySelector(".bottone-modifica-piatto"); // Cerca il bottone nella card appena creata

        bottoneModifica.addEventListener("click", function () { // Associa il click al piatto specifico
            apriModificaPiatto(piatto);
        });

        listaMenuRistoratore.appendChild(colonna); // Aggiunge la card al DOM
    });
}

/*
 * ============================================================
 * MODIFICA PIATTO
 * ============================================================
 */
function apriModificaPiatto(piatto) {
    nascondiPannelli();

    document.getElementById("idPiattoModifica").value = piatto._id; // Memorizza l'ID del piatto da modificare
    document.getElementById("modificaNomePiatto").value = piatto.nome || ""; // Precompila il form
    document.getElementById("modificaCategoriaPiatto").value = piatto.categoria || "";
    document.getElementById("modificaPrezzoPiatto").value = piatto.prezzo || 0;
    document.getElementById("modificaImmaginePiatto").value = piatto.immagine || "";

    document.getElementById("modificaIngredientiPiatto").value =
        piatto.ingredienti && piatto.ingredienti.length > 0
            ? piatto.ingredienti.join(", ") // Array → testo da mostrare nell'input
            : "";

    document.getElementById("modificaAllergeniPiatto").value =
        piatto.allergeni && piatto.allergeni.length > 0
            ? piatto.allergeni.join(", ")
            : "";

    document.getElementById("modificaDisponibilePiatto").checked = piatto.disponibile === true; // Imposta lo stato della checkbox

    formModificaPiatto.classList.remove("d-none"); // Mostra il form già presente nell'HTML
    formModificaPiatto.scrollIntoView({ behavior: "smooth", block: "start" }); // Scorre la pagina fino al form
}

formModificaPiatto.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        pulisciMessaggio("messaggioRistoratore");

        const idPiatto = valoreCampo("idPiattoModifica"); // Recupera l'ID del piatto da modificare

        const datiPiatto = { // Legge i nuovi valori dal form
            nome: valoreCampo("modificaNomePiatto"),
            categoria: valoreCampo("modificaCategoriaPiatto"),
            prezzo: Number(valoreCampo("modificaPrezzoPiatto")),
            ingredienti:
                creaLista(
                    valoreCampo("modificaIngredientiPiatto")
                ),
            allergeni:
                creaLista(
                    valoreCampo("modificaAllergeniPiatto")
                ),
            immagine: valoreCampo("modificaImmaginePiatto"),
            disponibile:
                document.getElementById(
                    "modificaDisponibilePiatto"
                ).checked // Legge true/false dalla checkbox
        };

        try {
            const risposta = await richiestaAPI(
                `/piatti/${idPiatto}`, // Endpoint del piatto specifico
                "PUT", // Invia la modifica al backend
                datiPiatto,
                true
            );

            mostraMessaggio("messaggioRistoratore", risposta.messaggio || "Piatto modificato correttamente.", "success");

            formModificaPiatto.reset();
            formModificaPiatto.classList.add("d-none");
            await caricaMenuMioRistorante(); // Ricarica il menu con i nuovi dati
        } catch (errore) {
            gestisciErrore(errore);
        }
    }
);

bottoneAnnullaModificaPiatto.addEventListener(
    "click",
    function () {
        formModificaPiatto.reset(); // Ripristina il form
        formModificaPiatto.classList.add("d-none"); // Nasconde il form
    }
);

async function eliminaPiatto(idPiatto) {
    const conferma = confirm( // Chiede conferma prima dell'eliminazione
        "Sei sicuro di voler eliminare questo piatto dal menu?"
    );

    if (!conferma) {
        return;
    }

    try {
        const risposta = await richiestaAPI(
            `/piatti/${idPiatto}`,
            "DELETE", // Elimina il piatto tramite API
            null,
            true
        );

        mostraMessaggio("messaggioRistoratore", risposta.messaggio || "Piatto eliminato correttamente.", "success");

        formModificaPiatto.classList.add("d-none");
        await caricaMenuMioRistorante(); // Aggiorna il menu dopo l'eliminazione
    } catch (errore) {
        gestisciErrore(errore);
    }
}

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
inizializzaAreaRistoratore(); // Avvia i controlli e il caricamento della pagina