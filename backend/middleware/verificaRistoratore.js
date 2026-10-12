/*
 * ============================================================
 * FUNZIONE DI VERIFICA DEL RISTORATORE
 * ============================================================
 */
const verificaRistoratore = (req, res, next) => {
    if (req.utente.tipoUtente !== "ristoratore") {
        return res.status(403).json({
            messaggio: "Operazione consentita solo ai ristoratori."
        });
    }
    next();
};

/*
 * ============================================================
 * ESPORTAZIONE DEL MIDDLEWARE DEL RISTORATORE
 * ============================================================
 */
module.exports = verificaRistoratore;