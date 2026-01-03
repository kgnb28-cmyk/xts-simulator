require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// --- 1. ROBUST CORS (The "VIP List" for your Frontend) ---
app.use(cors({
  origin: "*", // Allows connections from anywhere (Vercel, localhost, etc.)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); 

const server = http.createServer(app);

// --- 2. SOCKET.IO CORS ---
const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  }
});

// --- CONFIGURATION ---
const MONGO_URI = "mongodb+srv://admin:admin1234@xts-simulator.jkqp24o.mongodb.net/?appName=XTS-Simulator"; 
const JWT_SECRET = "xts_secret_key_123"; 

// --- 3. DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 4. DEBUG MIDDLEWARE (Logs every request) ---
app.use((req, res, next) => {
  console.log(`📩 Request received: ${req.method} ${req.path}`);
  next();
});

// --- 5. AUTHENTICATION ROUTES ---

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    console.log("📝 Register Attempt:", req.body); // Log the data coming in
    try {
        const { username, email, password } = req.body;
        
        // Check for duplicates
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log("⚠️ Register Failed: User exists");
            return res.status(400).json({ error: "User ID or Email already exists" });
        }

        // Encrypt Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            username: username.toUpperCase(),
            email,
            password: hashedPassword,
            funds: { available: 5000000, usedMargin: 0 } 
        });

        await newUser.save();
        console.log("✅ User Registered:", username);
        res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        console.error("❌ Registration Error:", err); // PRINT THE ERROR!
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    console.log("🔑 Login Attempt:", req.body.email);
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        console.log("✅ Login Successful:", user.username);
        res.json({ 
            token, 
            user: { 
                username: user.username, 
                role: user.role,
                funds: user.funds,
                orders: user.orders
            } 
        });
    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

// --- CORE API ENDPOINTS ---
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/save', async (req, res) => {
  const { userId, funds, orders, logs } = req.body;
  try {
    await User.findOneAndUpdate(
        { username: userId }, 
        { funds, orders, logs }, 
        { new: true }
    );
    io.emit('admin-update', { userId, funds, activeOrders: orders.length });
    res.json({ status: 'Saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MARKET ENGINE MOCK ---
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

// --- 6. CRITICAL PORT FIX ---
const PORT = process.env.PORT || 5000; // Use Render's port, or 5000 if local
server.listen(PORT, () => {
  console.log(`🚀 XTS Backend Running on Port ${PORT}`);
});