/*
 * ============================================================
 * IMPORTAZIONE DEI MODELLI E DEL MIDDLEWARE
 * ============================================================
 */
const Ristorante = require("../modelli/Ristorante"); // Modello Mongoose dei ristoranti
const Utente = require("../modelli/Utente"); // Modello Mongoose degli utenti
const Piatto = require("../modelli/Piatto"); // Modello Mongoose dei piatti
const gestioneAsincrona = require("../middleware/gestioneAsincrona"); // Gestisce errori async

/*
 * ============================================================
 * VALIDAZIONE DEI DATI DEL RISTORANTE
 * ============================================================
 */
const validaDatiRistorante = ({ nomeRistorante, telefono, partitaIVA, indirizzo, citta }) => {
    if (!nomeRistorante || !telefono || !partitaIVA || !indirizzo || !citta) { // Verifica i campi obbligatori
        return "Nome ristorante, telefono, partita IVA, indirizzo e città sono obbligatori";
    }

    if (!/^\d{8,15}$/.test(telefono)) { // Regex: telefono da 8 a 15 cifre
        return "Il telefono del ristorante deve contenere solo numeri, da 8 a 15 cifre";
    }

    if (!/^\d{11}$/.test(partitaIVA)) { // Regex: Partita IVA di 11 cifre
        return "La Partita IVA deve contenere esattamente 11 cifre numeriche";
    }

    return null; // Nessun errore di validazione
};

/*
 * ============================================================
 * CREAZIONE RISTORANTE
 * ============================================================
 */
const creaRistorante = gestioneAsincrona(async (req, res) => {const idUtente = req.utente.idUtente; // ID dell'utente autenticato dal JWT

    const ristoranteEsistente = await Ristorante.findOne({ proprietario: idUtente }); // Controlla se possiede già un ristorante

    if (ristoranteEsistente) {
        return res.status(409).json({ // 409 = conflitto con risorsa esistente
            messaggio: "Questo ristoratore ha già creato un ristorante" });
    }

    const proprietario = await Utente.findById(idUtente); // Recupera i dati del proprietario

    if (!proprietario) {
        return res.status(404).json({ messaggio: "Proprietario non trovato" });
    }

    const { nomeRistorante, descrizione, telefono, partitaIVA, indirizzo, citta, immagine } = req.body; // Legge i dati inviati dal frontend

    const erroreValidazione = validaDatiRistorante({ nomeRistorante, telefono, partitaIVA, indirizzo, citta }); // Valida i dati

    if (erroreValidazione) {
        return res.status(400).json({ messaggio: erroreValidazione });
    }

    const nuovoRistorante = await Ristorante.create({ // Crea e salva il ristorante
        nomeRistorante: nomeRistorante.trim(), // Rimuove spazi iniziali/finali
        descrizione: descrizione?.trim() || "", // Campo opzionale
        proprietario: idUtente,
        nomeProprietario: `${proprietario.nome} ${proprietario.cognome}`,
        indirizzo: indirizzo.trim(),
        citta: citta.trim(),
        telefono: telefono.trim(),
        partitaIVA: partitaIVA.trim(),
        immagine: immagine?.trim() || "",
        attivo: true // Il ristorante nasce attivo
    });

    return res.status(201).json({
        messaggio: "Ristorante creato correttamente",
        ristorante: nuovoRistorante
    });
});

/*
 * ============================================================
 * RICERCA RISTORANTI
 * ============================================================
 */
const ricercaRistoranti = gestioneAsincrona(async (req, res) => {
    const { nome, citta } = req.query; // Filtri ricevuti tramite query URL
    const filtro = { attivo: true }; // Mostra solo ristoranti attivi

    if (nome) {
        filtro.nomeRistorante = { $regex: nome, $options: "i" }; // Ricerca parziale case-insensitive
    }

    if (citta) {
        filtro.citta = { $regex: citta, $options: "i" }; // Filtra per città
    }

    const ristoranti = await Ristorante.find(filtro); // Esegue la ricerca nel DB

    return res.status(200).json(ristoranti);
});

/*
 * ============================================================
 * RECUPERO DEL PROPRIO RISTORANTE
 * ============================================================
 */
const recuperaMioRistorante = gestioneAsincrona(async (req, res) => {
    const ristoranti = await Ristorante.find({ proprietario: req.utente.idUtente }); // Cerca il ristorante dell'utente autenticato

    return res.status(200).json(ristoranti);
});

/*
 * ============================================================
 * MODIFICA DEL PROPRIO RISTORANTE
 * ============================================================
 */
const modificaMioRistorante = gestioneAsincrona(async (req, res) => {
    const ristorante = await Ristorante.findOne({ proprietario: req.utente.idUtente }); // Cerca il ristorante del proprietario

    if (!ristorante) {
        return res.status(404).json({ messaggio: "Ristorante non trovato" });
    }

    const { nomeRistorante, descrizione, telefono, partitaIVA, indirizzo, citta, immagine } = req.body; // Legge i nuovi dati

    const erroreValidazione = validaDatiRistorante({ nomeRistorante, telefono, partitaIVA, indirizzo, citta }); // Rivalida i dati

    if (erroreValidazione) {
        return res.status(400).json({ messaggio: erroreValidazione });
    }

    ristorante.nomeRistorante = nomeRistorante.trim(); // Aggiorna i campi
    ristorante.descrizione = descrizione?.trim() || "";
    ristorante.telefono = telefono.trim();
    ristorante.partitaIVA = partitaIVA.trim();
    ristorante.indirizzo = indirizzo.trim();
    ristorante.citta = citta.trim();
    ristorante.immagine = immagine?.trim() || "";

    await ristorante.save(); // Salva le modifiche nel DB

    return res.status(200).json({
        messaggio: "Ristorante modificato correttamente",
        ristorante
    });
});

/*
 * ============================================================
 * ELIMINAZIONE DEL PROPRIO RISTORANTE
 * ============================================================
 */
const eliminaMioRistorante = gestioneAsincrona(async (req, res) => {
    const ristorante = await Ristorante.findOne({ proprietario: req.utente.idUtente }); // Cerca il ristorante dell'utente

    if (!ristorante) {
        return res.status(404).json({ messaggio: "Ristorante non trovato" });
    }

    await Piatto.deleteMany({ ristorante: ristorante._id }); // Elimina tutti i piatti collegati

    await Ristorante.findByIdAndDelete(ristorante._id); // Elimina il ristorante dal DB

    return res.status(200).json({ messaggio: "Ristorante eliminato correttamente" });
});

/*
 * ============================================================
 * ESPORTAZIONE FUNZIONI
 * ============================================================
 */
module.exports = { creaRistorante, ricercaRistoranti, recuperaMioRistorante, 
    modificaMioRistorante, eliminaMioRistorante }; // Esporta i controller alle rotte