const Certificate = require("../models/Certificate");
const Institution = require("../models/Institution");
const generateCertificateId = require("../utils/generateCertId");
const crypto = require("crypto");
const fs = require("fs");

// Helper to calculate hash
const calculateHash = (data) => {
    // Ensure consistent order and formatting
    // data.certificateId contains the uniqueness we need (shortCode + year + roll)
    const stringToHash = `${data.certificateId}|${data.studentName}|${data.courseName}|${data.branch || ""}|${data.passOutYear}`;
    return crypto.createHash("sha256").update(stringToHash).digest("hex");
};



const issueSingleCertificate = async ({
    institution,
    studentName,
    courseName,
    branch,
    passOutYear,
    rollNumber,
    issueDate,
    file,
    req,
    email,
    requestId
}) => {

    const yearTwoDigits = String(passOutYear).slice(-2);
    const certificateId = `${institution.shortCode}${yearTwoDigits}${rollNumber}`;

    // Calculate Data Hash
    const dataHash = calculateHash({
        studentName,
        courseName,
        branch,
        passOutYear,
        certificateId // Use the generated certificateId
    });


    // Digital Signature (Calculate early to embed in PDF)
    let digitalSignature = null;
    if (institution.privateKey) {
        console.log("Signing Certificate with Private Key");
        const sign = crypto.createSign('SHA256');
        sign.update(dataHash);
        sign.end();
        digitalSignature = sign.sign(institution.privateKey, 'base64');
    } else {
        console.log("No private key found for signing");
    }

    const { generateQRCode } = require("../services/qrService");
    const { qrPath, verifyUrl } = await generateQRCode(certificateId);


    const { embedQrIntoPdf } = require("../services/pdfService");
    const { uploadFileToIPFS } = require("../services/ipfsService");
    const { issueCertificateOnChain } = require("../services/blockchainService");
    const fs = require("fs");
    const path = require("path");

    let finalFilePath = file ? file.path : null;

    if (file && file.mimetype === "application/pdf") {
        try {
            const modifiedPdfPath = path.join(path.dirname(file.path), `qr-${file.filename}`);
            // Pass digitalSignature, institutionName, and registrarName to embedder
            await embedQrIntoPdf(file.path, qrPath, modifiedPdfPath, digitalSignature, institution.name, institution.registrarName);
            finalFilePath = modifiedPdfPath;
        } catch (pdfErr) {
            console.error(`⚠️ PDF Embed Failed for ${studentName}:`, pdfErr);
        }
    }

    // Calculate File Hash (SHA-256)
    let fileHash = null;
    if (finalFilePath) {
        try {
            const fileBuffer = fs.readFileSync(finalFilePath);
            console.log(`[Issue] Hashing File: ${finalFilePath}, Size: ${fileBuffer.length} bytes`);
            const hashSum = crypto.createHash('sha256');
            hashSum.update(fileBuffer);
            fileHash = hashSum.digest('hex');
        } catch (hashErr) {
            console.error(`⚠️ File Hash Calculation Failed for ${studentName}:`, hashErr);
        }
    }


    let ipfsHash = null;
    if (finalFilePath) {
        try {
            const fileName = file.originalname;
            ipfsHash = await uploadFileToIPFS(finalFilePath, fileName);


            if (finalFilePath !== file.path) {
                try { fs.unlinkSync(finalFilePath); } catch (e) { }
            }
        } catch (ipfsErr) {
            console.error(`⚠️ IPFS Upload Failed for ${studentName}:`, ipfsErr.message);
        }
    }


    let txHash = null;
    try {
        txHash = await issueCertificateOnChain({
            certificateId,
            studentName,
            institutionName: institution.name,
            courseName,
            branch,
            passOutYear,
            issueDate: issueDate || Date.now(),
            ipfsHash: ipfsHash || ""
        });
    } catch (err) {
        const errMsg = err.message || "";
        if (errMsg.includes("Certificate already exists") || errMsg.includes("execution reverted")) {

            console.error(`[Blockchain] ID collision for ${certificateId}: ${errMsg}`);



        } else {
            console.error("Blockchain write failed:", errMsg);
        }
    }




    const cert = await Certificate.create({
        certificateId,
        studentName,
        institution: institution._id,
        institutionName: institution.name,
        courseName,
        branch,
        passOutYear,
        issuedBy: "CertiChain Platform",
        ipfsHash,
        blockchainTxHash: txHash,
        isRevoked: false,
        verifyUrl,
        qrCodePath: qrPath,
        dataHash,
        fileHash,
        digitalSignature
    });

    const qrImageUrl = `${req.protocol}://${req.get("host")}/qr/${certificateId}.png`;

    // --- Student Request Integration ---
    if (requestId) {
        try {
            const CertificateRequest = require("../models/CertificateRequest");
            await CertificateRequest.findByIdAndUpdate(requestId, {
                status: "APPROVED",
                issuedCertificateId: certificateId
            });
        } catch (reqErr) {
            console.error("Failed to update request status:", reqErr);
        }
    }

    if (email) {
        const { sendVerificationEmail } = require("../services/emailService");
        const certUrl = `http://localhost:5173/verify/${certificateId}`;

        sendVerificationEmail(email, studentName, certUrl, {
            courseName,
            passOutYear,
            certificateId,
            institutionName: institution.name,
        }).catch(e => console.error("Email send failed:", e));
    }
    // -----------------------------------

    return {
        certificate: cert,
        qrImageUrl
    };
};


