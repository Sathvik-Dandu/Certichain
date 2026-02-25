const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Institution = require("../models/Institution");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { sendEmail } = require("../lib/email");

const JWT_SECRET = process.env.JWT_SECRET;


const generateToken = (inst) => {
    return jwt.sign(
        { id: inst._id, role: "institution" },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};



exports.registerInstitution = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            website,
            shortCode,
            registrarName, // Added registrarName to destructuring
        } = req.body;

        if (!name || !registrarName || !email || !password || !shortCode) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const existing = await Institution.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Institution already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const emailDomain = email.split("@")[1];


        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = req.files.map((file) => `/uploads/institutions/${file.filename}`);


            try {
                const formData = new FormData();
                formData.append('institution_id', email);

                req.files.forEach((file) => {
                    formData.append('files', fs.createReadStream(file.path), file.originalname);
                });





                // NOTE: This assumes the DL service is running locally on port 8000.
                // In production, this URL should be an environment variable.
                const dlServiceUrl = process.env.DL_SERVICE_URL || 'http://localhost:8000/register-institution';

                await axios.post(dlServiceUrl, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                });
                console.log(" Files successfully forwarded to DL Service");
            } catch (dlError) {
                console.warn(" Warning: Failed to forward to DL Service (Non-critical):", dlError.message);
                // We do NOT rethrow here, so registration proceeds even if DL service is down.
            }
        }

        // Generate RSA Key Pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        const institution = await Institution.create({
            name,
            email,
            emailDomain,
            passwordHash,
            address,
            website,
            shortCode,
            registrarName, // Added registrarName to institution creation
            isApproved: false,
            isRejected: false,
            isProfileComplete: true,
            documents,
            publicKey,
            privateKey,
        });


        const token = generateToken(institution);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: "Institution registration submitted. Please complete your profile.",
            institution: {
                id: institution._id,
                name: institution.name,
                registrarName: institution.registrarName,
                email: institution.email,
                isApproved: institution.isApproved,
                isProfileComplete: false
            },
            token,
        });

    } catch (err) {
        console.error("Institution Register Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};



exports.loginInstitution = async (req, res) => {
    try {
        const { email, password } = req.body;

        const inst = await Institution.findOne({ email });
        if (!inst) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, inst.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }


        if (inst.isRejected) {
            return res.status(403).json({
                message: "Your institution registration was rejected by the admin. Please contact support.",
            });
        }

        if (!inst.isApproved) {
            return res.status(403).json({
                message: "Your account is pending admin approval. You will be able to issue certificates once approved.",
            });
        }

        const token = generateToken(inst);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: "Login successful",
            institution: {
                id: inst._id,
                name: inst.name,
                email: inst.email,
                isApproved: inst.isApproved,
            },
            token,
        });

    } catch (err) {
        console.error("Institution Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;


        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;


        if (!isAcademicInstitutionEmail(email)) {
            return res.status(403).json({
                message: "Only institutions with official academic email domains are allowed to register.",
            });
        }

        let inst = await Institution.findOne({ email });

        if (!inst) {

            const shortCode = email.split('@')[0].substring(0, 10);

            // Generate RSA Key Pair
            const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: "spki",
                    format: "pem",
                },
                privateKeyEncoding: {
                    type: "pkcs8",
                    format: "pem",
                },
            });

            inst = await Institution.create({
                name: name,
                registrarName: "Authorized Signatory", // Default for Google Login
                email: email, strarName: "Authorized Signatory", // Default for Google Login
                email: email,
                emailDomain: email.split("@")[1],
                passwordHash: "",
                address: "",
                website: "",
                shortCode: shortCode,
                isApproved: false,
                isRejected: false,
                isProfileComplete: false,
                documents: [],
                publicKey,
                privateKey
            });





            const tempToken = generateToken(inst);

            res.cookie("token", tempToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.status(200).json({
                message: "Registered via Google. Please complete your profile.",
                institution: {
                    id: inst._id,
                    name: inst.name,
                    registrarName: inst.registrarName,
                    email: inst.email,
                    isApproved: inst.isApproved,
                    isProfileComplete: inst.isProfileComplete
                },
                token: tempToken
            });
        }

        if (inst.isRejected) {
            return res.status(403).json({ message: "Account rejected by admin." });
        }

        if (!inst.isApproved) {
            return res.status(403).json({ message: "Account pending approval." });
        }

        const jwtToken = generateToken(inst);

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            message: "Login successful",
            institution: {
                id: inst._id,
                name: inst.name,
                email: inst.email,
                isApproved: inst.isApproved,
                isProfileComplete: inst.isProfileComplete !== false,
            },
            token: jwtToken,
        });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ message: "Google Authentication failed" });
    }
};


exports.completeProfile = async (req, res) => {
    try {
        const { shortCode, address, website, registrarName } = req.body;
        const institutionId = req.user.id;

        if (!shortCode) {
            return res.status(400).json({ message: "Short Code is required." });
        }


        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = req.files.map((file) => `/uploads/institutions/${file.filename}`);
        }

        const inst = await Institution.findById(institutionId);
        if (!inst) {
            return res.status(404).json({ message: "Institution not found." });
        }

        inst.shortCode = shortCode;
        if (address) inst.address = address;
        if (website) inst.website = website;
        if (registrarName) inst.registrarName = registrarName;
        if (documents.length > 0) {
            inst.documents = documents;
        }
        inst.isProfileComplete = true;




        await inst.save();

        res.json({
            message: "Profile completed. Waiting for admin approval.",
            institution: {
                id: inst._id,
                name: inst.name,
                email: inst.email,
                isApproved: inst.isApproved,
                isProfileComplete: true
            }
        });

    } catch (err) {
        console.error("Complete Profile Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getInstMe = async (req, res) => {
    try {
        const inst = await Institution.findById(req.user.id).select("-passwordHash");
        if (!inst) return res.status(404).json({ message: "Institution not found" });
        res.json(inst);
    } catch (err) {
        console.error("GetMe Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const user = await Institution.findOne({ email: req.body.email });

        if (!user) {
            return res.status(200).json({ message: "Reset link sent if email exists" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save();

        // Frontend URL
        const resetUrl = `${process.env.FRONTEND_BASE_URL}reset-password/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You satisfy the security requirements to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link expires in 1 hour.</p>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "Certichain Password Reset",
                html: message
            });

            res.status(200).json({ message: "Reset link sent if email exists" });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            console.error("Email send error:", emailError);
            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await Institution.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.passwordHash = await bcrypt.hash(req.body.newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
