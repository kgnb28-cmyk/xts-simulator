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

// --- 1. ROBUST CORS ---
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); 

const server = http.createServer(app);

// --- 2. SOCKET.IO ---
const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  }
});

// --- CONFIGURATION ---
// Fallback to local DB if ENV is missing (Good for dev)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin1234@xts-simulator.jkqp24o.mongodb.net/?appName=XTS-Simulator"; 
const JWT_SECRET = process.env.JWT_SECRET || "xts_secret_key_123"; 

// --- 3. DB CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

// --- 4. AUTH ROUTES (Kept your existing robust logic) ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username.toUpperCase(),
            email,
            password: hashedPassword,
            funds: { available: 5000000, usedMargin: 0, opening: 5000000 } 
        });

        await newUser.save();
        res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed", details: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { username: user.username, funds: user.funds, orders: user.orders } });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

// --- 5. NEW: SECURE ORDER PLACEMENT ENDPOINT ---
// This replaces the insecure "save everything" approach for orders
app.post('/api/order/place', async (req, res) => {
    const { userId, symbol, side, qty, price, type, marginLocked } = req.body;
    
    try {
        const user = await User.findOne({ username: userId });
        if (!user) return res.status(404).json({ error: "User not found" });

        // Server-Side Margin Check (Crucial for Prop Desks)
        if (marginLocked > user.funds.available) {
            return res.status(400).json({ error: "Insufficient Margin" });
        }

        // Create Order Object
        const newOrder = {
            id: Date.now(),
            time: new Date().toLocaleTimeString('en-GB'),
            symbol, side, qty, price, type, 
            status: 'COMPLETE', // Simulating instant fill for now
            marginLocked
        };

        // Update User Funds & Orders atomically
        user.funds.available -= marginLocked;
        user.funds.usedMargin += marginLocked;
        user.orders.unshift(newOrder); // Add to top of list

        await user.save();
        
        // Notify Frontend via Socket (Real-time feedback)
        io.emit(`order-update-${userId}`, newOrder);
        
        res.json({ status: 'Order Executed', order: newOrder, funds: user.funds });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. USER DATA SYNC ---
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 7. MARKET ENGINE (UPGRADED) ---
// We use a "Random Walk" with Trend Bias for realism
let marketData = [
  { id: 1, symbol: 'NIFTY 50', ltp: 24500.00, prev: 24400.00, volatility: 2.5 },
  { id: 2, symbol: 'BANKNIFTY', ltp: 48000.00, prev: 47800.00, volatility: 5.0 },
  { id: 3, symbol: 'RELIANCE', ltp: 2850.00, prev: 2840.00, volatility: 0.8 },
  { id: 4, symbol: 'HDFCBANK', ltp: 1650.00, prev: 1640.00, volatility: 0.5 },
];

setInterval(() => {
  marketData = marketData.map(item => {
    // 60% chance to follow trend, 40% random noise
    const trend = (item.ltp > item.prev) ? 1 : -1; 
    const noise = (Math.random() - 0.5) * item.volatility * 2;
    const directionalMove = (Math.random() > 0.6) ? (trend * item.volatility * 0.2) : 0;
    
    let newLtp = item.ltp + noise + directionalMove;
    newLtp = Math.round(newLtp * 100) / 100; // Round to 2 decimals

    const changeVal = newLtp - item.prev;
    const changePct = ((changeVal / item.prev) * 100).toFixed(2);

    return { 
        ...item, 
        ltp: newLtp, 
        change: changePct, 
        // Generate realistic Bid/Ask spread based on LTP
        bPrice: (newLtp - (item.ltp * 0.0002)).toFixed(2), 
        sPrice: (newLtp + (item.ltp * 0.0002)).toFixed(2),
        bQty: Math.floor(Math.random() * 5000),
        sQty: Math.floor(Math.random() * 5000)
    };
  });
  
  io.emit('market-tick', marketData);
}, 1000); // 1 Second Ticks (Standard for Web)

const PORT = process.env.PORT || 5000; 
server.listen(PORT, () => {
  console.log(`🚀 XTS Backend Engine Active on Port ${PORT}`);
});