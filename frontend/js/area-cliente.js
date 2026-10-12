/*
 * ============================================================
 * CONTROLLO ACCESSO CLIENTE
 * ============================================================
 */
const utente = leggiUtente();
const testoBenvenuto = document.getElementById("benvenutoCliente");

if (!utenteAutenticato() || !utente) {
    window.location.href = "login.html";
} else if (utente.tipoUtente !== "cliente") {
    window.location.href = "area-ristoratore.html";
} else {
    testoBenvenuto.textContent =
        `Benvenuto, ${utente.nome || "cliente"}.`;
}