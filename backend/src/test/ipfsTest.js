require("dotenv").config();
const { uploadFileToIPFS } = require("../services/ipfsService");
const fs = require("fs");

(async () => {
    fs.writeFileSync("test.txt", "IPFS test from CertiChain");

    const hash = await uploadFileToIPFS("test.txt", "test.txt");
    console.log("IPFS HASH:", hash);

    fs.unlinkSync("test.txt");
})();
