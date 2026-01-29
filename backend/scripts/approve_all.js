const mongoose = require("mongoose");
const path = require("path");
const Institution = require("../src/models/Institution");


require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error(" MONGODB_URI is missing in .env file");
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log(" MongoDB Connected");
    } catch (err) {
        console.error(" Connection Error:", err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    try {
        const institutions = await Institution.find({});
        console.log(`Found ${institutions.length} institutions.`);

        if (institutions.length === 0) {
            console.log("⚠️ No institutions found in the database.");
        }

        for (const inst of institutions) {
            console.log(`- ${inst.name} (${inst.shortCode}): Approved=${inst.isApproved}`);
            if (!inst.isApproved) {
                inst.isApproved = true;
                await inst.save();
                console.log(`  -> Marked APPROVED `);
            } else {
                console.log(`  -> Already Approved`);
            }
        }
    } catch (err) {
        console.error("Error updating institutions:", err);
    }

    process.exit();
};

run();
