/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const cardDatiProfilo = document.getElementById("cardDatiProfilo"); // Recupera dal DOM la card di visualizzazione
const cardModificaProfilo = document.getElementById("cardModificaProfilo"); // Recupera la card con il form di modifica
const testoNomeCompleto = document.getElementById("testoNomeCompleto");
const testoEmail = document.getElementById("testoEmail");
const testoTelefono = document.getElementById("testoTelefono");
const testoTipoUtente = document.getElementById("testoTipoUtente");
const datiCliente = document.getElementById("datiCliente");
const testoMetodoPagamento = document.getElementById("testoMetodoPagamento");
const testoPreferenze = document.getElementById("testoPreferenze");
const formProfilo = document.getElementById("formProfilo");
const inputNome = document.getElementById("nome");
const inputCognome = document.getElementById("cognome");
const inputEmail = document.getElementById("email");
const inputTelefono = document.getElementById("telefono");
const inputPasswordAttuale = document.getElementById("passwordAttuale");
const inputNuovaPassword = document.getElementById("nuovaPassword");
const sezioneCliente = document.getElementById("sezioneCliente");
const inputNumeroCarta = document.getElementById("numeroCarta");
const inputScadenza = document.getElementById("scadenza");
const inputCvv = document.getElementById("cvv");
const inputCategoriePreferite = document.getElementById("categoriePreferite");
const bottoneMostraModifica = document.getElementById("bottoneMostraModifica");
const bottoneAnnullaModifica = document.getElementById("bottoneAnnullaModifica");
const bottoneLogout = document.getElementById("bottoneLogout");
const bottoneEliminaProfilo = document.getElementById("bottoneEliminaProfilo");
let utenteCorrente = null; // Conterrà i dati aggiornati dell'utente autenticato

/*
 * ============================================================
 * VALIDAZIONE DEL FORM
 * ============================================================
 */
function impostaCampoValido(input) {
    input.classList.remove("is-invalid"); // Rimuove la classe Bootstrap di errore
}

function impostaCampoNonValido(input) {
    input.classList.add("is-invalid"); // Applica la classe Bootstrap di campo non valido
}

function validaTelefono() {
    const telefono = inputTelefono.value.trim(); // Legge e pulisce il valore inserito

    if (telefono === "") {
        impostaCampoValido(inputTelefono);
        return true;
    }

    const valido = /^\d{8,15}$/.test(telefono); // Regex: solo cifre, da 8 a 15

    valido
        ? impostaCampoValido(inputTelefono)
        : impostaCampoNonValido(inputTelefono);

    return valido;
}

function validaCarta() {
    if (!utenteCorrente || utenteCorrente.tipoUtente 
        !== "cliente") { // La carta viene validata solo per i clienti

        return true;
    }

    const numeroCarta = inputNumeroCarta.value.trim();
    const scadenza = inputScadenza.value.trim();
    const cvv = inputCvv.value.trim();
    const pagamentoIniziato = numeroCarta !== "" || scadenza !== "" || cvv !== ""; // Controlla se l'utente ha iniziato a compilare i dati

    if (!pagamentoIniziato) {
        impostaCampoValido(inputNumeroCarta);
        impostaCampoValido(inputScadenza);
        impostaCampoValido(inputCvv);
        return true;
    }

    const numeroValido = /^\d{16}$/.test(numeroCarta); // Carta: esattamente 16 cifre
    const formatoScadenzaValido = /^(0[1-9]|1[0-2])\/\d{2}$/.test(scadenza); // Formato MM/AA
    const cvvValido = /^\d{3}$/.test(cvv); // CVV: esattamente 3 cifre

    let scadenzaValida = false;

    if (formatoScadenzaValido) {
        const [mese, annoBreve] = scadenza.split("/"); // Divide MM e AA

        const anno = 2000 + Number(annoBreve);
        const meseNumero = Number(mese);
        const oggi = new Date(); // Recupera data e ora attuali
        const annoAttuale = oggi.getFullYear();
        const meseAttuale = oggi.getMonth() + 1;

        scadenzaValida = anno > annoAttuale || (anno === annoAttuale && meseNumero >= meseAttuale); // Controlla che la carta non sia scaduta
    }

    numeroValido
        ? impostaCampoValido(inputNumeroCarta)
        : impostaCampoNonValido(inputNumeroCarta);

    scadenzaValida
        ? impostaCampoValido(inputScadenza)
        : impostaCampoNonValido(inputScadenza);

    cvvValido
        ? impostaCampoValido(inputCvv)
        : impostaCampoNonValido(inputCvv);

    return numeroValido && scadenzaValida && cvvValido; // Tutti i controlli devono essere veri
}

