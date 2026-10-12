/*
 * ============================================================
 * IMPORTAZIONE EXPRESS, MIDDLEWARE E CREAZIONE DEL ROUTER
 * ============================================================
 */
const express = require("express");
const router = express.Router();
const verificaToken = require("../middleware/autenticazione");
const verificaCliente = require("../middleware/verificaCliente");
const verificaRistoratore = require("../middleware/verificaRistoratore");

/*
 * ============================================================
 * IMPORTAZIONE DELLE FUNZIONI DEL CONTROLLER
 * ============================================================
 */
const {
    creaOrdine,
    elencoOrdiniRistorante,
    aggiornaStatoOrdine,
    statisticheRistorante,
    acquistiCliente
} = require("../controllori/ordini");

/*
 * ============================================================
 * ROTTA DI CREAZIONE DI UN ORDINE
 * ============================================================
 */
router.post(
    "/",

    /*
        #swagger.tags = ["Ordini"]
        #swagger.summary = "Crea un nuovo ordine"
        #swagger.description = "Crea un nuovo ordine per il cliente autenticato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaCliente,
    creaOrdine
);

/*
 * ============================================================
 * ROTTA DI VISUALIZZAZIONE DEGLI ACQUISTI
 * ============================================================
 */
router.get(
    "/acquisti",

    /*
        #swagger.tags = ["Ordini"]
        #swagger.summary = "Visualizza gli acquisti presenti e passati"
        #swagger.description = "Restituisce gli acquisti presenti e passati del cliente autenticato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaCliente,
    acquistiCliente
);

/*
 * ============================================================
 * ROTTA DI VISUALIZZAZIONE DELLE STATISTICHE
 * ============================================================
 */
router.get(
    "/ristorante/:id/statistiche",

    /*
        #swagger.tags = ["Ordini"]
        #swagger.summary = "Visualizza le statistiche del ristorante"
        #swagger.description = "Restituisce le statistiche relative al ristorante specificato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    statisticheRistorante
);

/*
 * ============================================================
 * ROTTA DI VISUALIZZAZIONE DEGLI ORDINI DI UN RISTORANTE
 * ============================================================
 */
router.get(
    "/ristorante/:id",

    /*
        #swagger.tags = ["Ordini"]
        #swagger.summary = "Visualizza gli ordini del ristorante"
        #swagger.description = "Restituisce gli ordini ricevuti dal ristorante specificato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    elencoOrdiniRistorante
);

/*
 * ============================================================
 * ROTTA DI AGGIORNAMENTO DELLO STATO DI UN ORDINE
 * ============================================================
 */
router.put(
    "/:id/stato",

    /*
        #swagger.tags = ["Ordini"]
        #swagger.summary = "Aggiorna lo stato di un ordine"
        #swagger.description = "Aggiorna lo stato dell'ordine specificato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    aggiornaStatoOrdine
);

/*
 * ============================================================
 * ESPORTAZIONE DEL ROUTER
 * ============================================================
 */
module.exports = router;