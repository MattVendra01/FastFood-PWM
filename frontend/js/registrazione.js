/*
 * ============================================================
 * ELEMENTI DELLA PAGINA
 * ============================================================
 */
const formRegistrazione = document.getElementById("formRegistrazione"); // Recupera dal DOM il form di registrazione
const inputNome = document.getElementById("nome");
const inputCognome = document.getElementById("cognome");
const inputEmail = document.getElementById("email");
const inputPasswordRegistrazione = document.getElementById("password");
const inputTipoUtente = document.getElementById("tipoUtente");
const inputTelefono = document.getElementById("telefono");

/*
 * ============================================================
 * VALIDAZIONE DEL FORM
 * ============================================================
 */
function impostaCampoValido(input) {
    input.classList.remove("is-invalid"); // Rimuove la classe Bootstrap di errore
}

function impostaCampoNonValido(input) {
    input.classList.add("is-invalid"); // Evidenzia il campo come non valido
}

function validaNome() {
    const valido = inputNome.value.trim().length >= 2; // Nome valido se ha almeno 2 caratteri

    valido
        ? impostaCampoValido(inputNome)
        : impostaCampoNonValido(inputNome);
    return valido;
}

function validaCognome() {
    const valido = inputCognome.value.trim().length >= 2; // Cognome valido se ha almeno 2 caratteri

    valido
        ? impostaCampoValido(inputCognome)
        : impostaCampoNonValido(inputCognome);
    return valido;
}

function validaEmail() {
    const email = inputEmail.value.trim();
    const valido = email !== "" && inputEmail.checkValidity(); // Usa la validazione HTML5 del campo email

    valido
        ? impostaCampoValido(inputEmail)
        : impostaCampoNonValido(inputEmail);
    return valido;
}

function validaPassword() {
    const valido = inputPasswordRegistrazione.value.length >= 6; // Password di almeno 6 caratteri
    const errorePassword = document.getElementById("errorePassword");

    valido
        ? impostaCampoValido(inputPasswordRegistrazione)
        : impostaCampoNonValido(inputPasswordRegistrazione);
    errorePassword.style.display = valido ? "none" : "block"; // Mostra o nasconde il messaggio di errore
    return valido;
}

function validaTipoUtente() {
    const valido = inputTipoUtente.value === "cliente" || inputTipoUtente.value === "ristoratore"; // Accetta solo i due ruoli previsti

    valido
        ? impostaCampoValido(inputTipoUtente)
        : impostaCampoNonValido(inputTipoUtente);
    return valido;
}

function validaTelefono() {
    const telefono = inputTelefono.value.trim();

    if (telefono === "") {
        impostaCampoValido(inputTelefono);
        return true; // Il telefono è opzionale
    }

    const valido = /^\d{8,15}$/.test(telefono); // Regex: solo cifre, da 8 a 15

    valido
        ? impostaCampoValido(inputTelefono)
        : impostaCampoNonValido(inputTelefono);
    return valido;
}

function validaFormRegistrazione() {
    const nomeValido = validaNome();
    const cognomeValido = validaCognome();
    const emailValida = validaEmail();
    const passwordValida = validaPassword();
    const tipoUtenteValido = validaTipoUtente();
    const telefonoValido = validaTelefono();

    return nomeValido && cognomeValido && emailValida && 
        passwordValida && tipoUtenteValido && telefonoValido; // Il form è valido solo se tutti i controlli sono veri
}

/*
 * ============================================================
 * EVENTI DEI CAMPI
 * ============================================================
 */
inputNome.addEventListener("input", validaNome); // Validazione live mentre l'utente scrive
inputCognome.addEventListener("input", validaCognome);
inputEmail.addEventListener("input", validaEmail);
inputPasswordRegistrazione.addEventListener("input", validaPassword);
inputTipoUtente.addEventListener("change", validaTipoUtente); // Controllo al cambio del ruolo
inputTelefono.addEventListener("input", validaTelefono);

/*
 * ============================================================
 * REGISTRAZIONE UTENTE
 * ============================================================
 */
if (formRegistrazione) {
    formRegistrazione.addEventListener("submit", async function (evento) {
        evento.preventDefault(); // Evita il submit tradizionale e il refresh della pagina

        pulisciMessaggio("messaggioRegistrazione");

        if (!validaFormRegistrazione()) { // Blocca la richiesta se i dati non sono validi
            mostraMessaggio(
                "messaggioRegistrazione",
                "Controlla i dati inseriti prima di continuare.",
                "danger"
            );
            return;
        }

        const nome = inputNome.value.trim();
        const cognome = inputCognome.value.trim();
        const email = inputEmail.value.trim();
        const password = inputPasswordRegistrazione.value;
        const tipoUtente = inputTipoUtente.value;
        const telefono = inputTelefono.value.trim(); // Recupera i dati inseriti nel form

        try {
            const risposta = await richiestaAPI(
                "/utenti/registrazione",
                "POST", // Invia al backend una richiesta di creazione utente
                {
                    nome,
                    cognome,
                    email,
                    password,
                    tipoUtente,
                    telefono
                },
                false // La registrazione non richiede autenticazione
            );

            salvaToken(risposta.token); // Salva il JWT ricevuto dal backend
            salvaUtente(risposta.utente); // Salva i dati dell'utente nel browser

            if (risposta.utente.tipoUtente === "ristoratore") {
                window.location.href = "area-ristoratore.html"; // Redirect in base al ruolo
            } else {
                window.location.href = "area-cliente.html";
            }
        } catch (errore) {
            mostraMessaggio(
                "messaggioRegistrazione",
                errore.message,
                "danger"
            );

            console.error(errore);
        }
    });
}

/*
 * ============================================================
 * VISUALIZZAZIONE DELLA PASSWORD
 * ============================================================
 */
const bottoneMostraPasswordRegistrazione =
    document.getElementById("mostraPasswordRegistrazione");

if (bottoneMostraPasswordRegistrazione && inputPasswordRegistrazione) {
    bottoneMostraPasswordRegistrazione.addEventListener(
        "click",
        function () {
            const passwordVisibile = inputPasswordRegistrazione.type === "text"; // Controlla se la password è già visibile
            inputPasswordRegistrazione.type = passwordVisibile ? "password" : "text"; // Alterna tra password nascosta e visibile

            bottoneMostraPasswordRegistrazione.setAttribute(
                "aria-label",
                passwordVisibile
                    ? "Mostra password"
                    : "Nascondi password"
            ); // Aggiorna l'etichetta per l'accessibilità

            bottoneMostraPasswordRegistrazione.setAttribute(
                "aria-pressed",
                String(!passwordVisibile)
            ); // Aggiorna lo stato accessibile del bottone
        }
    );
}