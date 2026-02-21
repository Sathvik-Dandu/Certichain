const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const Institution = require("../models/Institution");
const { createRequest, checkStatus } = require("../controllers/requestController");
const { forwardCertificate } = require("../controllers/certificateController");
const crypto = require("crypto");

router.post("/request-certificate", createRequest);
router.post("/check-status", checkStatus);
router.post("/forward-certificate", forwardCertificate);


router.get("/certificate/:certificateId", async (req, res) => {
    try {
        // Helper to calculate hash (Must match controller logic)
        const calculateHash = (data) => {
            const stringToHash = `${data.certificateId}|${data.studentName}|${data.courseName}|${data.branch || ""}|${data.passOutYear}`;
            return crypto.createHash("sha256").update(stringToHash).digest("hex");
        };

        const cert = await Certificate.findOne({
            certificateId: req.params.certificateId,
        }).populate("institution", "name shortCode publicKey");

        if (!cert) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        if (cert.status === "REMOVED") {
            return res.json({
                verified: false,
                status: "REMOVED",
                message: "This certificate has been removed due to errors.",
            });
        }

        // Integrity Check
        const dataHashToVerify = calculateHash({
            studentName: cert.studentName,
            courseName: cert.courseName,
            branch: cert.branch,
            passOutYear: cert.passOutYear,
            certificateId: cert.certificateId
        });
        const integrityVerified = cert.dataHash === dataHashToVerify;

        // Verify Digital Signature
        let signatureVerified = false;
        if (cert.digitalSignature && cert.institution.publicKey) {
            try {
                const verify = crypto.createVerify('SHA256');
                verify.update(cert.dataHash);
                verify.end();
                signatureVerified = verify.verify(cert.institution.publicKey, cert.digitalSignature, 'base64');
            } catch (e) {
                console.error("Sig Verify Error:", e);
            }
        }

        res.json({
            verified: true,
            status: "ACTIVE",
            certificate: {
                certificateId: cert.certificateId,
                studentName: cert.studentName,
                institutionName: cert.institutionName,
                courseName: cert.courseName,
                branch: cert.branch,
                passOutYear: cert.passOutYear,
                ipfsHash: cert.ipfsHash,
                blockchainTxHash: cert.blockchainTxHash,
                issuedAt: cert.createdAt,
                issueDate: cert.issueDate,
                signatureStatus: cert.signatureStatus,
                adminVerifiedAt: cert.adminVerifiedAt,
                adminVerifiedBy: cert.adminVerifiedBy,
                verificationReason: cert.verificationReason,
                verificationLocation: cert.verificationLocation,
                integrityVerified,
                signatureVerified
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/institutions", async (req, res) => {
    try {
        const institutions = await Institution.find(
            { isApproved: true },
            { name: 1, shortCode: 1 }
        );

        res.json(institutions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/search", async (req, res) => {
    try {
        const { institution, year, branch } = req.query;

        const query = {};


        query.status = "ACTIVE";

        if (institution) {
            const inst = await Institution.findOne({ shortCode: institution });
            if (inst) {
                query.institution = inst._id;
            } else {

                return res.json([]);
            }
        }
        if (year) query.passOutYear = Number(year);
        if (branch) query.branch = branch;

        const certificates = await Certificate.find(query).select(
            "certificateId studentName branch passOutYear"
        );

        res.json(certificates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});





router.get("/download/:ipfsHash", (req, res) => {
    const { ipfsHash } = req.params;
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    https.get(fileUrl, (externalRes) => {
        if (externalRes.statusCode !== 200) {
            return res.status(404).json({ message: "File not found on IPFS" });
        }


        res.setHeader("Content-Disposition", `attachment; filename="certificate-${ipfsHash}.pdf"`);
        res.setHeader("Content-Type", externalRes.headers["content-type"] || "application/pdf");

        externalRes.pipe(res);
    }).on("error", (err) => {
        console.error("Proxy error:", err);
        res.status(500).json({ message: "Error downloading file" });
    });
});




module.exports = router;
