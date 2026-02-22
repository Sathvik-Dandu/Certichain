const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

// Path to the blank template stored in the backend
const TEMPLATE_PATH = path.join(__dirname, "../../templates/certificate_template.pdf");

/**
 * Fills student details into the certificate template PDF.
 * signatureStatus controls which verification block renders:
 *   "PENDING_ADMIN_VERIFICATION" → yellow "Signature Not Verified"
 *   "VERIFIED"                   → green  "Signature Verified"
 * QR code and registrar block are always rendered exactly ONCE.
 */
const fillCertificateTemplate = async ({
    studentName,
    courseName,
    branch,
    institutionName,
    issueDate,
    qrPath,
    outputPath,
    registrarName,
    digitalSignature,
    signatureStatus = "PENDING_ADMIN_VERIFICATION",
}) => {
    const templateBytes = fs.readFileSync(TEMPLATE_PATH);
    const pdfDoc = await PDFDocument.load(templateBytes);

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const scriptFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const pages = pdfDoc.getPages();
    const page = pages[0];
    const { width, height } = page.getSize();

    // ----------------------------------------------------------------
    // TEXT FILL — coordinates calibrated for the certificate template
    // ----------------------------------------------------------------
    const fieldFont = helveticaBold;
    const fieldSize = 14;

    const dateStr = issueDate
        ? new Date(issueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
        : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    const fields = [
        [studentName, 320, height * 0.555],
        [courseName, 210, height * 0.516],
        [branch, 275, height * 0.472],
        [institutionName || "N/A", 290, height * 0.440],
        [dateStr, 270, height * 0.393],
    ];

    for (const [text, x, y] of fields) {
        page.drawText(String(text), {
            x, y,
            size: fieldSize,
            font: fieldFont,
            color: rgb(0, 0, 0),
        });
    }

    // ----------------------------------------------------------------
    // QR CODE — Bottom Right (rendered ONCE)
    // ----------------------------------------------------------------
    if (qrPath && fs.existsSync(qrPath)) {
        const qrImageBytes = fs.readFileSync(qrPath);
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        const qrSize = 80;
        page.drawImage(qrImage, {
            x: width - qrSize - 65,
            y: 90,
            width: qrSize,
            height: qrSize,
        });
    }

    // ----------------------------------------------------------------
    // VERIFICATION BLOCK — Bottom Left (yellow OR green, never both)
    // ----------------------------------------------------------------
    if (digitalSignature !== undefined) {
        const sigX = 80;
        const sigY = 110;
        const signerName = registrarName || "Authorized Signatory";
        const dateStrSig = issueDate
            ? new Date(issueDate).toLocaleString("en-IN")
            : new Date().toLocaleString("en-IN");

        const dark = rgb(0.2, 0.2, 0.2);
        const sz = 7;
        const lh = 9;

        if (signatureStatus === "VERIFIED") {
            // ---- GREEN: Signature Verified ----
            const green = rgb(0, 0.6, 0);
            page.drawLine({ start: { x: sigX + 2, y: sigY + 34 }, end: { x: sigX + 5, y: sigY + 31 }, thickness: 2, color: green });
            page.drawLine({ start: { x: sigX + 5, y: sigY + 31 }, end: { x: sigX + 11, y: sigY + 39 }, thickness: 2, color: green });
            page.drawText("Signature Verified", { x: sigX + 20, y: sigY + 35, size: 9, font: helveticaBold, color: green });

            let y = sigY + 20;
            page.drawText("Verified by: CertiChain Admin", { x: sigX, y, size: sz, font: helveticaFont, color: dark });
            y -= lh;
            page.drawText(`Date: ${new Date().toLocaleString("en-IN")}`, { x: sigX, y, size: sz, font: helveticaFont, color: dark });
            y -= lh;
            page.drawText("Reason: CertiChain Document Verification", { x: sigX, y, size: sz, font: helveticaFont, color: dark });
            y -= lh;
            page.drawText("Location: India", { x: sigX, y, size: sz, font: helveticaFont, color: dark });
        } else {
            // ---- YELLOW: Signature Not Verified ----
            const yellow = rgb(0.85, 0.59, 0.02);
            page.drawText("!", { x: sigX + 5, y: sigY + 32, size: 14, font: helveticaBold, color: yellow });
            page.drawText("Signature Not Verified", { x: sigX + 20, y: sigY + 35, size: 9, font: helveticaBold, color: yellow });

            let y = sigY + 20;
            page.drawText(`Digitally signed by ${signerName}`, { x: sigX, y, size: sz, font: helveticaFont, color: dark });
            y -= lh;
            page.drawText(`Date: ${dateStrSig}`, { x: sigX, y, size: sz, font: helveticaFont, color: dark });
            y -= lh;
            page.drawText("Reason: Pending CertiChain Admin Verification", { x: sigX, y, size: sz, font: helveticaFont, color: dark });
            y -= lh;
            page.drawText("Location: India", { x: sigX, y, size: sz, font: helveticaFont, color: dark });
        }

        // ---- CENTER REGISTRAR BLOCK (rendered ONCE, outside condition) ----
        const cx = width / 2;
        const csy = 120;
        const drawCentered = (text, cy, font, size, color = rgb(0, 0, 0)) => {
            const tw = font.widthOfTextAtSize(text, size);
            page.drawText(text, { x: cx - tw / 2, y: cy, size, font, color });
        };
        drawCentered("Digitally signed by", csy + 35, helveticaFont, 8);
        drawCentered(signerName, csy + 12, scriptFont, 24);
        drawCentered(institutionName || "Institution", csy - 5, helveticaBold, 10);
        drawCentered("Registrar", csy - 15, helveticaFont, 8);
    }

    const modifiedBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedBytes);
    return outputPath;
};


