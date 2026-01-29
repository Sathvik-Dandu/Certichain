const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function test() {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully!");
        await mongoose.disconnect();
    } catch (e) {
        console.log("Connection failed:", e.message);
        console.log(e.stack);
    }
}
test();