function validaPassword() {
    const passwordAttuale = inputPasswordAttuale.value;
    const nuovaPassword = inputNuovaPassword.value;

    const passwordIniziata = passwordAttuale !== "" || nuovaPassword !== ""; // Controlla se è stato iniziato un cambio password

    if (!passwordIniziata) {
        impostaCampoValido(inputPasswordAttuale);
        impostaCampoValido(inputNuovaPassword);
        return true;
    }

    const passwordAttualeValida = passwordAttuale.length > 0;
    const nuovaPasswordValida = nuovaPassword.length >= 6; // Nuova password di almeno 6 caratteri

    passwordAttualeValida
        ? impostaCampoValido(inputPasswordAttuale)
        : impostaCampoNonValido(inputPasswordAttuale);

    nuovaPasswordValida
        ? impostaCampoValido(inputNuovaPassword)
        : impostaCampoNonValido(inputNuovaPassword);

    return passwordAttualeValida && nuovaPasswordValida;
}

function validaFormProfilo() {
    if (!validaTelefono()) {
        mostraMessaggio(
            "messaggioProfilo",
            "Il telefono deve contenere solo numeri, da 8 a 15 cifre.",
            "danger"
        );
        return false;
    }

    if (!validaCarta()) {
        mostraMessaggio(
            "messaggioProfilo",
            "Per salvare la carta devi inserire un numero di 16 cifre, una scadenza valida MM/AA non scaduta e un CVV di 3 cifre.",
            "danger"
        );
        return false;
    }

    if (!validaPassword()) {
        mostraMessaggio(
            "messaggioProfilo",
            "Per cambiare password devi inserire la password attuale e una nuova password di almeno 6 caratteri.",
            "danger"
        );
        return false;
    }
    return true; // Il form è valido solo se tutti i controlli sono superati
}

/*
 * ============================================================
 * CARICAMENTO DEL PROFILO
 * ============================================================
 */
async function caricaProfilo() {
    if (!utenteAutenticato()) { // Protegge la pagina da utenti non autenticati
        window.location.href = "login.html";
        return;
    }

    try {
        const risposta = await richiestaAPI(
            "/utenti/profilo",
            "GET",
            null,
            true // Richiesta autenticata tramite JWT
        );

        utenteCorrente = risposta.utente; // Salva i dati aggiornati ricevuti dal backend

        salvaUtente(utenteCorrente); // Aggiorna anche i dati salvati nel browser
        mostraDatiProfilo(utenteCorrente);
        riempiFormModifica(utenteCorrente); // Precompila il form con i dati correnti
    } catch (errore) {
        mostraMessaggio(
            "messaggioProfilo",
            errore.message,
            "danger"
        );

        console.error(errore);
    }
}

/*
 * ============================================================
 * VISUALIZZAZIONE DEI DATI
 * ============================================================
 */
function mostraDatiProfilo(utente) {
    testoNomeCompleto.textContent =
        `${utente.nome || ""} ${utente.cognome || ""}`.trim() ||
        "Non disponibile"; // Costruisce nome e cognome con valore di fallback

    testoEmail.textContent = utente.email || "Non disponibile";
    testoTelefono.textContent = utente.telefono || "Non disponibile";
    testoTipoUtente.textContent = utente.tipoUtente || "Non disponibile";

    if (utente.tipoUtente !== "cliente") {
        datiCliente.classList.add("d-none"); // Nasconde pagamento e preferenze ai non clienti
        return;
    }

    datiCliente.classList.remove("d-none");

    const metodoPagamento = utente.metodoPagamento || {};
    const preferenze = utente.preferenze || {};

    if (metodoPagamento.numeroCarta && metodoPagamento.scadenza) {
        const ultimeQuattro = metodoPagamento.numeroCarta.slice(-4); // Recupera solo le ultime 4 cifre

        testoMetodoPagamento.textContent = `Carta terminante in ${ultimeQuattro} - scadenza ${metodoPagamento.scadenza}`;
    } else {
        testoMetodoPagamento.textContent = "Nessun metodo di pagamento inserito";
    }

    if (preferenze.categoriePreferite && preferenze.categoriePreferite.length > 0) {
        testoPreferenze.textContent = preferenze.categoriePreferite.join(", "); // Converte l'array in testo
    } else {
        testoPreferenze.textContent = "Nessuna preferenza inserita";
    }
}

/*
 * ============================================================
 * COMPILAZIONE DEL FORM
 * ============================================================
 */
function riempiFormModifica(utente) {
    inputNome.value = utente.nome || ""; // Precompila il form con i dati esistenti
    inputCognome.value = utente.cognome || "";
    inputEmail.value = utente.email || "";
    inputTelefono.value = utente.telefono || "";
    inputPasswordAttuale.value = ""; // Le password non vengono precompilate
    inputNuovaPassword.value = "";

    if (utente.tipoUtente === "cliente") {
        sezioneCliente.classList.remove("d-none"); // Mostra i campi specifici del cliente

        const metodoPagamento = utente.metodoPagamento || {};
        const preferenze = utente.preferenze || {};
        inputNumeroCarta.value = metodoPagamento.numeroCarta || "";
        inputScadenza.value = metodoPagamento.scadenza || "";
        inputCvv.value = metodoPagamento.cvv || "";

        inputCategoriePreferite.value = preferenze.categoriePreferite
                ? preferenze.categoriePreferite.join(", ")
                : "";
    } else {
        sezioneCliente.classList.add("d-none");
    }

    validaTelefono(); // Aggiorna subito lo stato grafico dei campi
    validaCarta();
    validaPassword();
}

/*
 * ============================================================
 * MODALITÀ DELLA PAGINA
 * ============================================================
 */
function mostraModalitaLettura() {
    cardModificaProfilo.classList.add("d-none"); // Nasconde il form
    cardDatiProfilo.classList.remove("d-none"); // Mostra i dati del profilo
}

function mostraModalitaModifica() {
    cardDatiProfilo.classList.add("d-none"); // Nasconde la visualizzazione
    cardModificaProfilo.classList.remove("d-none"); // Mostra il form di modifica
}

/*
 * ============================================================
 * EVENTI DEI CAMPI
 * ============================================================
 */
inputTelefono.addEventListener("input", validaTelefono); // Validazione live mentre l'utente scrive
inputPasswordAttuale.addEventListener("input", validaPassword);
inputNuovaPassword.addEventListener("input", validaPassword);
inputNumeroCarta.addEventListener("input", validaCarta);
inputScadenza.addEventListener("input", validaCarta);
inputCvv.addEventListener("input", validaCarta);

/*
 * ============================================================
 * EVENTI DEI PULSANTI
 * ============================================================
 */
bottoneMostraModifica.addEventListener("click", function () { // Apre la modalità di modifica
    pulisciMessaggio("messaggioProfilo");
    riempiFormModifica(utenteCorrente); // Ricarica i dati attuali nel form
    mostraModalitaModifica();
});

bottoneAnnullaModifica.addEventListener("click", function () {
    pulisciMessaggio("messaggioProfilo");
    riempiFormModifica(utenteCorrente); // Ripristina eventuali modifiche non salvate
    mostraModalitaLettura(); // Torna alla visualizzazione
});

bottoneLogout.addEventListener("click", function () {
    const conferma = confirm(
        "Sei sicuro di voler effettuare il logout?"
    ); // Chiede conferma tramite finestra del browser

    if (conferma) {
        logout(); // Richiama la funzione globale di logout
    }
});

bottoneEliminaProfilo.addEventListener("click", async function () {
    const conferma = confirm(
        "Sei sicuro di voler eliminare definitivamente il tuo profilo?"
    );

    if (!conferma) {
        return;
    }

    try {
        await richiestaAPI(
            "/utenti/profilo",
            "DELETE", // Richiede al backend l'eliminazione dell'utente
            null,
            true
        );

        localStorage.removeItem("token"); // Elimina i dati locali dopo la cancellazione
        localStorage.removeItem("utente");
        localStorage.removeItem("carrello");

        window.location.href = "../index.html"; // Torna alla home
    } catch (errore) {
        mostraMessaggio(
            "messaggioProfilo",
            errore.message,
            "danger"
        );

        console.error(errore);
    }
});

/*
 * ============================================================
 * SALVATAGGIO DELLE MODIFICHE
 * ============================================================
 */
formProfilo.addEventListener("submit", async function (evento) {
    evento.preventDefault(); // Evita l'invio tradizionale e il refresh della pagina

    pulisciMessaggio("messaggioProfilo");

    if (!validaFormProfilo()) { // Blocca la richiesta se i dati non sono validi
        return;
    }

    const datiAggiornati = { // Costruisce l'oggetto da inviare al backend
        nome: inputNome.value.trim(),
        cognome: inputCognome.value.trim(),
        telefono: inputTelefono.value.trim(),
        passwordAttuale: inputPasswordAttuale.value,
        nuovaPassword: inputNuovaPassword.value
    };

    if (utenteCorrente.tipoUtente === "cliente") {
        const categoriePreferite = inputCategoriePreferite.value
            .split(",") // Divide il testo in un array usando la virgola
            .map(function (categoria) {
                return categoria.trim(); // Rimuove gli spazi da ogni elemento
            })
            .filter(function (categoria) {
                return categoria !== ""; // Elimina gli elementi vuoti
            });

        datiAggiornati.metodoPagamento = {
            numeroCarta: inputNumeroCarta.value.trim(),
            scadenza: inputScadenza.value.trim(),
            cvv: inputCvv.value.trim()
        };

        datiAggiornati.preferenze = {
            categoriePreferite
        };
    }

    try {
        const risposta = await richiestaAPI(
            "/utenti/profilo",
            "PUT", // Aggiorna il profilo nel backend
            datiAggiornati,
            true
        );

        utenteCorrente = risposta.utente; // Sostituisce i dati locali con quelli aggiornati dal backend

        salvaUtente(utenteCorrente); // Aggiorna l'utente salvato nel browser
        mostraDatiProfilo(utenteCorrente);
        riempiFormModifica(utenteCorrente);
        mostraModalitaLettura(); // Dopo il salvataggio torna alla modalità lettura
        mostraMessaggio(
            "messaggioProfilo",
            "Profilo aggiornato correttamente.",
            "success"
        );
    } catch (errore) {
        mostraMessaggio("messaggioProfilo", errore.message, "danger");

        console.error(errore);
    }
});

/*
 * ============================================================
 * AVVIO DELLA PAGINA
 * ============================================================
 */
caricaProfilo(); // Carica il profilo all'apertura della pagina