require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const nanoid = require('nanoid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Modelo de URL
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
});

const URL = mongoose.model('URL', urlSchema);

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB conectado!"))
    .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

// Endpoint para encurtar URLs
app.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortId = nanoid.nanoid(7);

    try {
        const newUrl = await URL.create({ originalUrl, shortId });
        res.json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });
    } catch (error) {
        res.status(500).json({ error: "Erro ao encurtar a URL." });
    }
});

// Endpoint para redirecionar
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        const url = await URL.findOne({ shortId });
        if (url) {
            res.redirect(url.originalUrl);
        } else {
            res.status(404).json({ error: "URL não encontrada." });
        }
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar a URL." });
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
