const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
    institutionName: { type: String, required: true },
    courseName: { type: String, required: true },
    branch: { type: String },
    passOutYear: { type: Number },
    issueDate: { type: Date, default: Date.now },
    ipfsHash: { type: String },
    blockchainTxHash: { type: String },
    issuedBy: { type: String },
    dataHash: { type: String }, // SHA-256 hash of core fields for integrity check
    fileHash: { type: String }, // SHA-256 hash of the PDF file
    digitalSignature: { type: String }, // Cryptographic signature of the certificate data
    isRevoked: { type: Boolean, default: false },


    verifyUrl: { type: String },
    qrCodePath: { type: String },
    qrCodeDataUrl: { type: String },
    signatureStatus: {
      type: String,
      enum: ["PENDING_ADMIN_VERIFICATION", "VERIFIED"],
      default: "PENDING_ADMIN_VERIFICATION"
    },
    adminVerifiedAt: { type: Date },
    adminVerifiedBy: { type: String },
    verificationReason: { type: String },
    verificationLocation: { type: String },
    finalCertificateHash: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "REMOVED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
