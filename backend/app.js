/*
 * ============================================================
 * CARICAMENTO DELLE VARIABILI D'AMBIENTE
 * ============================================================
 */
require("dotenv").config(); // Carica le variabili definite nel file .env dentro process.env

/*
 * ============================================================
 * IMPORTAZIONE DELLE LIBRERIE
 * ============================================================
 */
const express = require("express"); // Importa Express per creare il server e gestire rotte e middleware
const cors = require("cors"); // CORS per consentire richieste al backend da origini differenti
const swaggerUi = require("swagger-ui-express"); // Swagger UI per visualizzare la documentazione delle API

/*
 * ============================================================
 * IMPORTAZIONE DELLA CONFIGURAZIONE DEL DATABASE
 * ============================================================
 */
const collegaDatabase = require("./configurazione/database"); // Funzione che effettua la connessione a MongoDB

/*
 * ============================================================
 * IMPORTAZIONE DELLA DOCUMENTAZIONE SWAGGER
 * ============================================================
 */
const swaggerDocument = require("./swagger/swagger.json"); // Documentazione Swagger generata

/*
 * ============================================================
 * IMPORTAZIONE DELLE ROTTE API
 * ============================================================
 */
const rotteUtenti = require("./rotte/utenti"); // Importa le rotte relative agli utenti
const rotteRistoranti = require("./rotte/ristoranti"); // Importa le rotte relative ai ristoranti
const rotteCatalogo = require("./rotte/catalogo"); // Importa le rotte relative al catalogo
const rottePiatti = require("./rotte/piatti"); // Importa le rotte relative ai piatti
const rotteOrdini = require("./rotte/ordini"); // Importa le rotte relative agli ordini

/*
 * ============================================================
 * IMPORTAZIONE DEL GESTORE DEGLI ERRORI
 * ============================================================
 */
const gestoreErrori = require("./middleware/gestoreErrori"); // Middleware che gestisce centralmente gli errori

/*
 * ============================================================
 * LETTURA DELLE VARIABILI D'AMBIENTE
 * ============================================================
 */
const PORTA = process.env.PORTA || 3000; // Legge la porta dal .env oppure usa 3000 come valore predefinito

/*
 * ============================================================
 * CREAZIONE DELL'APPLICAZIONE EXPRESS
 * ============================================================
 */
const app = express(); // Crea l'istanza principale dell'applicazione Express

/*
 * ============================================================
 * CONFIGURAZIONE DEI MIDDLEWARE
 * ============================================================
 */
app.use(cors()); // Abilita CORS per le richieste HTTP verso il backend
app.use(express.json()); // Permette a Express di leggere i body delle richieste in formato JSON

/*
 * ============================================================
 * DOCUMENTAZIONE SWAGGER DELLE API
 * ============================================================
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Configurazione Swagger UI

/*
 * ============================================================
 * ROTTA DI CONTROLLO DEL BACKEND
 * ============================================================
 */
// Richiesta GET alla rotta principale "/" per verificare che il backend sia attivo
app.get("/", (req, res) => { res.json({ messaggio: "Backend FastFood attivo!" }); });

/*
 * ============================================================
 * COLLEGAMENTO DELLE ROTTE API
 * ============================================================
 */
app.use("/api/utenti", rotteUtenti); // Collega tutte le rotte utenti al prefisso /api/utenti
app.use("/api/ristoranti", rotteRistoranti); // Collega tutte le rotte ristoranti al prefisso /api/ristoranti
app.use("/api/catalogo", rotteCatalogo); // Collega tutte le rotte catalogo al prefisso /api/catalogo
app.use("/api/piatti", rottePiatti); // Collega tutte le rotte piatti al prefisso /api/piatti
app.use("/api/ordini", rotteOrdini); // Collega tutte le rotte ordini al prefisso /api/ordini

/*
 * ============================================================
 * GESTIONE CENTRALIZZATA DEGLI ERRORI
 * ============================================================
 */
app.use(gestoreErrori); // Registra il gestore degli errori dopo le rotte

/*
 * ============================================================
 * AVVIO DEL SERVER DOPO LA CONNESSIONE AL DATABASE
 * ============================================================
 */
collegaDatabase() // Avvia il tentativo di connessione a MongoDB
    .then(() => { // Viene eseguito se la connessione al database riesce
        console.log("Connessione a MongoDB riuscita"); // Mostra nel terminale la conferma della connessione

        // Avvia il server Express sulla porta configurata e mostra nel terminale l'indirizzo del server
        app.listen(PORTA, () => { console.log(`Server avviato su http://localhost:${PORTA}`); });
    })
    .catch((errore) => { // Viene eseguito se la connessione al database fallisce
        console.error("Errore durante il collegamento a MongoDB"); // Mostra un messaggio generale di errore
        console.error(errore); // Mostra nel terminale i dettagli dell'errore ricevuto
    });

/*
 * ============================================================
 * COMANDI PRINCIPALI DEL PROGETTO
 * ============================================================
 *
 * Comandi da eseguire nella cartella backend:
 *      Avvio del server con nodemon:
 *      npm run dev
 *
 *      Generazione della documentazione Swagger:
 *      node swagger/swagger.js
 *
 *      Swagger UI:
 *      http://localhost:3000/api-docs
 *
 *      Visualizzazione delle dipendenze installate:
 *      npm list (o guardare dentro package.json)
 *
 *      Arresto del server o di uno script:
 *      Ctrl + C -> S
 *
 * Comando da eseguire nella cartella principale:
 *      Visualizzazione completa di cartelle e file:
 *      tree /F > struttura.txt
 */