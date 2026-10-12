/*
 * ============================================================
 * IMPORTAZIONE DI SWAGGER AUTOGEN
 * ============================================================
 */
const swaggerAutogen = require("swagger-autogen")({openapi: "3.0.0"});

/*
 * ============================================================
 * CONFIGURAZIONE DELLA DOCUMENTAZIONE
 * ============================================================
 */
const documentazione = {
    info: {
        title: "FastFood API",
        description: "Swagger delle API dell'applicazione FastFood"
    },
    host: "localhost:3000"
};

/*
 * ============================================================
 * PERCORSI DEI FILE
 * ============================================================
 */
const fileOutput = "./swagger/swagger.json";
const fileEndpoint = ["./app.js"];

/*
 * ============================================================
 * GENERAZIONE DELLA DOCUMENTAZIONE
 * ============================================================
 */
swaggerAutogen(fileOutput, fileEndpoint, documentazione);