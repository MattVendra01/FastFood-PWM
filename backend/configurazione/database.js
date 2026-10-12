/*
 * ============================================================
 * IMPORTAZIONE DELLA LIBRERIA
 * ============================================================
 */
const mongoose = require("mongoose");

/*
 * ============================================================
 * LETTURA DELLA VARIABILE D'AMBIENTE
 * ============================================================
 */
const MONGO_URI = process.env.MONGO_URI;

/*
 * ============================================================
 * COLLEGAMENTO AL DATABASE
 * ============================================================
 */
const collegaDatabase = () => {
    return mongoose.connect(MONGO_URI);
};

/*
 * ============================================================
 * ESPORTAZIONE DELLA FUNZIONE
 * ============================================================
 */
module.exports = collegaDatabase;