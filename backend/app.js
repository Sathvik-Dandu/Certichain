const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const institutionRoutes = require("./src/routes/institutionRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const certificateRoutes = require("./src/routes/certificateRoutes");
const publicRoutes = require("./src/routes/publicRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/qr", express.static(path.join(__dirname, "qr-codes")));

app.get("/", (req, res) => {
  res.json({ message: "CertiChain backend is running " });
});

app.use("/api/auth", authRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/public", publicRoutes);

module.exports = app;
