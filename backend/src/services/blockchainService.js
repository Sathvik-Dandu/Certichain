const { ethers } = require("ethers");
require("dotenv").config();


const CertiChainArtifact = require("../../../smart-contract/artifacts/contracts/CertiChain.sol/CertiChain.json");

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.warn("⚠️ Blockchain env vars missing. Blockchain integration will not work until you set BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, and CONTRACT_ADDRESS.");
}

let provider;
let wallet;
let contract;

function init() {
    if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) return;

    try {
        provider = new ethers.JsonRpcProvider(RPC_URL);
        wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CertiChainArtifact.abi,
            wallet
        );
    } catch (error) {
        console.error("Failed to initialize blockchain connection:", error);
    }
}

init();


async function issueCertificateOnChain(certData) {
    if (!contract) {
        throw new Error("Blockchain contract not initialized (missing env or ABI).");
    }

    const {
        certificateId,
        studentName,
        institutionName,
        courseName,
        branch,
        passOutYear,
        issueDate,
        ipfsHash,
    } = certData;

    
    const year = Number(passOutYear);
    const issuedAt = Math.floor(Number(issueDate) / 1000); 

    console.log(`[Blockchain] 📤 Preparing transaction...`);
    console.log(`[Blockchain] Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`[Blockchain] Payload:`, {
        certificateId,
        studentName,
        institutionName,
        courseName,
        branch: branch || "",
        year,
        issuedAt,
        ipfsHash: ipfsHash || ""
    });

    try {
        
        
        
        
        

        const tx = await contract.issueCertificate(
            certificateId,
            studentName,
            institutionName,
            courseName,
            branch || "",
            year,
            issuedAt,
            ipfsHash || ""
        );

        console.log(`[Blockchain] Tx sent: ${tx.hash}. Returning immediately (optimistic).`);

        
        tx.wait()
            .then((r) => console.log(` [Blockchain] Tx Mined: ${r.hash} (Block: ${r.blockNumber})`))
            .catch((e) => console.error(` [Blockchain] Tx Failed/Reverted: ${tx.hash}`, e));

        return tx.hash;
    } catch (error) {
        console.error(" [Blockchain] Transaction Failed!");
        console.error("Reason:", error.reason);
        console.error("Code:", error.code);
        console.error("Message:", error.message);

        if (error.data) console.error("Data:", error.data);
        throw error; 
    }
}

module.exports = {
    issueCertificateOnChain,
};
