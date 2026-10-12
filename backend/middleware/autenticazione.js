/*
 * ============================================================
 * IMPORTAZIONE DELLA LIBRERIA
 * ============================================================
 */
const jwt = require("jsonwebtoken");

/*
 * ============================================================
 * FUNZIONE DI AUTENTICAZIONE
 * ============================================================
 */
const verificaToken = (req, res, next) => {
    const autorizzazione = req.headers.authorization;

    if (!autorizzazione?.startsWith("Bearer ")) {
        return res.status(401).json({
            messaggio: "Token mancante o non valido."
        });
    }
    try {
        const token = autorizzazione.split(" ")[1];
        req.utente = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            messaggio: "Token non valido o scaduto."
        });
    }
};

/*
 * ============================================================
 * ESPORTAZIONE DEL MIDDLEWARE
 * ============================================================
 */
module.exports = verificaToken;