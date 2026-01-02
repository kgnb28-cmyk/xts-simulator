require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // [NEW] Security
const jwt = require('jsonwebtoken'); // [NEW] Tokens
const User = require('./models/User'); // [NEW] Import the new User Schema

const app = express();
app.use(cors());
app.use(express.json()); 

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "*",  // Allows Vercel, Localhost, etc.
    methods: ["GET", "POST"] 
  }
});

// --- CONFIGURATION ---
const MONGO_URI = "mongodb+srv://admin:admin1234@xts-simulator.jkqp24o.mongodb.net/?appName=XTS-Simulator"; 
const JWT_SECRET = "xts_secret_key_123"; // In production, use process.env.JWT_SECRET

// --- 1. DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 2. AUTHENTICATION ROUTES (Phase 16) ---

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check for duplicates
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: "User ID or Email already exists" });

        // Encrypt Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User (Default Funds = 50L)
        const newUser = new User({
            username: username.toUpperCase(),
            email,
            password: hashedPassword,
            funds: { available: 5000000, usedMargin: 0 } // Initialize funds
        });

        await newUser.save();
        res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

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
        res.status(500).json({ error: "Login failed" });
    }
});

// --- 3. CORE API ENDPOINTS ---

// Load User Data (Updated to use 'username' from new Schema)
app.get('/api/user/:id', async (req, res) => {
  try {
    // Note: In new system, we rely on Login to get initial data, 
    // but this endpoint helps if we reload the page and fetch by ID.
    const user = await User.findOne({ username: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save User Data (Trading State)
app.post('/api/user/save', async (req, res) => {
  const { userId, funds, orders, logs } = req.body;
  try {
    // We update based on 'username' now
    await User.findOneAndUpdate(
        { username: userId }, 
        { funds, orders, logs }, 
        { new: true }
    );
    
    // Notify Admin Real-Time
    io.emit('admin-update', { userId, funds, activeOrders: orders.length });
    res.json({ status: 'Saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Data Fetch
app.get('/api/admin/users', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, 'username funds orders logs role email');
    // Map 'username' to 'userId' for frontend compatibility
    const formattedUsers = users.map(u => ({
        ...u._doc,
        userId: u.username 
    }));
    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. MARKET ENGINE ---
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
  // console.log('Client Connected:', socket.id); // Optional log
  socket.emit('market-tick', marketData);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`XTS Backend (DB + Socket + Auth) running on Port ${PORT}`);
});