/*
 * ============================================================
 * CARICAMENTO DELLE VARIABILI D'AMBIENTE
 * ============================================================
 */
require("dotenv").config(); // Carica le variabili definite nel file .env

/*
 * ============================================================
 * IMPORTAZIONE DELLE LIBRERIE
 * ============================================================
 */
const mongoose = require("mongoose"); // Libreria ODM per MongoDB

/*
 * ============================================================
 * IMPORTAZIONE DELLA CONFIGURAZIONE
 * ============================================================
 */
const collegaDatabase = require("../configurazione/database"); // Funzione di connessione a MongoDB

/*
 * ============================================================
 * IMPORTAZIONE DEL MODELLO E DEI DATI
 * ============================================================
 */
const Catalogo = require("../modelli/Catalogo"); // Modello Mongoose del catalogo
const meals = require("./meals.json"); // Carica l'array di piatti dal file JSON

/*
 * ============================================================
 * IMPORTAZIONE DEI PIATTI NEL CATALOGO
 * ============================================================
 */
const importaMeals = async () => {
    try {
        await collegaDatabase(); // Attende la connessione al database

        console.log("Connessione a MongoDB riuscita");

        let piattiImportati = 0; // Contatore dei nuovi piatti inseriti
        let piattiSaltati = 0; // Contatore dei piatti già presenti

        for (const meal of meals) { // Scorre tutti i piatti del file JSON
            const piattoEsistente = await Catalogo.exists({
                idMeal: meal.idMeal // Controlla l'esistenza tramite ID originale
            });

            if (piattoEsistente) {
                piattiSaltati++; // Incrementa il numero dei duplicati
                continue; // Salta il piatto e passa al successivo
            }

            await Catalogo.create({ // Crea e salva il piatto nel catalogo MongoDB
                idMeal: meal.idMeal,
                nome: meal.strMeal,
                categoria: meal.strCategory || "Altro", // Valore di default se assente
                area: meal.strArea || "",
                descrizione: meal.strInstructions || "",
                ingredienti: meal.ingredients || [],
                misure: meal.measures || [],
                allergeni: [],
                immagine: meal.strMealThumb || "",
                youtube: meal.strYoutube || "",
                fonte: meal.strSource || ""
            });

            piattiImportati++; // Incrementa il numero dei piatti importati
        }

        console.log("Importazione del catalogo completata");
        console.log(`Piatti importati: ${piattiImportati}`);
        console.log(`Piatti saltati perché già presenti: ${piattiSaltati}`);
    } catch (errore) { // Intercetta eventuali errori durante l'importazione
        console.error("Errore durante l'importazione di meals.json");
        console.error(errore);
        process.exitCode = 1; // Segnala al sistema che lo script è terminato con errore
    } finally {
        await mongoose.disconnect(); // Chiude sempre la connessione a MongoDB
    }
};

/*
 * ============================================================
 * AVVIO DELL'IMPORTAZIONE
 * ============================================================
 */
importaMeals(); // Esegue lo script di importazione