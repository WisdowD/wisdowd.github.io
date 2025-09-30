import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import usuarioRoutes from "./routes/usuario.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Rota específica para o manifest.json
app.get('./manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Rota específica para o service-worker.js
app.get('./service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'service-worker.js'));
});

app.use(bodyParser.json());

// Servir arquivos estáticos da pasta /public
app.use(express.static(path.join(__dirname, "public")));

// Rotas de API
app.use("/api", usuarioRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

