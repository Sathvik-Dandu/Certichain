const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;


exports.protect = (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);



    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

exports.requireInstitution = (req, res, next) => {
  if (!req.user || req.user.role !== "institution") {
    return res.status(403).json({ message: "Institution access required" });
  }
  next();
};
