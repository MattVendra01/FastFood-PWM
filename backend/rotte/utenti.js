/*
 * ============================================================
 * IMPORTAZIONE EXPRESS, MIDDLEWARE E CREAZIONE DEL ROUTER
 * ============================================================
 */
const express = require("express");
const router = express.Router();
const verificaToken = require("../middleware/autenticazione");

/*
 * ============================================================
 * IMPORTAZIONE DELLE FUNZIONI DEL CONTROLLER
 * ============================================================
 */
const {
    registrazioneUtente,
    loginUtente,
    profiloUtente,
    modificaProfiloUtente,
    eliminaProfiloUtente
} = require("../controllori/utenti");

/*
 * ============================================================
 * ROTTA DI REGISTRAZIONE
 * ============================================================
 */
router.post(
    "/registrazione",

    /*
        #swagger.tags = ["Utenti"]
        #swagger.summary = "Registra un nuovo utente"
        #swagger.description = "Crea un nuovo account di tipo cliente o ristoratore."
    */

    registrazioneUtente
);

/*
 * ============================================================
 * ROTTA DI CONTROLLO
 * ============================================================
 */
router.get(
    "/test",

    /*
        #swagger.ignore = true
    */

    (req, res) => {
        res.json({
            messaggio: "Rotta utenti funzionante"
        });
    }
);

/*
 * ============================================================
 * ROTTA DI LOGIN
 * ============================================================
 */
router.post(
    "/login",

    /*
        #swagger.tags = ["Utenti"]
        #swagger.summary = "Effettua il login"
        #swagger.description = "Verifica email e password e restituisce un token JWT."
    */

    loginUtente
);

/*
 * ============================================================
 * ROTTA DI VISUALIZZAZIONE DEL PROFILO
 * ============================================================
 */
router.get(
    "/profilo",

    /*
        #swagger.tags = ["Utenti"]
        #swagger.summary = "Recupera il profilo dell'utente"
        #swagger.description = "Restituisce i dati dell'utente autenticato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    profiloUtente
);

/*
 * ============================================================
 * ROTTA DI MODIFICA DEL PROFILO
 * ============================================================
 */
router.put(
    "/profilo",

    /*
        #swagger.tags = ["Utenti"]
        #swagger.summary = "Modifica il profilo dell'utente"
        #swagger.description = "Modifica i dati personali, le preferenze, il metodo di pagamento ed eventualmente la password."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    modificaProfiloUtente
);

/*
 * ============================================================
 * ROTTA DI ELIMINAZIONE DEL PROFILO
 * ============================================================
 */
router.delete(
    "/profilo",

    /*
        #swagger.tags = ["Utenti"]
        #swagger.summary = "Elimina il profilo dell'utente"
        #swagger.description = "Elimina l'account dell'utente autenticato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    eliminaProfiloUtente
);

/*
 * ============================================================
 * ESPORTAZIONE DEL ROUTER
 * ============================================================
 */
module.exports = router;