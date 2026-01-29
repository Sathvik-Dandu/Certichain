const hre = require("hardhat");



async function main() {
    const CertiChain = await hre.ethers.getContractFactory("CertiChain");
    const certichain = await CertiChain.deploy();

    await certichain.deployed();

    console.log(
        `CertiChain deployed to ${certichain.address}`
    );
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
