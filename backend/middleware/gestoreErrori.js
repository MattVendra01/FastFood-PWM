/*
 * ============================================================
 * GESTIONE CENTRALIZZATA DEGLI ERRORI
 * ============================================================
 */
const gestoreErrori = (errore, req, res, next) => {
    console.error(errore);

    if (errore.code === 11000) {
        return res.status(409).json({
            messaggio: "Dato già esistente"
        });
    }

    return res.status(500).json({
        messaggio: "Errore interno del server"
    });
};

/*
 * ============================================================
 * ESPORTAZIONE DEL MIDDLEWARE
 * ============================================================
 */
module.exports = gestoreErrori;