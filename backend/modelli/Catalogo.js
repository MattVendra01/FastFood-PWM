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
const schemaPiattoCatalogo = new mongoose.Schema({
    // Informazioni del piatto
    idMeal: { type: String, required: true, unique: true },
    nome: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    area: { type: String, default: "" },
    descrizione: { type: String, default: "" },
    immagine: { type: String, default: "" },
    ingredienti: { type: [String], default: [] },
    misure: { type: [String], default: [] },
    allergeni: { type: [String], default: [] },

    // Collegamenti esterni
    youtube: { type: String, default: "" },
    fonte: { type: String, default: "" },

    // Informazioni del record
    dataImportazione: { type: Date, default: Date.now }
});

/*
 * ============================================================
 * CREAZIONE DEL MODELLO
 * ============================================================
 */
const Catalogo = mongoose.model("Catalogo", 
    schemaPiattoCatalogo, "catalogo");

/*
 * ============================================================
 * ESPORTAZIONE DEL MODELLO
 * ============================================================
 */
module.exports = Catalogo;