exports.issueCertificate = async (req, res) => {
    try {
        const institutionId = req.user.id;
        const {
            studentName,
            courseName,
            branch,
            passOutYear,
            rollNumber,
            issueDate,
            email,
            requestId
        } = req.body;

        if (!studentName || !courseName || !passOutYear || !rollNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const institution = await Institution.findById(institutionId);
        if (!institution) return res.status(404).json({ message: "Institution not found" });
        if (!institution.isApproved) return res.status(403).json({ message: "Institution not approved" });
        if (!institution.shortCode) return res.status(400).json({ message: "Institution shortCode missing" });

        const result = await issueSingleCertificate({
            institution,
            studentName,
            courseName,
            branch,
            passOutYear,
            rollNumber,
            issueDate,
            file: req.file,
            req,
            email,
            requestId
        });

        return res.status(201).json({
            message: "Certificate issued successfully",
            certificateId: result.certificate.certificateId,
            verificationUrl: result.certificate.verifyUrl,
            qrCodeDataUrl: result.qrImageUrl,
            ipfsHash: result.certificate.ipfsHash,
            blockchainTxHash: result.certificate.blockchainTxHash,
            certificate: result.certificate
        });
    } catch (err) {
        console.error("Issue Certificate Error:", err);
        return res.status(500).json({
            message: "Server error issuing certificate",
            error: err.message
        });
    }
};


exports.bulkIssueCertificates = async (req, res) => {
    try {
        const institutionId = req.user.id;

        const {
            courseName,
            branch,
            passOutYear,
            issueDate
        } = req.body;



        let { studentNames, rollNumbers } = req.body;

        try {
            if (typeof studentNames === 'string') studentNames = JSON.parse(studentNames);
            if (typeof rollNumbers === 'string') rollNumbers = JSON.parse(rollNumbers);
        } catch (e) {
            return res.status(400).json({ message: "Invalid JSON format for names or roll numbers" });
        }

        if (!studentNames || !Array.isArray(studentNames) || studentNames.length === 0) {
            return res.status(400).json({ message: "Student names are required" });
        }

        const files = req.files || [];


        if (studentNames.length !== rollNumbers.length) {
            return res.status(400).json({ message: `Mismatch: ${studentNames.length} names but ${rollNumbers.length} roll numbers.` });
        }
        if (files.length > 0 && files.length !== studentNames.length) {
            return res.status(400).json({ message: `Mismatch: ${studentNames.length} names but ${files.length} files selected.` });
        }

        const institution = await Institution.findById(institutionId);
        if (!institution) return res.status(404).json({ message: "Institution not found" });
        if (!institution.isApproved) return res.status(403).json({ message: "Institution not approved" });

        const results = [];
        const errors = [];

        for (let i = 0; i < studentNames.length; i++) {
            try {
                const result = await issueSingleCertificate({
                    institution,
                    studentName: studentNames[i],
                    courseName,
                    branch,
                    passOutYear,
                    rollNumber: rollNumbers[i],
                    issueDate,
                    file: files[i] || null,
                    req
                });
                results.push({
                    name: studentNames[i],
                    status: "success",
                    certificateId: result.certificate.certificateId
                });
            } catch (err) {
                console.error(`Error processing ${studentNames[i]}:`, err);
                errors.push({
                    name: studentNames[i],
                    error: err.message
                });
            }
        }

        res.json({
            message: "Bulk issuance completed",
            total: studentNames.length,
            successCount: results.length,
            errorCount: errors.length,
            results,
            errors
        });

    } catch (err) {
        console.error("Bulk Issue Error:", err);
        res.status(500).json({ message: "Server error during bulk issuance" });
    }
};


exports.getCertificateById = async (req, res) => {
    try {
        console.log("HIT getCertificateById for:", req.params.certificateId);
        const { certificateId } = req.params;

        const cert = await Certificate.findOne({ certificateId }).populate(
            "institution",
            "-passwordHash"
        );

        if (!cert) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Integrity Check
        // We need to reconstruct the hash based on the current document data
        // Note: cert.rollNumber is assuming we stored it or extract it? 
        // Wait, the schema doesn't have rollNumber explicitly in the top level check I saw earlier?
        // Checking Certificate.js view... it DOES NOT have rollNumber in the schema!
        // It has certificateId. certificateId is composed of shortCode + year + rollNumber.
        // But we need the exact data used to generate the hash.
        // Let's check issueSingleCertificate args vs Schema.
        // Schema has: studentName, institution, institutionName, courseName, branch, passOutYear.
        // It DOES NOT have rollNumber.
        // However, the hash I implemented uses rollNumber.
        // If I don't store rollNumber, I cannot re-verify unless I extract it from certificateId.
        // certificateId = shortCode + yearTwoDigits + rollNumber.
        // So rollNumber = certificateId.slice(shortCode.length + 2).
        // BUT shortCode length might vary?
        // Actually, we should probably stick to hashing fields that ARE in the DB.
        // Let's modify the hash calculation to NOT use rollNumber if it's not in DB, 
        // OR better, verify using the fields that ARE stored.
        // Schema: certificateId (String), studentName, institution (ObjectId), courseName, branch, passOutYear.
        const responseData = cert.toObject();

        const dataHashToVerify = calculateHash({
            studentName: cert.studentName,
            courseName: cert.courseName,
            branch: cert.branch,
            passOutYear: cert.passOutYear,
            certificateId: cert.certificateId
        });

        const integrityVerified = cert.dataHash === dataHashToVerify;
        responseData.integrityVerified = integrityVerified;

        // Verify Digital Signature
        let signatureVerified = false;
        if (cert.digitalSignature && cert.institution.publicKey) {
            console.log("Verifying Signature...");
            console.log("Certificate ID:", cert.certificateId);
            console.log("Institution Public Key (Snippet):", cert.institution.publicKey.substring(0, 50) + "...");
            console.log("Data Hash being verified:", cert.dataHash);

            try {
                const verify = crypto.createVerify('SHA256');
                verify.update(cert.dataHash);
                verify.end();
                signatureVerified = verify.verify(cert.institution.publicKey, cert.digitalSignature, 'base64');
                console.log("Signature Verified Result:", signatureVerified);
            } catch (sigErr) {
                console.error("Signature Verification Exception:", sigErr.message);
            }
        } else {
            console.log("Missing Sig or PubKey:", {
                hasSig: !!cert.digitalSignature,
                hasPubKey: !!cert.institution?.publicKey,
                institutionId: cert.institution?._id
            });
        }
        responseData.signatureVerified = signatureVerified;

        res.json(responseData);
    } catch (err) {
        console.log(" REAL ERROR:", err);
        return res.status(500).json({
            message: "Server error issuing certificate",
            realError: err.message,
            fullError: err
        });
    }

};


exports.verifyFileIntegrity = async (req, res) => {
    try {
        const { certificateId } = req.body;

        if (!req.file) {
            return res.status(400).json({ valid: false, message: "No certificate file uploaded" });
        }
        if (!certificateId) {
            // Clean up uploaded file
            try { fs.unlinkSync(req.file.path); } catch (e) { }
            return res.status(400).json({ valid: false, message: "Certificate ID is required" });
        }

        // Compute SHA-256 hash of the uploaded file
        const fileBuffer = fs.readFileSync(req.file.path);
        const uploadedFileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // Clean up file after hashing
        try { fs.unlinkSync(req.file.path); } catch (e) { }

        // 1. Try to find the certificate by ID
        const certById = await Certificate.findOne({ certificateId }).populate("institution", "name");

        if (certById) {
            // 2. Certificate exists, check if hash matches
            if (certById.fileHash === uploadedFileHash) {
                return res.json({
                    valid: true,
                    status: "GENUINE",
                    message: "Certificate is Genuine",
                    details: {
                        studentName: certById.studentName,
                        institutionName: certById.institutionName, // Use stored name from schema
                        course: certById.courseName,
                        year: certById.passOutYear,
                        issuedAt: certById.createdAt,
                        certificateId: certById.certificateId
                    }
                });
            } else {
                // ID exists, but Hash mismatch
                return res.json({
                    valid: false,
                    status: "MISMATCH",
                    message: "The uploaded document does not match the provided Certificate ID."
                });
            }
        } else {
            // 3. Certificate ID Not Found.
            // Check if this file (hash) belongs to ANY other certificate?
            const certByHash = await Certificate.findOne({ fileHash: uploadedFileHash });

            if (certByHash) {
                // Hash matches a different certificate
                return res.json({
                    valid: false,
                    status: "WRONG_ID",
                    message: `The uploaded document belongs to a different certificate ID (${certByHash.certificateId}), not the one provided.`
                });
            } else {
                // Neither ID nor Hash matches anything
                return res.json({
                    valid: false,
                    status: "INVALID",
                    message: "Verification Failed. Certificate ID invalid and document not recognized."
                });
            }
        }

    } catch (err) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        console.error("Integrity Verify Error:", err);
        // Return 200 with error status so frontend displays message properly instead of catching 500
        res.json({ valid: false, message: "Server error verifying integrity." });
    }
};

// Public: Forward a certificate to another email
exports.forwardCertificate = async (req, res) => {
    try {
        const { certificateId, targetEmail } = req.body;

        if (!certificateId || !targetEmail) {
            return res.status(400).json({ message: "Certificate ID and Target Email are required" });
        }

        const cert = await Certificate.findOne({ certificateId });
        if (!cert) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        const { sendVerificationEmail } = require("../services/emailService");
        const certUrl = `http://localhost:5173/verify/${certificateId}`;

        // Send email with "Forwarded" context
        // reusing sendVerificationEmail but we might want a slightly different message
        // For now, standard verification email is fine as it contains the link.
        await sendVerificationEmail(targetEmail, cert.studentName, certUrl, {
            courseName: cert.courseName,
            passOutYear: cert.passOutYear,
            certificateId: cert.certificateId,
            institutionName: cert.institutionName, // Use stored name
            isForwarded: true // Optional flag if email service supports it
        });

        res.json({ message: `Certificate sent to ${targetEmail} successfully!` });

    } catch (err) {
        console.error("Forward Certificate Error:", err);
        res.status(500).json({ message: "Failed to send email" });
    }
};
