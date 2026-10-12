/*
 * ============================================================
 * IMPORTAZIONE DI EXPRESS E CREAZIONE DEL ROUTER
 * ============================================================
 */
const express = require("express");
const router = express.Router();

/*
 * ============================================================
 * IMPORTAZIONE DELLE FUNZIONI DEL CONTROLLER
 * ============================================================
 */
const { elencoCatalogo, dettaglioCatalogo } = require("../controllori/catalogo");

/*
 * ============================================================
 * ROTTA DI VISUALIZZAZIONE DEL CATALOGO
 * ============================================================
 */
router.get(
    "/",

    /*
        #swagger.tags = ["Catalogo"]
        #swagger.summary = "Visualizza il catalogo dei piatti"
        #swagger.description = "Restituisce l'elenco dei piatti presenti nel catalogo. È possibile filtrare i risultati."
    */

    elencoCatalogo
);

/*
 * ============================================================
 * ROTTA DI VISUALIZZAZIONE DEL DETTAGLIO DI UN PIATTO
 * ============================================================
 */
router.get(
    "/:id",

    /*
        #swagger.tags = ["Catalogo"]
        #swagger.summary = "Visualizza un piatto del catalogo"
        #swagger.description = "Restituisce il dettaglio di un piatto del catalogo."
    */

    dettaglioCatalogo
);

/*
 * ============================================================
 * ESPORTAZIONE DEL ROUTER
 * ============================================================
 */
module.exports = router;