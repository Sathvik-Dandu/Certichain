const fs = require("fs");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const embedQrIntoPdf = async (pdfPath, qrPath, outputPath, signatureText, institutionName, registrarName, issueDate) => {
    const pdfBytes = fs.readFileSync(pdfPath);
    const qrImageBytes = fs.readFileSync(qrPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const scriptFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic); // Using as substitute for Edwardian Script 

    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    const { width, height } = lastPage.getSize();

    // --- QR Code Placement (Bottom Right) ---
    const qrSize = 90; // Slightly smaller to fit better
    const qrX = width - qrSize - 30;
    const qrY = 30;

    lastPage.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
    });

    // --- Digital Signature Block (Bottom Left - Aadhaar Style) ---
    if (signatureText) {
        // Coordinates for the signature block
        const sigX = 40;
        const sigY = 50;

        // 1. Green Checkmark Symbol
        // Draw a smaller distinct checkmark
        lastPage.drawLine({
            start: { x: sigX + 2, y: sigY + 34 },
            end: { x: sigX + 5, y: sigY + 31 },
            thickness: 2,
            color: rgb(0, 0.6, 0), // Green
        });
        lastPage.drawLine({
            start: { x: sigX + 5, y: sigY + 31 },
            end: { x: sigX + 11, y: sigY + 39 },
            thickness: 2,
            color: rgb(0, 0.6, 0), // Green
        });

        // 2. "Signature valid" Text
        lastPage.drawText("Signature valid", {
            x: sigX + 20,
            y: sigY + 35,
            size: 9,
            font: helveticaBold,
            color: rgb(0, 0.6, 0), // Green
        });

        // 3. Details Text
        const detailsColor = rgb(0.2, 0.2, 0.2); // Dark Gray
        const detailsSize = 7;
        const lineHeight = 9;

        // Construct the lines
        const signerName = registrarName || "Authorized Signatory";
        const dateStr = issueDate ? new Date(issueDate).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
        const orgName = institutionName || "CertiChain Authority";

        let currentY = sigY + 20;

        lastPage.drawText(`Digitally signed by ${signerName}`, {
            x: sigX,
            y: currentY,
            size: detailsSize,
            font: helveticaFont,
            color: detailsColor,
        });

        currentY -= lineHeight;
        lastPage.drawText(`Date: ${dateStr}`, {
            x: sigX,
            y: currentY,
            size: detailsSize,
            font: helveticaFont,
            color: detailsColor,
        });

        currentY -= lineHeight;
        lastPage.drawText(`Reason: CertiChain Document Verification`, {
            x: sigX,
            y: currentY,
            size: detailsSize,
            font: helveticaFont,
            color: detailsColor,
        });

        currentY -= lineHeight;
        lastPage.drawText(`Location: India`, {
            x: sigX,
            y: currentY,
            size: detailsSize,
            font: helveticaFont,
            color: detailsColor,
        });

        // --- Center Signature Block (Registrar) ---

        const centerX = width / 2;
        const centerSigY = 60; // Adjust height as needed

        // Helper to center text
        const drawCenteredText = (text, y, font, size, color = rgb(0, 0, 0)) => {
            const textWidth = font.widthOfTextAtSize(text, size);
            lastPage.drawText(text, {
                x: centerX - (textWidth / 2),
                y: y,
                size: size,
                font: font,
                color: color,
            });
        };

        drawCenteredText("Digitally signed by", centerSigY + 35, helveticaFont, 8);

        // Registrar Name in Script-like font (Edwardian Script substitute)
        drawCenteredText(signerName, centerSigY + 12, scriptFont, 24); // Smaller size for script

        // College Name
        drawCenteredText(institutionName || "Institution", centerSigY - 5, helveticaBold, 10);

        // Title
        drawCenteredText("Registrar", centerSigY - 15, helveticaFont, 8);
    }

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    return outputPath;
};

module.exports = { embedQrIntoPdf };
