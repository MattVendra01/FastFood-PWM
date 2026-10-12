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
const schemaOrdine = new mongoose.Schema({
    // Cliente
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utente",
        required: true
    },

    nomeCliente: { type: String, required: true, trim: true },

    // Ristorante
    ristorante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ristorante",
        required: true
    },

    nomeRistorante: { type: String, required: true, trim: true },

    // Piatti ordinati
    piatti: [
        {
            piatto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Piatto",
                required: true
            },

            nome: { type: String, required: true },
            prezzo: { type: Number, required: true, min: 0 },
            quantita: { type: Number, required: true, min: 1 }
        }
    ],

    // Informazioni dell'ordine
    totale: { type: Number, required: true, min: 0 },

    stato: {
        type: String,
        enum: ["ordinato", "in preparazione", "in consegna", "consegnato"],
        default: "ordinato"
    },

    // Preparazione
    tempoPreparazioneMinuti: { type: Number, default: null, min: 1 },
    inizioPreparazione: { type: Date, default: null },
    finePreparazioneStimata: { type: Date, default: null },

    // Informazioni del record
    dataCreazione: { type: Date, default: Date.now }
});

/*
 * ============================================================
 * CREAZIONE DEL MODELLO
 * ============================================================
 */
const Ordine = mongoose.model("Ordine", schemaOrdine, "ordini");

/*
 * ============================================================
 * ESPORTAZIONE DEL MODELLO
 * ============================================================
 */
module.exports = Ordine;