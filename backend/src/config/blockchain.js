const { ethers } = require('ethers');




const getProvider = () => {
    
    
    return null;
};

const getWallet = (provider) => {
    if (!process.env.WALLET_PRIVATE_KEY) return null;
    
    
    return null;
};

module.exports = { getProvider, getWallet };
