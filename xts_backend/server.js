require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json()); // Allow JSON data in POST requests

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

// --- 1. DATABASE CONNECTION ---
// Using the connection string you provided
const MONGO_URI = "mongodb+srv://admin:admin1234@xts-simulator.jkqp24o.mongodb.net/?appName=XTS-Simulator"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 2. USER SCHEMA (Scalable Data Model) ---
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  funds: {
    opening: Number,
    payin: Number,
    payout: Number,
    usedMargin: Number,
    realizedMtm: Number,
    unrealizedMtm: Number,
    available: Number
  },
  orders: Array, // Stores the full order history
  logs: Array    // Stores notification logs
});

const User = mongoose.model('User', userSchema);

// --- 3. API ENDPOINTS (The Bridge) ---

// Load User Data (Call this when App opens)
app.get('/api/user/:id', async (req, res) => {
  try {
    let user = await User.findOne({ userId: req.params.id });
    if (!user) {
      // Create new user if not exists (Default 50L)
      user = await User.create({
        userId: req.params.id,
        funds: { opening: 5000000, payin: 0, payout: 0, usedMargin: 0, realizedMtm: 0, unrealizedMtm: 0, available: 5000000 },
        orders: [],
        logs: []
      });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save User Data (Call this on every trade/update)
app.post('/api/user/save', async (req, res) => {
  const { userId, funds, orders, logs } = req.body;
  try {
    await User.findOneAndUpdate({ userId }, { funds, orders, logs }, { upsert: true });
    // Notify Admin (Future Proofing)
    io.emit('admin-update', { userId, funds, activeOrders: orders.length });
    res.json({ status: 'Saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NEW: ADMIN API (For God Mode) ---
app.get('/api/admin/users', async (req, res) => {
  try {
    // Fetch all users, return specific fields for the table
    const users = await User.find({}, 'userId funds orders logs');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. MARKET ENGINE (Existing Code) ---
let marketData = [
  { id: 1, exchange: 'BSEFO', token: '1158569', ul: 'SENSEX', symbol: 'SENSEX', instr: 'IO', series: 'IO', expiry: '01Jan2026', strike: '84900.00', type: 'CE', bQty: 340, bPrice: 235.15, sPrice: 235.60, sQty: 200, ltp: 235.50, change: -48.79, atp: 290.27, open: 480.00, high: 498.90, low: 201.50, prev: 459.85, vol: 8462440 },
  { id: 2, exchange: 'NSEFO', token: '143955', ul: 'RELIANCE', symbol: 'RELIANCE', instr: 'OPTSTK', series: 'OPTSTK', expiry: '30Dec2025', strike: '1540.00', type: 'CE', bQty: 1500, bPrice: 8.55, sPrice: 8.65, sQty: 1000, ltp: 8.60, change: -56.57, atp: 11.39, open: 14.80, high: 18.35, low: 7.75, prev: 19.80, vol: 2236500 },
  { id: 3, exchange: 'NSEFO', token: '51475', ul: 'Nifty Bank', symbol: 'BANKNIFTY', instr: 'OPTIDX', series: 'OPTIDX', expiry: '30Dec2025', strike: '59500.00', type: 'CE', bQty: 1365, bPrice: 17.00, sPrice: 17.10, sQty: 2835, ltp: 17.00, change: -57.76, atp: 16.83, open: 34.90, high: 35.50, low: 10.20, prev: 40.25, vol: 15679615 },
];

setInterval(() => {
  marketData = marketData.map(item => {
    const move = (Math.random() - 0.5) * 0.5;
    let newLtp = parseFloat((item.ltp + move).toFixed(2));
    if (newLtp <= 0) newLtp = 0.05;
    const changeVal = newLtp - item.prev;
    const changePct = ((changeVal / item.prev) * 100).toFixed(2);
    return { ...item, ltp: newLtp, change: changePct, bPrice: (newLtp - 0.05).toFixed(2), sPrice: (newLtp + 0.05).toFixed(2) };
  });
  io.emit('market-tick', marketData);
}, 500);

io.on('connection', (socket) => {
  console.log('Client Connected:', socket.id);
  socket.emit('market-tick', marketData);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`XTS Backend (DB + Socket) running on Port ${PORT}`);
});