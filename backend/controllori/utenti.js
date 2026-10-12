/*
 * ============================================================
 * IMPORTAZIONI
 * ============================================================
 */
const Utente = require("../modelli/Utente"); // Modello Mongoose degli utenti
const bcrypt = require("bcryptjs"); // Libreria per hashing e confronto password
const jwt = require("jsonwebtoken"); // Libreria per creare token JWT
const gestioneAsincrona = require("../middleware/gestioneAsincrona"); // Gestisce errori async

/*
 * ============================================================
 * FUNZIONI DI SUPPORTO
 * ============================================================
 */
const creaToken = (utente) => {
    return jwt.sign(
        { idUtente: utente._id, tipoUtente: utente.tipoUtente }, // Payload del token
        process.env.JWT_SECRET, // Chiave segreta letta dalle variabili ambiente
        { expiresIn: "2h" } // Durata del token
    );
};

const formattaUtente = (utente) => {
    return { // Restituisce solo i dati utente utili al frontend
        id: utente._id,
        nome: utente.nome,
        cognome: utente.cognome,
        email: utente.email,
        tipoUtente: utente.tipoUtente,
        telefono: utente.telefono,
        metodoPagamento: utente.metodoPagamento,
        preferenze: utente.preferenze
    };
};

const validaTelefono = (telefono) => {
    return !telefono || /^\d{8,15}$/.test(telefono); // Telefono opzionale, altrimenti 8-15 cifre
};

const validaMetodoPagamento = (metodoPagamento) => {
    const { numeroCarta = "", scadenza = "", cvv = "" } = metodoPagamento || {}; // Valori vuoti se il metodo non esiste

    const pagamentoIniziato = numeroCarta !== "" || scadenza !== "" || cvv !== ""; // Verifica se l'utente ha iniziato a compilare

    if (!pagamentoIniziato) {
        return { valido: true, vuoto: true }; // Metodo di pagamento lasciato vuoto
    }

    if (!numeroCarta || !scadenza || !cvv) {
        return {
            valido: false,
            messaggio: "Per salvare il metodo di pagamento devi compilare numero carta, scadenza e CVV"
        };
    }

    if (!/^\d{16}$/.test(numeroCarta)) { // Regex: carta di 16 cifre
        return {
            valido: false,
            messaggio: "Il numero carta deve contenere 16 cifre"
        };
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(scadenza)) { // Regex formato MM/AA
        return {
            valido: false,
            messaggio: "La scadenza deve essere nel formato MM/AA"
        };
    }

    if (!/^\d{3}$/.test(cvv)) { // Regex: CVV di 3 cifre
        return {
            valido: false,
            messaggio: "Il CVV deve contenere 3 cifre"
        };
    }

    return { valido: true, numeroCarta, scadenza, cvv }; // Dati validati
};

/*
 * ============================================================
 * REGISTRAZIONE UTENTE
 * ============================================================
 */
const registrazioneUtente = gestioneAsincrona(async (req, res) => {
    const { nome, cognome, email, password, tipoUtente, telefono } = req.body; // Legge i dati inviati dal frontend

    if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ messaggio: "Il nome deve contenere almeno 2 caratteri" });
    }

    if (!cognome || cognome.trim().length < 2) {
        return res.status(400).json({ messaggio: "Il cognome deve contenere almeno 2 caratteri" });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({ messaggio: "Email obbligatoria" });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ messaggio: "La password deve contenere almeno 6 caratteri" });
    }

    if (!["cliente", "ristoratore"].includes(tipoUtente)) { // Accetta solo ruoli consentiti
        return res.status(400).json({ messaggio: "Tipo utente non valido" });
    }

    if (!validaTelefono(telefono)) {
        return res.status(400).json({ messaggio: "Il telefono deve contenere solo numeri, da 8 a 15 cifre" });
    }

    const emailNormalizzata = email.trim().toLowerCase(); // Normalizza l'email
    const utenteEsistente = await Utente.findOne({ email: emailNormalizzata }); // Controlla se l'email è già registrata

    if (utenteEsistente) {
        return res.status(409).json({ // 409 = conflitto
            messaggio: "Email già registrata" });
    }

    const nuovoUtente = await Utente.create({
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: emailNormalizzata,
        password: await bcrypt.hash(password, 10), // Hash della password con bcrypt
        tipoUtente,
        telefono
    });

    return res.status(201).json({
        messaggio: "Utente registrato correttamente",
        token: creaToken(nuovoUtente), // Crea subito il JWT
        utente: formattaUtente(nuovoUtente) // Restituisce i dati senza password
    });
});

/*
 * ============================================================
 * LOGIN UTENTE
 * ============================================================
 */
