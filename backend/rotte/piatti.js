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
    creaPiatto,
    aggiungiPiattoDaCatalogo,
    elencoPiattiRistorante,
    ricercaPiatti,
    modificaPiatto,
    eliminaPiatto
} = require("../controllori/piatti");

/*
 * ============================================================
 * CREAZIONE DI UN PIATTO PERSONALIZZATO
 * ============================================================
 */
router.post(
    "/",

    /*
        #swagger.tags = ["Piatti"]
        #swagger.summary = "Crea un piatto personalizzato"
        #swagger.description = "Crea un nuovo piatto personalizzato per il ristorante."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    creaPiatto
);

/*
 * ============================================================
 * AGGIUNTA DI UN PIATTO DAL CATALOGO
 * ============================================================
 */
router.post(
    "/da-catalogo",

    /*
        #swagger.tags = ["Piatti"]
        #swagger.summary = "Aggiunge un piatto del catalogo al menu"
        #swagger.description = "Aggiunge al menu del ristorante un piatto presente nel catalogo."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    aggiungiPiattoDaCatalogo
);

/*
 * ============================================================
 * RICERCA DEI PIATTI
 * ============================================================
 */
router.get(
    "/",

    /*
        #swagger.tags = ["Piatti"]
        #swagger.summary = "Ricerca i piatti disponibili"
        #swagger.description = "Restituisce l'elenco dei piatti disponibili applicando eventuali filtri di ricerca."
    */

    ricercaPiatti
);

/*
 * ============================================================
 * VISUALIZZAZIONE DEL MENU DI UN RISTORANTE
 * ============================================================
 */
router.get(
    "/ristorante/:id",

    /*
        #swagger.tags = ["Piatti"]
        #swagger.summary = "Visualizza il menu di un ristorante"
        #swagger.description = "Restituisce i piatti presenti nel menu del ristorante specificato."
    */

    elencoPiattiRistorante
);

/*
 * ============================================================
 * MODIFICA DI UN PIATTO
 * ============================================================
 */
router.put(
    "/:id",

    /*
        #swagger.tags = ["Piatti"]
        #swagger.summary = "Modifica un piatto"
        #swagger.description = "Modifica i dati del piatto specificato."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    modificaPiatto
);

/*
 * ============================================================
 * ELIMINAZIONE DI UN PIATTO
 * ============================================================
 */
router.delete(
    "/:id",

    /*
        #swagger.tags = ["Piatti"]
        #swagger.summary = "Elimina un piatto"
        #swagger.description = "Elimina il piatto specificato dal menu del ristorante."
        #swagger.security = [{ "bearerAuth": [] }]
    */

    verificaToken,
    verificaRistoratore,
    eliminaPiatto
);

/*
 * ============================================================
 * ESPORTAZIONE DEL ROUTER
 * ============================================================
 */
module.exports = router;