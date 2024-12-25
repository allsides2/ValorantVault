const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Banco de Dados
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "clips_db",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    process.exit(1);
  }
  console.log("Conectado ao banco de dados.");
});

// Rota para servir o arquivo HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rota para obter clipes aleatórios
app.get("/clips", (req, res) => {
  const query = "SELECT * FROM clips ORDER BY RAND() LIMIT 2";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao buscar clipes.", error: err });
    }
    res.json(results);
  });
});

// Rota para registrar votos
app.post("/vote", (req, res) => {
  const { clipId } = req.body;
  if (!clipId) {
    return res.status(400).json({ message: "ID do clipe é necessário." });
  }

  const updateQuery = "UPDATE clips SET times_chosen = times_chosen + 1, times_competed = times_competed + 1 WHERE id = ?";
  db.query(updateQuery, [clipId], (err) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao registrar voto.", error: err });
    }
    res.json({ message: "Voto registrado com sucesso!" });
  });
});

// Rota para registrar denúncias
app.post("/report", (req, res) => {
  const { clipId } = req.body;
  if (!clipId) {
    return res.status(400).json({ message: "ID do clipe é necessário." });
  }

  const reportQuery = "UPDATE clips SET reports = reports + 1 WHERE id = ?";
  db.query(reportQuery, [clipId], (err) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao registrar denúncia.", error: err });
    }
    res.json({ message: "Denúncia registrada com sucesso!" });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
