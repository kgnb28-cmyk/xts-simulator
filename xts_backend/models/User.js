const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Identity
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // This will be encrypted
  
  // Role for Admin Access
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },

  // Business Logic
  isPaid: { type: Boolean, default: false },
  planType: { type: String, default: 'FREE' }, // 'FREE', 'PRO', 'ACADEMY'

  // Broker Integration (Bring Your Own Broker)
  broker: {
    name: { type: String, default: null }, // 'UPSTOX', 'SHOONYA'
    accessToken: { type: String, default: null },
    lastLogin: { type: Date, default: null }
  },

  // Trading Data (Persisted)
  funds: { 
    available: { type: Number, default: 5000000 },
    usedMargin: { type: Number, default: 0 }
  },
  orders: { type: Array, default: [] },
  logs: { type: Array, default: [] },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);