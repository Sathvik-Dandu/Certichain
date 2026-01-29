const allowedAcademicDomains = [
    ".ac.in",
    ".edu",
    ".edu.in",
    ".ac.uk",
    ".edu.au",
    ".edu.sg",
    ".ac.bd",
    ".edu.pk",
    ".edu.ph",
    ".ac.nz",
    ".ac.jp",
    ".edu.cn",
    ".ac.kr",
    ".ac.th",
    ".edu.my",
    ".edu.vn"
];

const isAcademicInstitutionEmail = (email) => {
    if (!email || !email.includes("@")) return false;

    const domain = email.split("@")[1].toLowerCase();

    return allowedAcademicDomains.some((allowed) =>
        domain.endsWith(allowed)
    );
};

module.exports = { isAcademicInstitutionEmail };