/**
 * Legacy: Embeds QR into an existing uploaded PDF.
 */
const embedQrIntoPdf = async (pdfPath, qrPath, outputPath, signatureText, institutionName, registrarName, issueDate) => {
    const pdfBytes = fs.readFileSync(pdfPath);
    const qrImageBytes = fs.readFileSync(qrPath);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const scriptFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    const qrSize = 90;
    const qrX = width - qrSize - 30;
    const qrY = 30;
    lastPage.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

    if (signatureText) {
        const sigX = 40;
        const sigY = 50;

        lastPage.drawLine({ start: { x: sigX + 2, y: sigY + 34 }, end: { x: sigX + 5, y: sigY + 31 }, thickness: 2, color: rgb(0, 0.6, 0) });
        lastPage.drawLine({ start: { x: sigX + 5, y: sigY + 31 }, end: { x: sigX + 11, y: sigY + 39 }, thickness: 2, color: rgb(0, 0.6, 0) });
        lastPage.drawText("Signature valid", { x: sigX + 20, y: sigY + 35, size: 9, font: helveticaBold, color: rgb(0, 0.6, 0) });

        const detailsColor = rgb(0.2, 0.2, 0.2);
        const detailsSize = 7;
        const lineHeight = 9;
        const signerName = registrarName || "Authorized Signatory";
        const dateStr = issueDate ? new Date(issueDate).toLocaleString("en-IN") : new Date().toLocaleString("en-IN");

        let currentY = sigY + 20;
        lastPage.drawText(`Digitally signed by ${signerName}`, { x: sigX, y: currentY, size: detailsSize, font: helveticaFont, color: detailsColor });
        currentY -= lineHeight;
        lastPage.drawText(`Date: ${dateStr}`, { x: sigX, y: currentY, size: detailsSize, font: helveticaFont, color: detailsColor });
        currentY -= lineHeight;
        lastPage.drawText(`Reason: CertiChain Document Verification`, { x: sigX, y: currentY, size: detailsSize, font: helveticaFont, color: detailsColor });
        currentY -= lineHeight;
        lastPage.drawText(`Location: India`, { x: sigX, y: currentY, size: detailsSize, font: helveticaFont, color: detailsColor });

        const centerX = width / 2;
        const centerSigY = 60;
        const drawCenteredText = (text, y, font, size, color = rgb(0, 0, 0)) => {
            const textWidth = font.widthOfTextAtSize(text, size);
            lastPage.drawText(text, { x: centerX - textWidth / 2, y, size, font, color });
        };
        drawCenteredText("Digitally signed by", centerSigY + 35, helveticaFont, 8);
        drawCenteredText(signerName, centerSigY + 12, scriptFont, 24);
        drawCenteredText(institutionName || "Institution", centerSigY - 5, helveticaBold, 10);
        drawCenteredText("Registrar", centerSigY - 15, helveticaFont, 8);
    }

    const modifiedPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, modifiedPdfBytes);
    return outputPath;
};

module.exports = { embedQrIntoPdf, fillCertificateTemplate };
