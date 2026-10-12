/*
 * ============================================================
 * IMPORTAZIONE DEI MODELLI E DEL MIDDLEWARE
 * ============================================================
 */
const Ordine = require("../modelli/Ordine"); // Modello Mongoose degli ordini
const Piatto = require("../modelli/Piatto"); // Modello Mongoose dei piatti
const Ristorante = require("../modelli/Ristorante"); // Modello dei ristoranti
const Utente = require("../modelli/Utente"); // Modello degli utenti
const gestioneAsincrona = require("../middleware/gestioneAsincrona"); // Gestisce errori async

/*
 * ============================================================
 * CONTROLLO DEL PROPRIETARIO DEL RISTORANTE
 * ============================================================
 */
const controllaProprietarioRistorante = async (idRistorante, idUtente) => {
    const ristorante = await Ristorante.findById(idRistorante); // Cerca il ristorante tramite ID

    if (!ristorante) {
        return { errore: true, stato: 404,
            messaggio: "Ristorante non trovato" };
    }

    if (ristorante.proprietario.toString() !== idUtente) { // Verifica che l'utente sia il proprietario
        return { errore: true, stato: 403,
            messaggio: "Non sei autorizzato a gestire gli ordini di questo ristorante"
        };
    }

    return { errore: false, ristorante }; // Autorizzazione superata
};

/*
 * ============================================================
 * CREAZIONE DELL'ORDINE
 * ============================================================
 */
const creaOrdine = gestioneAsincrona(async (req, res) => {
    const { ristorante, piatti } = req.body; // Legge i dati inviati dal frontend

    if (!ristorante || !Array.isArray(piatti) || piatti.length === 0) { // Controlla presenza ristorante e piatti
        return res.status(400).json({ 
            messaggio: "Ristorante e piatti sono obbligatori" });
    }

    const ristoranteTrovato = await Ristorante.findById(ristorante); // Recupera il ristorante dal DB

    if (!ristoranteTrovato) {
        return res.status(404).json({ 
            messaggio: "Ristorante non trovato" });
    }

    if (!ristoranteTrovato.attivo) { // Impedisce ordini a ristoranti inattivi
        return res.status(400).json({ 
            messaggio: "Il ristorante non è attivo" });
    }

    const cliente = await Utente.findById(req.utente.idUtente); // Cliente ricavato dal token JWT

    if (!cliente) {
        return res.status(404).json({ 
            messaggio: "Cliente non trovato" });
    }

    const metodoPagamento = cliente.metodoPagamento; // Recupera il metodo di pagamento

    if (!metodoPagamento.tipo || !metodoPagamento.numeroCarta 
        || !metodoPagamento.scadenza || !metodoPagamento.cvv) { // Verifica pagamento completo
        return res.status(400).json({ 
            messaggio: "Prima di effettuare un ordine devi inserire un metodo di pagamento nel profilo" });
    }

    const piattiOrdine = []; // Conterrà i piatti validati dell'ordine
    let totale = 0; // Totale iniziale dell'ordine

    for (const elemento of piatti) { // Controlla ogni elemento del carrello
        const idPiatto = elemento.piatto;
        const quantita = Number(elemento.quantita); // Converte la quantità in numero

        if (!idPiatto || !Number.isInteger(quantita) || quantita < 1) { // Valida ID e quantità
            return res.status(400).json({ 
                messaggio: "Ogni piatto deve avere un id e una quantità valida" });
        }

        const piatto = await Piatto.findById(idPiatto); // Recupera il piatto dal DB

        if (!piatto) {
            return res.status(404).json({ 
                messaggio: `Piatto non trovato: ${idPiatto}` });
        }

        if (piatto.ristorante.toString() !== ristorante.toString()) { // Impone un solo ristorante per ordine
            return res.status(400).json({ 
                messaggio: "Tutti i piatti devono appartenere allo stesso ristorante" });
        }

        if (!piatto.disponibile) { // Impedisce l'acquisto di piatti non disponibili
            return res.status(400).json({ 
                messaggio: `Il piatto ${piatto.nome} non è disponibile` });
        }

        totale += piatto.prezzo * quantita; // Somma prezzo × quantità al totale

        piattiOrdine.push({ piatto: piatto._id, // Inserisce il piatto nell'ordine
            nome: piatto.nome, prezzo: piatto.prezzo, quantita });
    }

    const nuovoOrdine = new Ordine({ // Crea un documento Ordine
        cliente: cliente._id,
        nomeCliente: `${cliente.nome} ${cliente.cognome}`,
        ristorante: ristoranteTrovato._id,
        nomeRistorante: ristoranteTrovato.nomeRistorante,
        piatti: piattiOrdine,
        totale,
        stato: "ordinato" // Stato iniziale dell'ordine
    });

    const ordineSalvato = await nuovoOrdine.save(); // Salva l'ordine in MongoDB

    return res.status(201).json({ 
        messaggio: "Ordine creato correttamente", 
        ordine: ordineSalvato });
});

