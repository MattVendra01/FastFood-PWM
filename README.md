# FastFood — Piattaforma web full-stack

FastFood è un progetto universitario individuale sviluppato per il corso di **Programmazione Web e Mobile** presso l'**Università degli Studi di Milano**. È un'applicazione web full-stack che simula un servizio di ordinazione di cibo da più ristoranti, con funzionalità distinte per **clienti** e **ristoratori**.

Il progetto comprende lo sviluppo di API REST, la gestione di un database NoSQL, l'autenticazione e l'autorizzazione basata sui ruoli, oltre all'integrazione tra un frontend JavaScript e un backend Node.js.

> **Progetto esclusivamente didattico.** FastFood non è un servizio pronto per l'utilizzo in produzione. Gli ordini e i pagamenti sono simulati: non inserire dati di carte di pagamento reali o altre informazioni personali sensibili.

## Funzionalità

**Clienti**
- Registrazione, accesso e gestione del profilo.
- Ricerca di ristoranti e consultazione dei menu, con filtri e paginazione.
- Aggiunta di piatti al carrello e creazione di ordini simulati.
- Consultazione dello storico degli ordini.

**Ristoratori**
- Creazione e gestione del proprio ristorante.
- Aggiunta di piatti dal catalogo condiviso oppure creazione di nuovi piatti.
- Modifica dei piatti, dei prezzi e della disponibilità.
- Consultazione degli ordini ricevuti, aggiornamento del loro stato e visualizzazione di statistiche di base.

**Funzionalità trasversali**
- API REST per utenti, ristoranti, catalogo, piatti e ordini.
- Autenticazione JWT e controlli di autorizzazione in base al ruolo.
- Hashing delle password con `bcryptjs`.
- Documentazione delle API tramite Swagger UI.
- Interfaccia responsive realizzata con Bootstrap.

## Tecnologie utilizzate

| Componente | Tecnologie |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript, Bootstrap 5.3.3 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Autenticazione | JSON Web Token (JWT), bcryptjs |
| Documentazione API | Swagger / OpenAPI |
| Sviluppo | npm, nodemon |

## Architettura

```text
Browser (HTML / CSS / JavaScript)
          |
          | Richieste HTTP / JSON
          v
API REST con Node.js ed Express
          |
          | Modelli Mongoose
          v
        MongoDB
```

Il backend è organizzato in **rotte**, **controller**, **modelli** e **middleware**. Il frontend comunica con le API attraverso il file condiviso `frontend/js/api.js`. Il carrello viene gestito nel `localStorage` del browser.

## Struttura del progetto

```text
FastFood-PWM/
├── backend/
│   ├── app.js
│   ├── configurazione/       # Connessione al database
│   ├── controllori/          # Logica applicativa
│   ├── dati/
│   │   └── importaMeals.js   # Script di importazione del catalogo
│   ├── middleware/           # Autenticazione, autorizzazione ed errori
│   ├── modelli/              # Schemi Mongoose
│   ├── rotte/                # Endpoint REST
│   ├── swagger/              # Documentazione API
│   ├── .env.example          # Esempio di configurazione
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── index.html
│   ├── css/stile.css
│   ├── immagini/favicon.svg
│   ├── js/
│   └── pagine/
├── .gitignore
└── README.md
```

## Avvio in locale

### Requisiti

- **Node.js 20.19.0 o successivo**, richiesto dalla versione di Mongoose utilizzata.
- npm.
- Un'istanza MongoDB locale oppure un database MongoDB Atlas a cui si è autorizzati ad accedere.
- Un server locale per i file statici del frontend, ad esempio l'estensione **Live Server** di VS Code.

### 1. Installare le dipendenze del backend

```bash
cd backend
npm install
```

### 2. Configurare le variabili d'ambiente

Creare il file `backend/.env` prendendo come riferimento `backend/.env.example`, con valori equivalenti ai seguenti:

```dotenv
MONGO_URI=stringa_di_connessione_al_proprio_database
JWT_SECRET=una_chiave_segreta_lunga_e_casuale
PORTA=3000
```

Utilizzare esclusivamente credenziali e chiavi proprie. **Non pubblicare mai il file `.env` né credenziali reali.**

### 3. Avviare il backend

