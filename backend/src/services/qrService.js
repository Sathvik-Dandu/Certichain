const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const generateQRCode = async (certificateId) => {
  const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify/${certificateId}`;

  const qrDir = path.join(__dirname, "../../qr-codes");
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir);
  }

  const qrPath = path.join(qrDir, `${certificateId}.png`);

  await QRCode.toFile(qrPath, verifyUrl, {
    width: 300,
    margin: 2,
  });

  
  
  
  
  
  
  return {
    qrPath,
    verifyUrl,
  };
};

module.exports = { generateQRCode };
