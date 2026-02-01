const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const institutionRoutes = require("./src/routes/institutionRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const certificateRoutes = require("./src/routes/certificateRoutes");
const publicRoutes = require("./src/routes/publicRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://certiichain.vercel.app",
        process.env.FRONTEND_BASE_URL,
      ].filter(Boolean); // Remove empty values if env not set

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200, // Legacy support
  })
);
app.use(cookieParser());
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