Dalla cartella `backend/`:

```bash
npm run dev
```

In alternativa, è possibile utilizzare `npm start`. Con la configurazione predefinita, le API sono disponibili all'indirizzo `http://localhost:3000/api` e la documentazione Swagger all'indirizzo `http://localhost:3000/api-docs`.

### 4. Aprire il frontend

Avviare un server locale per la cartella `frontend/` e aprire `index.html` nel browser. Il frontend utilizza l'indirizzo `http://localhost:3000/api`, configurato in `frontend/js/api.js`: se il backend viene avviato su un altro indirizzo o porta, occorre aggiornare tale riferimento.

**Nota:** il repository non contiene il dataset originale del catalogo fornito durante il corso universitario. Di conseguenza, su un database nuovo il catalogo non sarà già popolato. È comunque possibile esplorare l'applicazione e creare piatti direttamente per un ristorante; le funzioni basate sul catalogo richiedono dati compatibili importati separatamente.

## Dataset del catalogo (facoltativo)

Il progetto originale utilizzava il file `backend/dati/meals.json`, fornito attraverso il materiale del corso. Il file **non viene redistribuito**, poiché non sono state verificate le autorizzazioni per la sua pubblicazione.

Se si dispone di un dataset compatibile che si è autorizzati a utilizzare, salvarlo nel percorso:

```text
backend/dati/meals.json
```

Lo script di importazione prevede un array JSON di piatti con campi come `idMeal`, `strMeal`, `strCategory`, `strArea`, `strInstructions`, `ingredients`, `measures` e `strMealThumb`.

Per eseguire l'importazione, dalla cartella `backend/`:

```bash
node dati/importaMeals.js
```

Non pubblicare il dataset originale senza un'autorizzazione alla redistribuzione.

## Immagini predefinite

Nel progetto originale erano presenti due immagini di fallback scaricate da Internet. **Non sono incluse nel repository**, perché le rispettive licenze di riutilizzo non sono state verificate.

Per ripristinarle, aggiungere immagini proprie o con licenza adeguata nella cartella `frontend/immagini/`, usando esattamente questi nomi:

- `piatto-default.jpg` — immagine predefinita per i piatti.
- `ristorante-default.jpg` — immagine predefinita per i ristoranti.

Il JavaScript fa già riferimento a questi nomi, quindi non è necessario modificare il codice se vengono rispettati nomi e percorsi. In assenza dei file, le immagini predefinite potrebbero non essere visualizzate correttamente.

Il file `favicon.svg` è stato creato per il progetto ed è incluso nel repository.

## Sicurezza e limitazioni

- **Pagamenti simulati:** l'implementazione didattica comprende campi per numero di carta, scadenza e CVV. Non è conforme ai requisiti PCI DSS e **non deve essere utilizzata con dati di pagamento reali**.
- **Applicazione non pronta per la produzione:** prima di un'eventuale distribuzione pubblica sarebbero necessari ulteriori interventi su sicurezza, validazione degli input, protezione da XSS e gestione dei dati sensibili.
- **JWT e localStorage:** il frontend memorizza informazioni di autenticazione nel browser, secondo le scelte adottate per il progetto universitario.
- **Nessuna demo online:** il repository contiene il codice sorgente, ma non offre un'istanza pubblica già in esecuzione.
- **Risorse esterne:** Bootstrap viene caricato tramite CDN; le immagini indicate dagli utenti o dai dataset possono utilizzare URL esterni.

## Contesto universitario

**Progetto:** FastFood — Piattaforma web full-stack  
**Corso:** Programmazione Web e Mobile  
**Università:** Università degli Studi di Milano  
**Autore:** Mattia Vendrametto  
**Anno:** 2026

## Licenza e contenuti di terze parti

Il repository non concede diritti di riutilizzo su dataset, fotografie o altri contenuti appartenenti a terzi. Il dataset originale del corso e le due immagini predefinite di provenienza non verificata sono esclusi.

Il codice originale del progetto è distribuito sotto **licenza MIT**. Consulta il file [LICENSE](LICENSE) per il testo completo e le condizioni di utilizzo. La licenza non si estende ai contenuti di terze parti, per i quali restano validi i rispettivi diritti.
