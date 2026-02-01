const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { protect, requireInstitution } = require("../middleware/authMiddleware");
const Certificate = require("../models/Certificate");
const Institution = require("../models/Institution");
const { uploadFileToIPFS } = require("../services/ipfsService");
const { issueCertificateOnChain } = require("../services/blockchainService");
const { issueCertificate, bulkIssueCertificates } = require("../controllers/certificateController");
const { getInstitutionRequests, rejectRequest } = require("../controllers/requestController");


const os = require("os");

// Use system temp directory for better deployment compatibility (Render/Vercel)
const uploadDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `cert-${unique}${ext}`);
    },
});
const upload = multer({ storage });


router.post(
    "/",
    protect,
    requireInstitution,
    upload.single("certificateFile"),
    issueCertificate
);


router.post(
    "/bulk",
    protect,
    requireInstitution,
    upload.array("certificateFiles"),
    upload.array("certificateFiles"),
    bulkIssueCertificates
);

// Institution Request Management
router.get("/requests/pending", protect, requireInstitution, getInstitutionRequests);
router.post("/requests/:requestId/reject", protect, requireInstitution, rejectRequest);

const { verifyFileIntegrity } = require("../controllers/certificateController");
router.post(
    "/public/verify-file-integrity",
    upload.single("certificateFile"),
    verifyFileIntegrity
);


router.get("/", async (req, res) => {
    try {
        const { institutionName, passOutYear, branch } = req.query;

        const filter = {};

        if (institutionName) filter.institutionName = institutionName;
        if (passOutYear) filter.passOutYear = Number(passOutYear);
        if (branch) filter.branch = branch;

        const certificates = await Certificate.find(filter)
            .select("certificateId studentName courseName branch passOutYear institutionName")
            .sort({ createdAt: -1 });

        res.json(certificates);
    } catch (err) {
        console.error("Public filter error:", err);
        res.status(500).json({ message: "Server error while filtering certificates" });
    }
});


router.get("/institution/stats", protect, requireInstitution, async (req, res) => {
    try {
        const institutionId = req.user.id;

        const total = await Certificate.countDocuments({ institution: institutionId });

        const byYear = await Certificate.aggregate([
            { $match: { institution: new mongoose.Types.ObjectId(institutionId) } },
            { $group: { _id: "$passOutYear", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const byBranch = await Certificate.aggregate([
            { $match: { institution: new mongoose.Types.ObjectId(institutionId) } },
            { $group: { _id: "$branch", count: { $sum: 1 } } }
        ]);

        res.json({ total, byYear, byBranch });
    } catch (err) {
        console.error("Institution stats error:", err);
        res.status(500).json({ message: "Failed to load dashboard data" });
    }
});


router.get("/:certificateId", async (req, res) => {
    try {
        const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
            .populate("institution", "name email");

        if (!cert) {
            return res.status(404).json({ message: "Certificate not found" });
        }
        res.json(cert);
    } catch (err) {
        console.error(" Get Certificate Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
