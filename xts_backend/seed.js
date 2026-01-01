const mongoose = require('mongoose');

// PASTE YOUR MONGO CONNECTION STRING HERE (Same as server.js)
const MONGO_URI = "mongodb+srv://admin:admin1234@xts-simulator.jkqp24o.mongodb.net/?appName=XTS-Simulator"; 

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  funds: Object,
  orders: Array,
  logs: Array
});

const User = mongoose.model('User', userSchema);

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to DB");

    const defaultUser = {
      userId: "X14AD43",
      funds: { 
          opening: 5000000, 
          payin: 0, 
          payout: 0, 
          usedMargin: 0, 
          realizedMtm: 0, 
          unrealizedMtm: 0, 
          available: 5000000 
      },
      orders: [],
      logs: [{ time: new Date().toLocaleTimeString(), msg: "Account Initialized via Seed Script" }]
    };

    // Delete existing if any, then insert
    await User.deleteOne({ userId: "X14AD43" });
    await User.create(defaultUser);

    console.log("🎉 Database Seeded Successfully! User X14AD43 created.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDB();