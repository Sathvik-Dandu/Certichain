const fs = require("fs");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const embedQrIntoPdf = async (pdfPath, qrPath, outputPath, signatureText) => {
    const pdfBytes = fs.readFileSync(pdfPath);
    const qrImageBytes = fs.readFileSync(qrPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

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
        // --- Draw Stamp Logic ---
        const stampX = 50;  // Left side, near bottom
        const stampY = 50;
        const radius = 35;

        // Draw Outer Circle (Green)
        lastPage.drawCircle({
            x: stampX,
            y: stampY,
            size: radius,
            borderWidth: 2,
            borderColor: rgb(0.1, 0.6, 0.3), // Green
            opacity: 0.1,
            color: undefined, // Transparent fill
        });

        // Draw Inner Circle (Green)
        lastPage.drawCircle({
            x: stampX,
            y: stampY,
            size: radius - 4,
            borderWidth: 1,
            borderColor: rgb(0.1, 0.6, 0.3),
            opacity: 0.8,
        });

        // "VERIFIED" Text centered
        const verifiedText = "VERIFIED";
        const textWidth = helveticaFont.widthOfTextAtSize(verifiedText, 10);
        lastPage.drawText(verifiedText, {
            x: stampX - (textWidth / 2),
            y: stampY + 5,
            size: 10,
            font: helveticaFont,
            color: rgb(0.1, 0.6, 0.3),
        });

        // "CertiChain" Text centered below
        const brandText = "CertiChain";
        const brandWidth = helveticaFont.widthOfTextAtSize(brandText, 7);
        lastPage.drawText(brandText, {
            x: stampX - (brandWidth / 2),
            y: stampY - 5,
            size: 7,
            font: helveticaFont,
            color: rgb(0.1, 0.6, 0.3),
        });

        // Draw a simple "tick" mark using lines inside the circle
        // Tick coordinates relative to center (stampX, stampY)
        const tickColor = rgb(0.1, 0.6, 0.3);

        lastPage.drawLine({
            start: { x: stampX - 8, y: stampY - 2 },
            end: { x: stampX - 2, y: stampY - 8 },
            thickness: 2,
            color: tickColor,
        });
        lastPage.drawLine({
            start: { x: stampX - 2, y: stampY - 8 },
            end: { x: stampX + 10, y: stampY + 8 }, // Long stroke up
            thickness: 2,
            color: tickColor,
        });


    }

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedPdfBytes);

    return outputPath;
};

module.exports = { embedQrIntoPdf };
