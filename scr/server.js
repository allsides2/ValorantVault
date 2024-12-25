// Importações necessárias
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { Pool } = require("pg"); // Usando pg para PostgreSQL

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Banco de Dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do banco configurada no Neon
  ssl: {
    rejectUnauthorized: false,
  },
});


// Teste de conexão
pool.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados.");
});

// Rota para obter clipes aleatórios
app.get("/clips", async (req, res) => {
  try {
    console.log("Buscando clipes aleatórios...");
    const query = "SELECT * FROM clips ORDER BY RANDOM() LIMIT 2";
    const { rows } = await pool.query(query);
    console.log("Clipes encontrados:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar clipes:", err);
    res.status(500).json({ message: "Erro ao buscar clipes.", error: err });
  }
});

// Rota para registrar votos
app.post("/vote", async (req, res) => {
  const { clipId } = req.body;
  if (!clipId) {
    return res.status(400).json({ message: "ID do clipe é necessário." });
  }

  try {
    const updateQuery = "UPDATE clips SET times_chosen = times_chosen + 1, times_competed = times_competed + 1 WHERE id = $1";
    await pool.query(updateQuery, [clipId]);
    res.json({ message: "Voto registrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar voto:", err);
    res.status(500).json({ message: "Erro ao registrar voto.", error: err });
  }
});

// Rota para registrar denúncias
app.post("/report", async (req, res) => {
  const { clipId } = req.body;
  if (!clipId) {
    return res.status(400).json({ message: "ID do clipe é necessário." });
  }

  try {
    const reportQuery = "UPDATE clips SET reports = reports + 1 WHERE id = $1";
    await pool.query(reportQuery, [clipId]);
    res.json({ message: "Denúncia registrada com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar denúncia:", err);
    res.status(500).json({ message: "Erro ao registrar denúncia.", error: err });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Exportar o app para o Vercel
module.exports = app;