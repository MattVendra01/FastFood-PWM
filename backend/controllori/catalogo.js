/*
 * ============================================================
 * IMPORTAZIONE DEL MODELLO E DEL MIDDLEWARE
 * ============================================================
 */
const Catalogo = require("../modelli/Catalogo"); // Modello Mongoose del catalogo
const gestioneAsincrona = require("../middleware/gestioneAsincrona"); // Gestisce errori async

/*
 * ============================================================
 * ELENCO DEL CATALOGO
 * ============================================================
 */
const elencoCatalogo = gestioneAsincrona(async (req, res) => {
    const { nome, categoria, ingrediente, allergene } = req.query; // Legge i filtri dalla query URL
    const filtro = {}; // Costruisce dinamicamente la query MongoDB

    if (nome) {
        filtro.nome = { $regex: nome, $options: "i" }; // Ricerca parziale, ignora maiuscole
    }

    if (categoria) {
        filtro.categoria = { $regex: categoria, $options: "i" }; // Filtra per categoria
    }

    if (ingrediente) {
        filtro.ingredienti = { $regex: ingrediente, $options: "i" }; // Cerca nell'array degli ingredienti
    }

    if (allergene) {
        filtro.allergeni = { $regex: allergene, $options: "i" }; // Cerca nell'array degli allergeni
    }

    const piattiCatalogo = await Catalogo.find(filtro); // Cerca i piatti che rispettano i filtri

    return res.status(200).json(piattiCatalogo); // Restituisce i risultati al frontend
});

/*
 * ============================================================
 * DETTAGLIO DEL PIATTO
 * ============================================================
 */
const dettaglioCatalogo = gestioneAsincrona(async (req, res) => {
    const piattoCatalogo = await Catalogo.findById(req.params.id); // Cerca il piatto tramite ID nell'URL

    if (!piattoCatalogo) {
        return res.status(404).json({ // 404 se il piatto non esiste
            messaggio: "Piatto del catalogo non trovato"
        });
    }

    return res.status(200).json(piattoCatalogo); // Restituisce il piatto trovato
});

/*
 * ============================================================
 * ESPORTAZIONE FUNZIONI
 * ============================================================
 */
module.exports = { elencoCatalogo, dettaglioCatalogo }; // Esporta i controller alle rotte