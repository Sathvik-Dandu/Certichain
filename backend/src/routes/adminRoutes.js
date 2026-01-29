const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const Institution = require("../models/Institution");
const Certificate = require("../models/Certificate");
const { protect, requireAdmin } = require("../middleware/authMiddleware");


router.get("/institutions", protect, requireAdmin, adminController.getInstitutions);
router.put("/institutions/:id/approve", protect, requireAdmin, adminController.approveInstitution);
router.put("/institutions/:id/reject", protect, requireAdmin, adminController.rejectInstitution);

router.get("/stats", protect, requireAdmin, adminController.getAdminStats);

router.get(
    "/dashboard/institutions",
    protect,
    requireAdmin,
    async (req, res) => {
        try {
            const institutions = await Institution.aggregate([
                {
                    $lookup: {
                        from: "certificates",
                        let: { instId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$institution", "$$instId"] },
                                            {
                                                $or: [
                                                    { $eq: ["$status", "ACTIVE"] },
                                                    { $eq: [{ $ifNull: ["$status", "missing"] }, "missing"] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "certs",
                    },
                },
                {
                    $project: {
                        name: 1,
                        shortCode: 1,
                        isApproved: 1,
                        isRejected: 1,
                        
                        certificatesCount: { $size: "$certs" },
                    },
                },
                { $sort: { certificatesCount: -1 } },
            ]);

            res.json(institutions);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Admin dashboard error" });
        }
    }
);

module.exports = router;
