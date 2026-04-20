const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// DATABASE (plik JSON)
// =====================
let db = {};

if (fs.existsSync("data.json")) {
  db = JSON.parse(fs.readFileSync("data.json"));
}

function saveDB() {
  fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
}

// =====================
// HOME
// =====================
app.get("/", (req, res) => {
  res.send("Działa!");
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

  res.json({
    ok: true,
    msg: "Account created (email system not active yet)"
  });
});

// =====================
// LOGIN
// =====================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db[username];

  if (!user || user.password !== password) {
    return res.json({ ok: false, msg: "Wrong login" });
  }

  res.json({
    ok: true,
    user
  });
});

// =====================
// SIMPLE PvP FIGHT
// =====================
app.post("/fight", (req, res) => {
  const { attacker, defender } = req.body;

  const a = db[attacker];
  const d = db[defender];

  if (!a || !d) {
    return res.json({ ok: false, msg: "Player not found" });
  }

  const dmgToDef = Math.max(1, a.atk - d.def + Math.floor(Math.random() * 5));
  const dmgToAtk = Math.max(1, d.atk - a.def + Math.floor(Math.random() * 5));

  d.hp -= dmgToDef;
  a.hp -= dmgToAtk;

  saveDB();

  res.json({
    ok: true,
    log: `${attacker} dealt ${dmgToDef} dmg, ${defender} dealt ${dmgToAtk}`,
    attackerHP: a.hp,
    defenderHP: d.hp
  });
});

// =====================
// SAVE PROGRESS
// =====================
app.post("/save-progress", (req, res) => {
  const { username, user } = req.body;

  if (!username || !user) {
    return res.json({ ok: false, msg: "Missing data" });
  }

  if (!db[username]) {
    return res.json({ ok: false, msg: "User not found" });
  }

  db[username] = {
    ...db[username],
    ...user
  };

  saveDB();

  res.json({
    ok: true,
    msg: "Progress saved"
  });
});


// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

// =====================
// RANKING
// =====================
app.get("/ranking", (req, res) => {
  const players = Object.entries(db).map(([username, user]) => ({
    username,
    level: user.level || 1,
    expeditions: user.expeditions || 0
  }));

  res.json({
    ok: true,
    players
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});