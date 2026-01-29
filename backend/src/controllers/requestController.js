const CertificateRequest = require("../models/CertificateRequest");

// Public: Create a new certificate request
exports.createRequest = async (req, res) => {
    try {
        const { institutionId, studentName, email, course, branch, year, rollNumber, message } = req.body;

        if (!institutionId || !studentName || !email || !year || !rollNumber) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newRequest = new CertificateRequest({
            institution: institutionId,
            studentName,
            email,
            course,
            branch,
            year,
            rollNumber,
            message,
        });

        await newRequest.save();

        res.status(201).json({ message: "Request submitted successfully", request: newRequest });
    } catch (err) {
        console.error("Create Request Error:", err);
        res.status(500).json({ message: "Server error submitting request" });
    }
};

// Institution: Get pending requests
exports.getInstitutionRequests = async (req, res) => {
    try {
        const institutionId = req.user.id;
        const requests = await CertificateRequest.find({ institution: institutionId, status: "PENDING" }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error("Get Requests Error:", err);
        res.status(500).json({ message: "Server error fetching requests" });
    }
};

// Institution: Reject a request
exports.rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { reason } = req.body;

        const request = await CertificateRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.institution.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        request.status = "REJECTED";
        request.rejectionReason = reason;
        await request.save();

        res.json({ message: "Request rejected" });
    } catch (err) {
        console.error("Reject Request Error:", err);
        res.status(500).json({ message: "Server error rejecting request" });
    }
};
// Public: Check request status by email
exports.checkStatus = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Find the most recent request for this email
        const request = await CertificateRequest.findOne({ email: email.toLowerCase() })
            .sort({ createdAt: -1 })
            .populate("institution", "name");

        if (!request) {
            return res.status(404).json({ message: "No request found for this email." });
        }

        res.json({
            status: request.status,
            studentName: request.studentName,
            course: request.course,
            institutionName: request.institution.name,
            rejectionReason: request.rejectionReason,
            issuedCertificateId: request.issuedCertificateId,
            createdAt: request.createdAt
        });

    } catch (err) {
        console.error("Check Status Error:", err);
        res.status(500).json({ message: "Server error checking status" });
    }
};
