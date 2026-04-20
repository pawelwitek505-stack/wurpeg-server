const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// =====================
// DATABASE
// =====================
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_FILE = path.join(DATA_DIR, "data.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db = {};

if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// =====================
// HOME (pokazuje grę)
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =====================
// REGISTER
// =====================
app.post("/register", (req, res) => {
  const { username, password, email } = req.body;

  if (db[username]) {
    return res.json({ ok: false, msg: "User already exists" });
  }

  db[username] = {
    username,
    password,
    email,
    level: 1,
    exp: 0,
    expToNext: 50,
    hp: 100,
    maxHp: 100,
    atk: 10,
    def: 5,
    speed: 5,
    gold: 50,
    inventory: []
  };

  saveDB();
  res.json({ ok: true });
});

// =====================
// LOGIN
// =====================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db[username];

  if (!user || user.password !== password) {
    return res.json({ ok: false });
  }

  res.json({ ok: true, user });
});

// =====================
// SAVE PROGRESS
// =====================
app.post("/save-progress", (req, res) => {
  const { username, user } = req.body;

  if (!db[username]) {
    return res.json({ ok: false });
  }

  db[username] = {
    ...db[username],
    ...user
  };

  saveDB();

  res.json({ ok: true });
});

// =====================
// RANKING
// =====================
app.get("/ranking", (req, res) => {
  const players = Object.entries(db).map(([username, user]) => ({
    username,
    level: user.level || 1
  }));

  res.json({ ok: true, players });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});