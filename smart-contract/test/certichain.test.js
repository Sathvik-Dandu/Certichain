const { expect } = require("chai");

describe("CertiChain", function () {
    it("Should issue and verify a certificate", async function () {
        const CertiChain = await ethers.getContractFactory("CertiChain");
        const certichain = await CertiChain.deploy();
        await certichain.deployed();

        const certId = "12345";
        const studentName = "John Doe";
        const courseName = "Blockchain 101";
        const institutionName = "Tech University";
        const ipfsHash = "QmHash";

        await certichain.issueCertificate(certId, studentName, courseName, institutionName, ipfsHash);

        const certificate = await certichain.verifyCertificate(certId);
        expect(certificate.studentName).to.equal(studentName);
        expect(certificate.isValid).to.equal(true);
    });
});