/*
 * ============================================================
 * ELENCO DEGLI ORDINI DEL RISTORANTE
 * ============================================================
 */
const elencoOrdiniRistorante = gestioneAsincrona(
    async (req, res) => {

    const idRistorante = req.params.id; // ID ricevuto dalla rotta
    const controllo = await controllaProprietarioRistorante(idRistorante, req.utente.idUtente); // Controlla il proprietario

    if (controllo.errore) {
        return res.status(controllo.stato).json({ 
            messaggio: controllo.messaggio });
    }

    const ordini = await Ordine.find({ 
        ristorante: idRistorante // Cerca gli ordini del ristorante
    })
        .populate("cliente", "nome cognome email telefono") // Sostituisce ID con dati cliente
        .sort({ dataCreazione: -1 }); // Ordina dal più recente
        
    return res.status(200).json(ordini);
});

/*
 * ============================================================
 * AGGIORNAMENTO DELLO STATO DELL'ORDINE
 * ============================================================
 */
const aggiornaStatoOrdine = gestioneAsincrona(async (req, res) => {
    const idOrdine = req.params.id; // ID dell'ordine dalla rotta
    const { tempoPreparazioneMinuti } = req.body;

    const stato = typeof req.body.stato === "string"
        ? req.body.stato.trim()
        : ""; // Legge e ripulisce lo stato ricevuto

    const statiConsentiti = ["ordinato", "in preparazione", "in consegna", "consegnato"]; // Stati ammessi

    if (!statiConsentiti.includes(stato)) { // Verifica che lo stato sia valido
        return res.status(400).json({
            messaggio: "Stato ordine non valido" });
    }

    const ordine = await Ordine.findById(idOrdine); // Recupera l'ordine dal DB

    if (!ordine) {
        return res.status(404).json({ 
            messaggio: "Ordine non trovato" });
    }

    const controllo = await controllaProprietarioRistorante(ordine.ristorante, req.utente.idUtente); // Verifica il proprietario

    if (controllo.errore) {
        return res.status(controllo.stato).json({ 
            messaggio: controllo.messaggio });
    }

    if (stato === "in preparazione") {
        const minuti = Number(tempoPreparazioneMinuti); // Converte il tempo in numero

        if (!Number.isFinite(minuti) || minuti <= 0) { // Valida il tempo inserito
            return res.status(400).json({
                messaggio: "Quando l'ordine passa in preparazione devi indicare un tempo di preparazione valido"
            });
        }

        ordine.tempoPreparazioneMinuti = minuti; // Memorizza i minuti previsti
        ordine.inizioPreparazione = new Date(); // Salva l'istante di inizio
        ordine.finePreparazioneStimata = new Date(Date.now() + minuti * 60 * 1000); // Calcola la fine
    }

    ordine.stato = stato; // Imposta il nuovo stato

    const ordineAggiornato = await ordine.save(); // Salva le modifiche nel DB

    return res.status(200).json({
        messaggio: "Stato ordine aggiornato correttamente",
        ordine: ordineAggiornato
    });
});

/*
 * ============================================================
 * STATISTICHE DEL RISTORANTE
 * ============================================================
 */
const statisticheRistorante = gestioneAsincrona(async (req, res) => {
    const idRistorante = req.params.id;
    const controllo = await controllaProprietarioRistorante(idRistorante, req.utente.idUtente); // Verifica il proprietario

    if (controllo.errore) {
        return res.status(controllo.stato).json({ 
            messaggio: controllo.messaggio });
    }

    const ordini = await Ordine.find({ ristorante: idRistorante }); // Recupera tutti gli ordini
    const incassoTotale = ordini.reduce((totale, ordine) => totale + ordine.totale, 0); // Somma i totali degli ordini

    return res.status(200).json({ 
        numeroOrdini: ordini.length, incassoTotale }); // Restituisce le statistiche
});

/*
 * ============================================================
 * ACQUISTI PRESENTI E PASSATI DEL CLIENTE
 * ============================================================
 */
const acquistiCliente = gestioneAsincrona(async (req, res) => {
    const ordini = await Ordine.find({ cliente: req.utente.idUtente }) // Cerca gli ordini dell'utente autenticato
        .populate("ristorante", "nomeRistorante indirizzo citta") // Aggiunge i dati del ristorante
        .sort({ dataCreazione: -1 }); // Ordina dal più recente

    const acquistiPresenti = ordini.filter((ordine) => ordine.stato !== "consegnato"); // Separa gli ordini ancora attivi
    const acquistiPassati = ordini.filter((ordine) => ordine.stato === "consegnato"); // Separa gli ordini conclusi

    return res.status(200).json({ acquistiPresenti, acquistiPassati });
});

/*
 * ============================================================
 * ESPORTAZIONE FUNZIONI
 * ============================================================
 */
module.exports = { creaOrdine, elencoOrdiniRistorante, aggiornaStatoOrdine, statisticheRistorante, acquistiCliente }; // Esporta i controller