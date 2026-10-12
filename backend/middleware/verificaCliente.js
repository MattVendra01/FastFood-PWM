/*
 * ============================================================
 * FUNZIONE DI VERIFICA DEL CLIENTE
 * ============================================================
 */
const verificaCliente = (req, res, next) => {
    if (req.utente.tipoUtente !== "cliente") {
        return res.status(403).json({
            messaggio: "Operazione consentita solo ai clienti."
        });
    }
    next();
};

/*
 * ============================================================
 * ESPORTAZIONE DEL MIDDLEWARE DEL CLIENTE
 * ============================================================
 */
module.exports = verificaCliente;