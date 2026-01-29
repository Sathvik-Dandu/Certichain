


function generateCertificateId(shortCode, passOutYear, rollNumber) {
  if (!shortCode || !passOutYear || !rollNumber) {
    throw new Error("Missing data to generate certificate ID");
  }

  const code = String(shortCode).toLowerCase(); 
  const yearTwoDigits = String(passOutYear).slice(-2); 
  const roll = String(rollNumber); 

  return `${code}${yearTwoDigits}${roll}`; 
}

module.exports = generateCertificateId;
