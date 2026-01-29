
pragma solidity ^0.8.20;

contract CertiChain {
    address public owner;

    struct Certificate {
        string certificateId;
        string studentName;
        string institutionName;
        string courseName;
        string branch;
        uint16 passOutYear;
        uint256 issueDate;
        string ipfsHash;
        address issuedBy;
        bool isRevoked;
    }

    mapping(string => Certificate) public certificates;

    event CertificateIssued(string certificateId, address issuedBy);
    event CertificateRevoked(string certificateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not admin");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        string memory certificateId,
        string memory studentName,
        string memory institutionName,
        string memory courseName,
        string memory branch,
        uint16 passOutYear,
        uint256 issueDate,
        string memory ipfsHash
    ) external {
        Certificate storage c = certificates[certificateId];
        require(bytes(c.certificateId).length == 0, "Certificate already exists");

        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            studentName: studentName,
            institutionName: institutionName,
            courseName: courseName,
            branch: branch,
            passOutYear: passOutYear,
            issueDate: issueDate,
            ipfsHash: ipfsHash,
            issuedBy: msg.sender,
            isRevoked: false
        });

        emit CertificateIssued(certificateId, msg.sender);
    }

    function getCertificate(string memory certificateId)
        external
        view
        returns (Certificate memory)
    {
        return certificates[certificateId];
    }

    function revokeCertificate(string memory certificateId) external {
        Certificate storage c = certificates[certificateId];
        require(c.issuedBy == msg.sender || msg.sender == owner, "Not allowed");
        require(bytes(c.certificateId).length != 0, "Not found");

        c.isRevoked = true;
        emit CertificateRevoked(certificateId);
    }
}
