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
const schemaUtente = new mongoose.Schema({
    // Dati anagrafici
    nome: { type: String, required: true, trim: true },
    cognome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, 
        trim: true, lowercase: true },
    password: { type: String, required: true },
    telefono: { type: String, default: "", validate: {
            validator: function (valore) {
                return valore === "" || /^\d{8,15}$/.test(valore);
            },
            message: "Il telefono deve contenere solo numeri, da 8 a 15 cifre"
        }
    },

    // Ruolo dell'utente
    tipoUtente: { type: String, enum: ["cliente", "ristoratore"], 
        required: true },

    // Metodo di pagamento
    metodoPagamento: {
        tipo: { type: String,
            enum: ["carta di credito", "carta prepagata", ""],
            default: "" },
        numeroCarta: { type: String, default: "" },
        scadenza: { type: String, default: "" },
        cvv: { type: String, default: "" }
    },

    // Preferenze dell'utente
    preferenze: {
        categoriePreferite: { type: [String], default: [] }},
});

/*
 * ============================================================
 * CREAZIONE DEL MODELLO
 * ============================================================
 */
const Utente = mongoose.model("Utente", schemaUtente, "utenti");

/*
 * ============================================================
 * ESPORTAZIONE DEL MODELLO
 * ============================================================
 */
module.exports = Utente;