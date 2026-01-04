const mongoose = require('mongoose');

// --- 1. EMBEDDED ORDER SCHEMA ---
// This ensures every trade saved has the correct structure
const OrderSchema = new mongoose.Schema({
  id: { type: String },
  time: { type: String },
  symbol: { type: String },
  side: { type: String, enum: ['BUY', 'SELL'] },
  qty: { type: Number },
  price: { type: Number },
  trigPrice: { type: Number }, // Critical for Stop Loss orders
  type: { type: String },      // MKT, LMT, SL-M
  status: { type: String },    // OPEN, COMPLETE, CANCELLED
  marginLocked: { type: Number, default: 0 }
}, { _id: false }); // Prevents creating a unique ID for every single order sub-document

const userSchema = new mongoose.Schema({
  // --- IDENTITY ---
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, 
  
  // --- ROLE & ACCESS ---
  // 'USER' = Standard Student, 'ADMIN' = Instructor/You
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },

  // --- BUSINESS LOGIC (Preserved) ---
  isPaid: { type: Boolean, default: false },
  planType: { type: String, default: 'FREE' }, // 'FREE', 'PRO', 'ACADEMY'

  // --- BROKER INTEGRATION (Preserved) ---
  broker: {
    name: { type: String, default: null }, // 'UPSTOX', 'SHOONYA'
    accessToken: { type: String, default: null },
    lastLogin: { type: Date, default: null }
  },

  // --- PROPRIETARY TRADING SIMULATOR DATA ---
  // Expanded to match the Frontend 'Funds' component exactly
  funds: { 
    opening: { type: Number, default: 5000000 },
    payin: { type: Number, default: 0 },
    payout: { type: Number, default: 0 },
    usedMargin: { type: Number, default: 0 },
    realizedMtm: { type: Number, default: 0 },
    unrealizedMtm: { type: Number, default: 0 },
    available: { type: Number, default: 5000000 }
  },

  // Structured Trading History
  orders: [OrderSchema],
  
  // System Logs (for user activity tracking)
  logs: [{ 
    time: String, 
    msg: String 
  }]
  
}, { timestamps: true }); // Auto-manages createdAt and updatedAt

module.exports = mongoose.model('User', userSchema);