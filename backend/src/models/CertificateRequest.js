const mongoose = require("mongoose");

const certificateRequestSchema = new mongoose.Schema(
    {
        studentName: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
        course: { type: String, required: true },
        branch: { type: String },
        year: { type: Number, required: true },
        rollNumber: { type: String, required: true },
        message: { type: String },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },
        rejectionReason: { type: String },
        issuedCertificateId: { type: String }, // Linked Certificate ID when approved
    },
    { timestamps: true }
);

module.exports = mongoose.model("CertificateRequest", certificateRequestSchema);
