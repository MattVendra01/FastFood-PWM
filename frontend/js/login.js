/*
 * ============================================================
 * LOGIN UTENTE
 * ============================================================
 */
const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async function (evento) {
        evento.preventDefault();
        pulisciMessaggio("messaggioLogin");

        const email = document.getElementById("emailLogin").value.trim();
        const password = document.getElementById("passwordLogin").value;

        try {
            const risposta = await richiestaAPI("/utenti/login", "POST",
                { email, password }, false);

            salvaToken(risposta.token); // salva il JWT nel localStorage
            salvaUtente(risposta.utente); // salva l'oggetto utente nel localStorage

            if (risposta.utente.tipoUtente === "ristoratore") {
                window.location.href = "area-ristoratore.html";
            } else {
                window.location.href = "area-cliente.html";
            }
        } catch (errore) {
            mostraMessaggio("messaggioLogin", errore.message, "danger");

            console.error(errore);
        }
    });
}

/*
 * ============================================================
 * VISUALIZZAZIONE DELLA PASSWORD
 * ============================================================
 */
const bottoneMostraPasswordLogin = document.getElementById("mostraPasswordLogin");
const inputPasswordLogin = document.getElementById("passwordLogin");

if (bottoneMostraPasswordLogin && inputPasswordLogin) {
    bottoneMostraPasswordLogin.addEventListener("click", function () {
        const passwordVisibile = inputPasswordLogin.type === "text";
        inputPasswordLogin.type = passwordVisibile ? "password" : "text";

        bottoneMostraPasswordLogin.setAttribute("aria-label", 
            passwordVisibile ? "Mostra password" : "Nascondi password");

        bottoneMostraPasswordLogin.setAttribute("aria-pressed", String(!passwordVisibile));
    });
}