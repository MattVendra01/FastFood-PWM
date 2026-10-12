/*
 * ============================================================
 * GESTIONE DELLE FUNZIONI ASINCRONE
 * ============================================================
 */
const gestioneAsincrona = (funzione) => {
    return (req, res, next) => {
        Promise.resolve(funzione(req, res, next)).catch(next);
    };
};

/*
 * ============================================================
 * ESPORTAZIONE DEL MIDDLEWARE
 * ============================================================
 */
module.exports = gestioneAsincrona;