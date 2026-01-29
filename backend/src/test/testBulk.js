const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

async function runTest() {
    try {
        console.log("1. Registering Institution...");
        const unique = Date.now();
        const email = `inst_${unique}@university.edu`;
        const password = "Password123!";

        try {
            await axios.post(`${BASE_URL}/institution/register`, {
                name: "Test University",
                email: email,
                password: password,
                address: "123 Test St",
                website: "https://test.edu",
                shortCode: `TU${unique}`
            });
        } catch (e) {
            console.log("Registration might have failed if already exists (shouldn't happen with unique email)");
        }

        
        
        
        

        
        

        console.log("2. Logging in...");
        const loginRes = await axios.post(`${BASE_URL}/institution/login`, {
            email: email,
            password: password
        });

        
        
        
        

        
        
        

        console.log("Login passed? No, likely waiting approval.");
    } catch (err) {
        console.error("Test blocked:", err.response?.data || err.message);
    }
}





const mongoose = require('mongoose');
const Institution = require('../models/Institution');
const { bulkIssueCertificates } = require('../controllers/certificateController');


const mockReq = (body, files, user) => ({
    body,
    files,
    user,
    protocol: 'http',
    get: () => 'localhost:5000'
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};


require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function directTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        
        let inst = await Institution.findOne({ email: 'test_bulk@uni.edu' });
        if (!inst) {
            inst = await Institution.create({
                name: "Bulk Test Uni",
                email: "test_bulk@uni.edu",
                emailDomain: "uni.edu",
                passwordHash: "hash",
                address: "123 St",
                website: "web.com",
                shortCode: "BULK",
                isApproved: true,
                isProfileComplete: true,
                isRejected: false
            });
            console.log("Created Test Institution");
        } else {
            inst.isApproved = true;
            await inst.save();
            console.log("Reset Test Institution approval");
        }

        
        const file1 = path.join(__dirname, 'cert1.pdf');
        const file2 = path.join(__dirname, 'cert2.pdf');
        fs.writeFileSync(file1, 'dummy content');
        fs.writeFileSync(file2, 'dummy content');

        
        
        const files = [
            { path: file1, originalname: 'cert1.pdf', mimetype: 'application/pdf', filename: 'cert1.pdf' },
            { path: file2, originalname: 'cert2.pdf', mimetype: 'application/pdf', filename: 'cert2.pdf' }
        ];

        const req = mockReq(
            {
                courseName: "B.Tech",
                branch: "CS",
                passOutYear: 2025,
                studentNames: ["Test Student 1", "Test Student 2"], 
                
                
                
                rollNumbers: ["101", "102"]
            },
            files,
            { id: inst._id }
        );

        const res = mockRes();

        console.log("Calling bulkIssueCertificates...");
        await bulkIssueCertificates(req, res);

        console.log("Status:", res.statusCode);
        console.log("Data:", JSON.stringify(res.data, null, 2));

        
        fs.unlinkSync(file1);
        fs.unlinkSync(file2);
        await mongoose.disconnect();

    } catch (err) {
        console.error("Direct Test Error:", err.stack || err);
        if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    }
}

directTest();