const loginUtente = gestioneAsincrona(async (req, res) => {
    const { email, password } = req.body; // Credenziali ricevute dal frontend

    if (!email || !password) {
        return res.status(400).json({ messaggio: "Email e password sono obbligatorie" });
    }

    const utente = await Utente.findOne({ email: email.trim().toLowerCase() }); // Cerca l'utente tramite email

    if (!utente) {
        return res.status(401).json({ messaggio: "Email o password non corretti" });
    }

    const passwordCorretta = await bcrypt.compare(
        password, utente.password); // Confronta password inserita e hash salvato

    if (!passwordCorretta) {
        return res.status(401).json({ messaggio: "Email o password non corretti" });
    }

    return res.status(200).json({
        messaggio: "Login effettuato con successo",
        token: creaToken(utente), // Genera il token JWT dopo il login
        utente: formattaUtente(utente)
    });
});

/*
 * ============================================================
 * PROFILO UTENTE
 * ============================================================
 */
const profiloUtente = gestioneAsincrona(async (req, res) => {
    const utente = await Utente.findById(req.utente.idUtente).select("-password"); // Recupera il profilo escludendo la password

    if (!utente) {
        return res.status(404).json({ messaggio: "Utente non trovato" });
    }

    return res.status(200).json({
        messaggio: "Profilo utente recuperato correttamente",
        utente
    });
});

/*
 * ============================================================
 * MODIFICA PROFILO UTENTE
 * ============================================================
 */
const modificaProfiloUtente = gestioneAsincrona(async (req, res) => {
    const { nome, cognome, telefono, metodoPagamento, preferenze, passwordAttuale, nuovaPassword } = req.body; // Legge i nuovi dati
    const utente = await Utente.findById(req.utente.idUtente); // Recupera l'utente autenticato

    if (!utente) {
        return res.status(404).json({ messaggio: "Utente non trovato" });
    }

    if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ messaggio: "Il nome deve contenere almeno 2 caratteri" });
    }

    if (!cognome || cognome.trim().length < 2) {
        return res.status(400).json({ messaggio: "Il cognome deve contenere almeno 2 caratteri" });
    }

    if (!validaTelefono(telefono)) {
        return res.status(400).json({ messaggio: "Il telefono deve contenere solo numeri, da 8 a 15 cifre" });
    }

    utente.nome = nome.trim(); // Aggiorna i dati anagrafici
    utente.cognome = cognome.trim();
    utente.telefono = telefono || "";

    if (passwordAttuale || nuovaPassword) { // Entra solo se si vuole cambiare password
        if (!passwordAttuale || !nuovaPassword) {
            return res.status(400).json({
                messaggio: "Per modificare la password devi inserire sia la password attuale sia la nuova password"
            });
        }

        if (nuovaPassword.length < 6) {
            return res.status(400).json({ messaggio: "La nuova password deve contenere almeno 6 caratteri" });
        }

        const passwordCorretta = await bcrypt.compare(
            passwordAttuale, 
            utente.password
        ); // Verifica la password attuale

        if (!passwordCorretta) {
            return res.status(401).json({ messaggio: "La password attuale non è corretta" });
        }

        utente.password = await bcrypt.hash(nuovaPassword, 10); // Salva l'hash della nuova password
    }

    if (utente.tipoUtente === "cliente" && metodoPagamento) { // Solo il cliente gestisce il pagamento
        const pagamento = validaMetodoPagamento(metodoPagamento); // Valida i dati della carta

        if (!pagamento.valido) {
            return res.status(400).json({ messaggio: pagamento.messaggio });
        }

        utente.metodoPagamento = pagamento.vuoto
            ? { // Se vuoto, azzera il metodo di pagamento
                tipo: "",
                numeroCarta: "",
                scadenza: "",
                cvv: ""
            }
            : { // Altrimenti salva i dati validati
                tipo: "carta di credito",
                numeroCarta: pagamento.numeroCarta,
                scadenza: pagamento.scadenza,
                cvv: pagamento.cvv
            };
    }

    if (utente.tipoUtente === "cliente" && preferenze) { // Preferenze disponibili solo ai clienti
        utente.preferenze = { 
            categoriePreferite: preferenze.categoriePreferite || [] 
        }; // Salva le categorie preferite
    }

    await utente.save(); // Salva tutte le modifiche nel DB

    return res.status(200).json({
        messaggio: "Profilo modificato correttamente",
        utente: formattaUtente(utente)
    });
});

/*
 * ============================================================
 * ELIMINAZIONE PROFILO UTENTE
 * ============================================================
 */
const eliminaProfiloUtente = gestioneAsincrona(async (req, res) => {
    const utenteEliminato = await Utente.findByIdAndDelete(req.utente.idUtente); // Elimina l'utente autenticato dal DB

    if (!utenteEliminato) {
        return res.status(404).json({ messaggio: "Utente non trovato" });
    }

    return res.status(200).json({ messaggio: "Profilo eliminato correttamente" });
});

/*
 * ============================================================
 * ESPORTAZIONE FUNZIONI
 * ============================================================
 */
module.exports = { registrazioneUtente, loginUtente, profiloUtente, 
    modificaProfiloUtente, eliminaProfiloUtente }; // Esporta i controller