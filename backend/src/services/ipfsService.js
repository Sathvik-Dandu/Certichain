
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

async function uploadFileToIPFS(filePath, fileName) {
  try {
    const readableStream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: { name: fileName || "cert_file" },
    };
    const result = await pinata.pinFileToIPFS(readableStream, options);
    
    return result.IpfsHash;
  } catch (err) {
    console.error("IPFS upload error:", err);
    throw err;
  }
}

module.exports = { uploadFileToIPFS };
