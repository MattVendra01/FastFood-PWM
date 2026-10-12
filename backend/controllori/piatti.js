/*
 * ============================================================
 * IMPORTAZIONE DEI MODELLI E DEL MIDDLEWARE
 * ============================================================
 */
const Catalogo = require("../modelli/Catalogo"); // Modello dei piatti del catalogo
const Piatto = require("../modelli/Piatto"); // Modello dei piatti dei ristoranti
const Ristorante = require("../modelli/Ristorante"); // Modello dei ristoranti
const gestioneAsincrona = require("../middleware/gestioneAsincrona"); // Gestisce errori async

/*
 * ============================================================
 * CONTROLLO DEL PROPRIETARIO DEL RISTORANTE
 * ============================================================
 */
const controllaProprietarioRistorante = async (idRistorante, idUtente) => {
    const ristorante = await Ristorante.findById(idRistorante); // Cerca il ristorante tramite ID

    if (!ristorante) {
        return { errore: true, stato: 404, messaggio: "Ristorante non trovato" };
    }

    if (ristorante.proprietario.toString() !== idUtente.toString()) { // Confronta proprietario e utente autenticato
        return { errore: true, stato: 403, 
            messaggio: "Non sei autorizzato a gestire il menu di questo ristorante"
        };
    }

    return { errore: false, ristorante }; // Autorizzazione superata
};

/*
 * ============================================================
 * CREAZIONE DI UN PIATTO PERSONALIZZATO
 * ============================================================
 */
const creaPiatto = gestioneAsincrona(async (req, res) => {
    const { ristorante, nome, categoria, prezzo, ingredienti, 
        allergeni, immagine, disponibile } = req.body; // Legge i dati inviati dal frontend

    if (!ristorante || !nome || !categoria || prezzo === undefined) { // Verifica i campi obbligatori
        return res.status(400).json({ 
            messaggio: "Ristorante, nome, categoria e prezzo sono obbligatori" });
    }

    const controllo = await controllaProprietarioRistorante(
        ristorante, req.utente.idUtente); // Verifica che il ristorante appartenga all'utente

    if (controllo.errore) {
        return res.status(controllo.stato).json({ 
            messaggio: controllo.messaggio });
    }

    const nuovoPiatto = await Piatto.create({ // Crea e salva il piatto nel DB
        piattoCatalogo: null, // Indica che il piatto non deriva dal catalogo
        nome: nome.trim(), // Rimuove spazi iniziali e finali
        ristorante,
        nomeRistorante: controllo.ristorante.nomeRistorante,
        categoria: categoria.trim(),
        prezzo,
        ingredienti: ingredienti || [], // Usa array vuoto se non specificati
        allergeni: allergeni || [], // Usa array vuoto se non specificati
        immagine: immagine?.trim() || "", // Immagine opzionale
        disponibile: disponibile ?? true // Default true se non specificato
    });

    return res.status(201).json({
        messaggio: "Piatto personalizzato creato correttamente",
        piatto: nuovoPiatto
    });
});

/*
 * ============================================================
 * AGGIUNTA DI UN PIATTO DAL CATALOGO
 * ============================================================
 */
const aggiungiPiattoDaCatalogo = gestioneAsincrona(async (req, res) => {
    const { idPiattoCatalogo, ristorante, prezzo, disponibile } = req.body; // Dati necessari per importare il piatto

    if (!idPiattoCatalogo || !ristorante || prezzo === undefined) { // Verifica i campi obbligatori
        return res.status(400).json({ 
            messaggio: "Piatto del catalogo, ristorante e prezzo sono obbligatori" });
    }

    const piattoCatalogo = await Catalogo.findById(idPiattoCatalogo); // Recupera il piatto dal catalogo

    if (!piattoCatalogo) {
        return res.status(404).json({ messaggio: "Piatto del catalogo non trovato" });
    }

    const controllo = await controllaProprietarioRistorante(ristorante, req.utente.idUtente); // Controlla il proprietario

    if (controllo.errore) {
        return res.status(controllo.stato).json({ messaggio: controllo.messaggio });
    }

    const piattoGiaNelMenu = await Piatto.findOne({ ristorante, piattoCatalogo: idPiattoCatalogo }); // Cerca eventuali duplicati

    if (piattoGiaNelMenu) {
        return res.status(409).json({ // 409 = conflitto con una risorsa esistente
            messaggio: "Questo piatto del catalogo è già presente nel menu del ristorante" });
    }

    const nuovoPiatto = await Piatto.create({ // Copia i dati del catalogo nel menu
        piattoCatalogo: idPiattoCatalogo, // Mantiene il riferimento al catalogo
        nome: piattoCatalogo.nome,
        ristorante,
        nomeRistorante: controllo.ristorante.nomeRistorante,
        categoria: piattoCatalogo.categoria,
        prezzo,
        ingredienti: piattoCatalogo.ingredienti || [],
        allergeni: piattoCatalogo.allergeni || [],
        immagine: piattoCatalogo.immagine || "",
        disponibile: disponibile ?? true
    });

    return res.status(201).json({
        messaggio: "Piatto aggiunto al menu dal catalogo",
        piatto: nuovoPiatto
    });
});

