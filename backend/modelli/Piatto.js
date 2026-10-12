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
const schemaPiatto = new mongoose.Schema({
    // Collegamenti
    piattoCatalogo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Catalogo",
        default: null
    },

    ristorante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ristorante",
        required: true
    },

    // Informazioni del piatto
    nome: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    prezzo: { type: Number, required: true },
    ingredienti: { type: [String], default: [] },
    allergeni: { type: [String], default: [] },
    immagine: { type: String, default: "" },

    // Ristorante
    nomeRistorante: { type: String, required: true, trim: true },

    // Disponibilità
    disponibile: { type: Boolean, default: true },
});

/*
 * ============================================================
 * INDICE COMPOSTO
 * ============================================================
 */
schemaPiatto.index(
    { ristorante: 1, piattoCatalogo: 1 },
    {
        unique: true,
        partialFilterExpression: {
            piattoCatalogo: { $type: "objectId" }
        }
    }
);

/*
 * ============================================================
 * CREAZIONE DEL MODELLO
 * ============================================================
 */
const Piatto = mongoose.model("Piatto", schemaPiatto, "piatti");

/*
 * ============================================================
 * ESPORTAZIONE DEL MODELLO
 * ============================================================
 */
module.exports = Piatto;