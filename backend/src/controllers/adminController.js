const mongoose = require("mongoose");
const Institution = require("../models/Institution");
const Certificate = require("../models/Certificate");


exports.getInstitutions = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status === "pending") {
      filter.isApproved = false;
      filter.isRejected = false;
      filter.isProfileComplete = true;
    } else if (status === "approved") {
      filter.isApproved = true;
    } else if (status === "rejected") {
      filter.isRejected = true;
    }

    const institutions = await Institution.find(filter).select("-passwordHash");
    res.json(institutions);
  } catch (err) {
    console.error("Fetch Institutions Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.approveInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    institution.isApproved = true;
    institution.isRejected = false;
    await institution.save();

    res.json({
      message: "Institution approved successfully ",
      institution: {
        id: institution._id,
        name: institution.name,
        isApproved: institution.isApproved,
      },
    });
  } catch (err) {
    console.error("Approve Institution Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.rejectInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    institution.isApproved = false;
    institution.isRejected = true;
    await institution.save();

    res.json({
      message: "Institution rejected ",
      institution: {
        id: institution._id,
        name: institution.name,
        isApproved: institution.isApproved,
        isRejected: institution.isRejected,
      },
    });
  } catch (err) {
    console.error("Reject Institution Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAdminStats = async (req, res) => {
  try {
    const totalInstitutions = await Institution.countDocuments({});
    const approvedInstitutions = await Institution.countDocuments({ isApproved: true });
    const rejectedInstitutions = await Institution.countDocuments({ isRejected: true });
    const pendingInstitutions = await Institution.countDocuments({
      isApproved: false,
      isRejected: false,
      isProfileComplete: true,
    });

    const totalCertificates = await Certificate.countDocuments({
      $or: [{ status: "ACTIVE" }, { status: { $exists: false } }],
    });

    res.json({
      totalInstitutions,
      approvedInstitutions,
      rejectedInstitutions,
      pendingInstitutions,
      totalCertificates,
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
};
