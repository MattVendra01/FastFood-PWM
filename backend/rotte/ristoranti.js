/*
 * ============================================================
 * IMPORTAZIONE EXPRESS, MIDDLEWARE E CREAZIONE DEL ROUTER
 * ============================================================
 */
const express = require("express");
const router = express.Router();
const verificaToken = require("../middleware/autenticazione");
const verificaRistoratore = require("../middleware/verificaRistoratore");

/*
 * ============================================================
 * IMPORTAZIONE DELLE FUNZIONI DEL CONTROLLORE
 * ============================================================
 */
const {
    creaRistorante,
    ricercaRistoranti,
    recuperaMioRistorante,
    modificaMioRistorante,
    eliminaMioRistorante
} = require("../controllori/ristoranti");

/*
 * ============================================================
 * CREAZIONE DEL RISTORANTE
 * ============================================================
 */
router.post(
    "/",

    /*
        #swagger.tags = ["Ristoranti"]
        #swagger.summary = "Crea un ristorante"
        #swagger.description = "Permette a un ristoratore autenticato di creare il proprio ristorante."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    creaRistorante
);

/*
 * ============================================================
 * VISUALIZZAZIONE DEL PROPRIO RISTORANTE
 * ============================================================
 */
router.get(
    "/miei",

    /*
        #swagger.tags = ["Ristoranti"]
        #swagger.summary = "Recupera il ristorante del ristoratore"
        #swagger.description = "Restituisce il ristorante associato all'utente autenticato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    recuperaMioRistorante
);

/*
 * ============================================================
 * MODIFICA DEL PROPRIO RISTORANTE
 * ============================================================
 */
router.put(
    "/mio",

    /*
        #swagger.tags = ["Ristoranti"]
        #swagger.summary = "Modifica il proprio ristorante"
        #swagger.description = "Aggiorna i dati del ristorante associato all'utente autenticato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    modificaMioRistorante
);

/*
 * ============================================================
 * ELIMINAZIONE DEL PROPRIO RISTORANTE
 * ============================================================
 */
router.delete(
    "/mio",

    /*
        #swagger.tags = ["Ristoranti"]
        #swagger.summary = "Elimina il proprio ristorante"
        #swagger.description = "Elimina il ristorante associato all'utente autenticato e i relativi piatti."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    eliminaMioRistorante
);

/*
 * ============================================================
 * RICERCA DEI RISTORANTI
 * ============================================================
 */
router.get(
    "/",

    /*
        #swagger.tags = ["Ristoranti"]
        #swagger.summary = "Ricerca i ristoranti"
        #swagger.description = "Restituisce l'elenco dei ristoranti filtrando per nome e città."
    */

    ricercaRistoranti
);

/*
 * ============================================================
 * ESPORTAZIONE DEL ROUTER
 * ============================================================
 */
module.exports = router;