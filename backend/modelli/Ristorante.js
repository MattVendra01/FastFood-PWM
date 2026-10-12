/*
 * ============================================================
 * IMPORTAZIONE DELLA LIBRERIA
 * ============================================================
 */
const mongoose = require("mongoose");

/*
 * ============================================================
 * DEFINIZIONE DELLO SCHEMA
 * ============================================================
 */
const schemaRistorante = new mongoose.Schema({
    // Informazioni del ristorante
    nomeRistorante: { type: String, required: true, trim: true },
    immagine: { type: String, default: "" },

    // Proprietario
    proprietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utente",
        required: true
    },
    nomeProprietario: { type: String, required: true, trim: true },

    // Contatti
    indirizzo: { type: String, required: true, trim: true },
    citta: { type: String, required: true, trim: true },
    telefono: { type: String, required: true, trim: true },
    partitaIVA: {  type: String, required: true, trim: true },

    // Stato del ristorante
    attivo: { type: Boolean, default: true },
});

/*
 * ============================================================
 * CREAZIONE DEL MODELLO
 * ============================================================
 */
const Ristorante = mongoose.model("Ristorante",
    schemaRistorante, "ristoranti");

/*
 * ============================================================
 * ESPORTAZIONE DEL MODELLO
 * ============================================================
 */
module.exports = Ristorante;