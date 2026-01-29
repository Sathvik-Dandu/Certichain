const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailDomain: {
      type: String,
    },
    passwordHash: {
      type: String,

    },
    address: {
      type: String,
    },
    website: {
      type: String,
    },
    publicKey: {
      type: String, // Stores the public key in PEM format
    },
    privateKey: {
      type: String, // Stores the private key in PEM format (In production, use HSM/Vault)
    },
    documents: [
      {
        type: String,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Institution", institutionSchema);