/*
 * ============================================================
 * ELENCO DEI PIATTI DI UN RISTORANTE
 * ============================================================
 */
const elencoPiattiRistorante = gestioneAsincrona(async (req, res) => {
    const piatti = await Piatto.find({ ristorante: req.params.id }) // Cerca i piatti del ristorante indicato nella rotta
        .populate("ristorante", "nomeRistorante citta indirizzo") // Sostituisce l'ID con i dati del ristorante
        .populate("piattoCatalogo"); // Recupera anche il piatto originale del catalogo

    return res.status(200).json(piatti);
});

/*
 * ============================================================
 * RICERCA DEI PIATTI
 * ============================================================
 */
const ricercaPiatti = gestioneAsincrona(async (req, res) => {
    const { nome, categoria, prezzoMin, prezzoMax, ingrediente, allergene } = req.query; // Filtri ricevuti tramite query URL
    const filtro = { disponibile: true }; // Mostra solo piatti disponibili

    if (nome) {
        filtro.nome = { $regex: nome, $options: "i" }; // Ricerca parziale case-insensitive
    }

    if (categoria) {
        filtro.categoria = { $regex: categoria, $options: "i" }; // Filtra per categoria
    }

    if (prezzoMin || prezzoMax) {
        filtro.prezzo = {}; // Costruisce un intervallo di prezzo

        if (prezzoMin) {
            filtro.prezzo.$gte = Number(prezzoMin); // Prezzo maggiore o uguale al minimo
        }

        if (prezzoMax) {
            filtro.prezzo.$lte = Number(prezzoMax); // Prezzo minore o uguale al massimo
        }
    }

    if (ingrediente) {
        filtro.ingredienti = { $regex: ingrediente, $options: "i" }; // Cerca tra gli ingredienti
    }

    if (allergene) {
        filtro.allergeni = { $regex: allergene, $options: "i" }; // Cerca tra gli allergeni
    }

    const piatti = await Piatto.find(filtro) // Esegue la ricerca nel DB
        .populate("ristorante", "nomeRistorante citta indirizzo")
        .populate("piattoCatalogo");

    return res.status(200).json(piatti);
});

/*
 * ============================================================
 * MODIFICA DI UN PIATTO
 * ============================================================
 */
const modificaPiatto = gestioneAsincrona(async (req, res) => {
    const piatto = await Piatto.findById(req.params.id); // Cerca il piatto da modificare

    if (!piatto) {
        return res.status(404).json({ messaggio: "Piatto non trovato" });
    }

    const controllo = await controllaProprietarioRistorante(piatto.ristorante, req.utente.idUtente); // Verifica il proprietario

    if (controllo.errore) {
        return res.status(controllo.stato).json({ messaggio: controllo.messaggio });
    }

    piatto.nome = req.body.nome?.trim() ?? piatto.nome; // Modifica solo se il valore è presente
    piatto.categoria = req.body.categoria?.trim() ?? piatto.categoria;
    piatto.prezzo = req.body.prezzo ?? piatto.prezzo;
    piatto.ingredienti = req.body.ingredienti ?? piatto.ingredienti;
    piatto.allergeni = req.body.allergeni ?? piatto.allergeni;
    piatto.immagine = req.body.immagine?.trim() ?? piatto.immagine;
    piatto.disponibile = req.body.disponibile ?? piatto.disponibile;

    await piatto.save(); // Salva le modifiche nel DB

    return res.status(200).json({
        messaggio: "Piatto modificato correttamente",
        piatto
    });
});

/*
 * ============================================================
 * ELIMINAZIONE DI UN PIATTO
 * ============================================================
 */
const eliminaPiatto = gestioneAsincrona(async (req, res) => {
    const piatto = await Piatto.findById(req.params.id); // Cerca il piatto da eliminare

    if (!piatto) {
        return res.status(404).json({ messaggio: "Piatto non trovato" });
    }

    const controllo = await controllaProprietarioRistorante(piatto.ristorante, req.utente.idUtente); // Verifica il proprietario

    if (controllo.errore) {
        return res.status(controllo.stato).json({ messaggio: controllo.messaggio });
    }

    await piatto.deleteOne(); // Elimina il documento da MongoDB

    return res.status(200).json({ messaggio: "Piatto eliminato correttamente" });
});

/*
 * ============================================================
 * ESPORTAZIONE FUNZIONI
 * ============================================================
 */
module.exports = { creaPiatto, aggiungiPiattoDaCatalogo, elencoPiattiRistorante, 
    ricercaPiatti, modificaPiatto, eliminaPiatto }; // Esporta i controller alle rotte