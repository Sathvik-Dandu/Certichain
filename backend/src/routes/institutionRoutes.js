const express = require("express");
const router = express.Router();

const Institution = require("../models/Institution");
const institutionController = require("../controllers/institutionController");
const Certificate = require("../models/Certificate");
const { protect, requireInstitution } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const { isAcademicInstitutionEmail } = require("../utils/emailValidator");

const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../uploads/institutions")); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

const upload = multer({ storage });


router.post(
    "/register",
    upload.array("documents", 10), 
    async (req, res, next) => {
        const { email } = req.body;
        
        if (email && !isAcademicInstitutionEmail(email)) {
            return res.status(400).json({
                message: "Only institutions with official academic email domains (.ac.in, .edu, etc.) are allowed to register.",
            });
        }
        next();
    },
    institutionController.registerInstitution
);
router.post("/login", institutionController.loginInstitution);
router.post("/auth/google", institutionController.googleLogin);
router.post(
    "/complete-profile",
    protect,
    requireInstitution,
    upload.array("documents", 5),
    institutionController.completeProfile
);

router.get("/me", protect, requireInstitution, institutionController.getInstMe);


router.get("/public/list", async (req, res) => {
    try {
        const institutions = await Institution.find({ isApproved: true })
            .select("name shortCode");
        res.json(institutions);
    } catch (err) {
        res.status(500).json({ message: "Failed to load institutions" });
    }
});


router.get("/certificates", protect, requireInstitution, async (req, res) => {
    try {
        const certificates = await Certificate.find({ institution: req.user.id })
            .sort({ createdAt: -1 });
        res.json(certificates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch certificates" });
    }
});

router.delete(
    "/certificates/:certificateId",
    protect,
    requireInstitution,
    async (req, res) => {
        try {
            const cert = await Certificate.findOne({
                certificateId: req.params.certificateId,
                institution: req.user.id, 
            });

            if (!cert) {
                return res.status(404).json({ message: "Certificate not found" });
            }

            await Certificate.deleteOne({ _id: cert._id });

            res.json({
                message: "Certificate removed successfully",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

router.get(
    "/dashboard/stats",
    protect,
    requireInstitution,
    async (req, res) => {
        try {
            
            const institutionId = req.user.id;

            
            const totalCertificates = await Certificate.countDocuments({
                institution: institutionId,
                $or: [{ status: "ACTIVE" }, { status: { $exists: false } }],
            });

            
            const certificatesPerYear = await Certificate.aggregate([
                {
                    $match: {
                        institution: new mongoose.Types.ObjectId(institutionId),
                        $or: [{ status: "ACTIVE" }, { status: { $exists: false } }]
                    }
                },
                {
                    $group: {
                        _id: "$passOutYear",
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            
            const certificatesPerBranch = await Certificate.aggregate([
                {
                    $match: {
                        institution: new mongoose.Types.ObjectId(institutionId),
                        $or: [{ status: "ACTIVE" }, { status: { $exists: false } }]
                    }
                },
                {
                    $group: {
                        _id: "$branch",
                        count: { $sum: 1 },
                    },
                },
            ]);

            res.json({
                totalCertificates,
                certificatesPerYear,
                certificatesPerBranch,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Dashboard analytics error" });
        }
    }
);

module.exports = router;
