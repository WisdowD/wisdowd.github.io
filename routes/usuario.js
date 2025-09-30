// routes/usuario.js
import bcrypt from "bcrypt"
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para simular __dirname e __filename em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Define o caminho para a pasta 'data'
const DATA_DIR = path.join(__dirname, "../data");
// Define o caminho completo para o arquivo de usuários
const DATA_PATH = path.join(DATA_DIR, "usuarios.json");

// Helpers
function loadUsuarios() {
    // Garante que a pasta 'data' exista
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true }); // Cria a pasta recursivamente se não existir
        console.log(`Pasta 'data' criada em: ${DATA_DIR}`);
    }

    // Garante que o arquivo 'usuarios.json' exista e não esteja vazio
    if (!fs.existsSync(DATA_PATH) || fs.readFileSync(DATA_PATH).toString().trim() === '') {
        fs.writeFileSync(DATA_PATH, JSON.stringify({}, null, 2)); // Cria um arquivo JSON vazio
        console.log(`Arquivo 'usuarios.json' criado/inicializado em: ${DATA_PATH}`);
        return {}; // Retorna um objeto vazio já que o arquivo foi recém-criado
    }

    try {
        const data = fs.readFileSync(DATA_PATH);
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler ou parsear usuarios.json:", error);
        // Em caso de erro de parsing, pode ser que o arquivo esteja corrompido.
        // Retornamos um objeto vazio para permitir que o servidor continue.
        return {};
    }
}

function saveUsuarios(data) {
    // Garante que a pasta 'data' exista antes de tentar salvar
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`Usuários salvos em: ${DATA_PATH}`);
}

// GET /api/usuario/:email
router.get("/usuario/:email", (req, res) => {
    const usuarios = loadUsuarios();
    const user = usuarios[req.params.email];
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
    res.json(user);
});

// POST /api/usuario/login
router.post("/usuario/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    const usuarios = loadUsuarios();
    const usuario = usuarios[email];

    if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    bcrypt.compare(senha, usuario.senhaHash)
        .then(match => {
            if (match) {
                // Senha correta
                // Retorna dados do usuário, sem a senhaHash para segurança
                const { senhaHash, ...usuarioSemSenha } = usuario;
                res.json({ sucesso: true, usuario: usuarioSemSenha });
            } else {
                // Senha incorreta
                res.status(401).json({ erro: "Senha incorreta" });
            }
        })
        .catch(err => {
            res.status(500).json({ erro: "Erro interno no servidor" });
        });
});


// POST /api/usuario/cadastrar
router.post("/usuario/cadastrar", (req, res) => {
    const { nome, email, senha, foto, bio, cor } = req.body;
    const VezesHash = 12;

    if (!nome) return res.status(400).json({ erro: "Nome é obrigatório" });
    else if (!email) return res.status(400).json({ erro: "Email é obrigatório" });
    else if (!senha) return res.status(400).json({ erro: "Senha é obrigatória" });

    // Aplica bcrypt hash na senha repetindo o algoritmo VezesHash(12 vezes) para maior segurança
    bcrypt.hash(senha, VezesHash)
        .then(senhaHash => {
            const usuarios = loadUsuarios();
            usuarios[email] = {
                email,
                nome,
                senhaHash,
                foto: './img/avatars/peep-40.png',
                bio: 'Sou novo por aqui!',
                cor: '#00000'
            };
            saveUsuarios(usuarios);

            res.json({ sucesso: true, usuario: usuarios[email] });
        })
        .catch(error => {
            res.status(500).json({ erro: "Erro ao processar a senha" });
        });
});

// POST /api/usuario
router.post("/usuario", (req, res) => {
    const { email, nome, foto, bio, cor } = req.body;
    if (!email) return res.status(400).json({ erro: "Email é obrigatório" });

    const usuarios = loadUsuarios();
    usuarios[email] = { email, nome, foto, bio, cor };
    saveUsuarios(usuarios);

    res.json({ sucesso: true, usuario: usuarios[email] });
});

// Exporta o router usando sintaxe ES Modules
export default router;