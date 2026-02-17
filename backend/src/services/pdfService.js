const fs = require("fs");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const embedQrIntoPdf = async (pdfPath, qrPath, outputPath, signatureText, institutionName, registrarName) => {
    const pdfBytes = fs.readFileSync(pdfPath);
    const qrImageBytes = fs.readFileSync(qrPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const signatureFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];

    const { width, height } = lastPage.getSize();


    const qrSize = 100;


    lastPage.drawImage(qrImage, {
        x: width - qrSize - 20,
        y: 20,
        width: qrSize,
        height: qrSize,
    });

    if (signatureText) {
        // --- Digital Signature Block Logic (Redesigned) ---
        const { width } = lastPage.getSize();
        const centerX = width / 2;

        // Y-positions (calculated from bottom up to ensure spacing)
        const labelY = 110;
        const sigY = 85;
        const lineY = 75;
        const roleY = 60;
        const orgY = 45;

        // Helper to draw centered text
        const drawCenteredText = (text, y, font, size, color) => {
            const textWidth = font.widthOfTextAtSize(text, size);
            lastPage.drawText(text, {
                x: centerX - (textWidth / 2),
                y: y,
                size,
                font,
                color,
            });
        };

        // 1. "Digitally Signed By" - Small caps feel, wide spacing
        const labelText = "DIGITALLY SIGNED BY".split("").join(" ");
        drawCenteredText(labelText, labelY, helveticaFont, 9, rgb(0.5, 0.5, 0.5));

        // 2. Signature Name - Script/Serif, Blue, Large
        const sigName = registrarName || "Authorized Signatory";
        drawCenteredText(sigName, sigY, signatureFont, 30, rgb(0.1, 0.2, 0.8)); // Blue-700 approx

        // 3. Divider Line - Centered
        const lineWidth = 200;
        lastPage.drawLine({
            start: { x: centerX - (lineWidth / 2), y: lineY },
            end: { x: centerX + (lineWidth / 2), y: lineY },
            thickness: 1,
            color: rgb(0.6, 0.6, 0.6), // Gray-400 approx
        });

        // 4. Role & Organization - Stacked, Helvetica, Dark Grey
        // Organization (Top of stack)
        const instName = institutionName || "Institution Authority";
        drawCenteredText(instName, roleY, helveticaFont, 12, rgb(0.2, 0.2, 0.2));

        // Role (Bottom of stack)
        drawCenteredText("Registrar", orgY, helveticaFont, 12, rgb(0.2, 0.2, 0.2));
    }

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    return outputPath;
};

module.exports = { embedQrIntoPdf };
