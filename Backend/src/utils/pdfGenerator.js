const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ==========================================================
// Layout constants (A4 = 595.28pt wide, margin 40pt each side)
// ==========================================================
const START_X = 40;
const PAGE_WIDTH = 595.28;
const USABLE_WIDTH = PAGE_WIDTH - START_X * 2; // ~515pt
const PAGE_BOTTOM_LIMIT = 730;

// Attendance table columns — same field names the rest of the app already
// uses (course_name, semester_number, subject_name, attendance_date, hours,
// rate_per_hour, amount) so no change is needed upstream.
const COLUMNS = [
    { title: "Program", width: 70, key: "course_name" },
    { title: "Semester", width: 50, key: "semester_number" },
    { title: "Subject", width: 120, key: "subject_name" },
    { title: "Dates with\nDuration (Hrs.)", width: 95, key: "attendance_date" },
    { title: "Total\nHrs.", width: 55, key: "hours" },
    { title: "Rate", width: 55, key: "rate_per_hour" },
    { title: "Amount", width: 70, key: "amount" }
];
const TABLE_WIDTH = COLUMNS.reduce((sum, col) => sum + col.width, 0); // ~515pt
const HEADER_ROW_HEIGHT = 34;
const ROW_HEIGHT = 22;

// ----------------------------------------------------------------
// Small helpers
// ----------------------------------------------------------------
const line = (doc, y) => {
    doc.moveTo(START_X, y).lineTo(START_X + USABLE_WIDTH, y).stroke();
};

const labelValue = (doc, label, value, x, y, opts = {}) => {
    doc.font("Helvetica-Bold").fontSize(10).text(label, x, y, { continued: true });
    doc.font("Helvetica").text(` ${value ?? ""}`, opts);
};

// ----------------------------------------------------------------
// Header block: university name, ANNEXURE-IV, department, bill title
// ----------------------------------------------------------------
const drawHeader = (doc, bill, faculty) => {
    // Optional letterhead logo, if one exists alongside this file
    const logoPath = path.join(__dirname, "../assets/davv-logo.png");
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, START_X, 35, { width: 45, height: 45 });
    }

    doc.font("Helvetica-Bold").fontSize(10).text("ANNEXURE - IV", START_X, 40, {
        width: USABLE_WIDTH,
        align: "right"
    });

    doc.font("Helvetica-Bold").fontSize(14).text(
        "DEVI AHILYA VISHWAVIDYALYA, INDORE",
        START_X,
        60,
        { width: USABLE_WIDTH, align: "center" }
    );

    doc.moveDown(0.6);
    doc.font("Helvetica").fontSize(10).text(
        `Department/School/Centre : ${bill.department || "____________________"}`,
        START_X,
        doc.y
    );

    doc.moveDown(0.3);
    doc.text(
        `Page No. of Attendance Register : ${bill.attendance_page_no || "________"}      ` +
        `S.No. : ${bill.serial_no || "________"}`
    );

    doc.moveDown(0.8);
    doc.font("Helvetica-Bold").fontSize(11).text(
        "Bill For Claiming Remuneration/Honorarium for Visiting Faculty",
        START_X,
        doc.y,
        { underline: true }
    );

    doc.moveDown(0.8);

    // Faculty info block
    const infoY = doc.y;
    labelValue(doc, "UVFIN :", faculty.uvfin, START_X, infoY);
    doc.moveDown(0.5);
    labelValue(doc, "Name :", faculty.full_name, START_X, doc.y);
    doc.moveDown(0.5);
    labelValue(doc, "Address :", faculty.address, START_X, doc.y, { width: USABLE_WIDTH });
    doc.moveDown(0.5);

    const rowY = doc.y;
    labelValue(doc, "Mob No. :", faculty.mobile_no, START_X, rowY);
    labelValue(doc, "Qualification :", faculty.qualification, START_X + 220, rowY);
    doc.moveDown(0.5);

    const rowY2 = doc.y;
    labelValue(doc, "Month :", bill.month, START_X, rowY2);
    labelValue(doc, "Year :", bill.year, START_X + 150, rowY2);
    labelValue(
        doc,
        "Date of Submission :",
        bill.submission_date ? new Date(bill.submission_date).toLocaleDateString("en-IN") : "",
        START_X + 260,
        rowY2
    );

    doc.moveDown(1);
};

// ----------------------------------------------------------------
// Attendance table
// ----------------------------------------------------------------
const drawTableHeader = (doc, startY) => {
    let x = START_X;
    doc.font("Helvetica-Bold").fontSize(9);

    COLUMNS.forEach(column => {
        doc.rect(x, startY, column.width, HEADER_ROW_HEIGHT).stroke();
        doc.text(column.title, x + 3, startY + 6, {
            width: column.width - 6,
            align: "center"
        });
        x += column.width;
    });

    return startY + HEADER_ROW_HEIGHT;
};

const drawAttendanceTable = (doc, billDetails, startY) => {
    let currentY = drawTableHeader(doc, startY);
    doc.font("Helvetica").fontSize(9);

    for (const detail of billDetails) {
        if (currentY + ROW_HEIGHT > PAGE_BOTTOM_LIMIT) {
            doc.addPage();
            currentY = 50;
            currentY = drawTableHeader(doc, currentY);
            doc.font("Helvetica").fontSize(9);
        }

        const dateDisplay = detail.attendance_date
            ? new Date(detail.attendance_date).toLocaleDateString("en-IN")
            : "";

        const row = [
            detail.course_name,
            detail.semester_number,
            detail.subject_name,
            dateDisplay,
            detail.hours,
            detail.rate_per_hour,
            Number(detail.amount).toFixed(2)
        ];

        let x = START_X;
        row.forEach((value, index) => {
            const column = COLUMNS[index];
            doc.rect(x, currentY, column.width, ROW_HEIGHT).stroke();
            doc.text(String(value ?? ""), x + 3, currentY + 6, {
                width: column.width - 6,
                align: "center",
                ellipsis: true
            });
            x += column.width;
        });

        currentY += ROW_HEIGHT;
    }

    doc.font("Helvetica-Oblique").fontSize(8).text(
        "*Total amount should not exceed the maximum limit of remuneration for a month.",
        START_X,
        currentY + 6
    );

    return currentY + 22;
};

// ----------------------------------------------------------------
// Totals, notes, undertaking, bank details, signatures
// ----------------------------------------------------------------
const drawFooter = (doc, bill, faculty, startY) => {
    const ESTIMATED_FOOTER_HEIGHT = 340;
    let currentY = startY;

    if (currentY + ESTIMATED_FOOTER_HEIGHT > 790) {
        doc.addPage();
        currentY = 50;
    }

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text(
        `Total Hours : ${bill.total_hours}    Total Amount : Rs.${Number(bill.total_amount).toFixed(2)}`,
        START_X,
        currentY
    );
    currentY += 16;

    doc.font("Helvetica").text(
        `(Amount in Words : ${bill.amount_in_words})`,
        START_X,
        currentY,
        { width: USABLE_WIDTH }
    );
    currentY += 26;

    doc.font("Helvetica-Bold").text("Note:", START_X, currentY);
    currentY += 15;

    doc.font("Helvetica").fontSize(9);
    const notes = [
        "A. Rate of Remuneration will be as per university rules.",
        "B. Faculty members are requested to complete all the above entries.",
        "C. Rates to be verified as per visiting faculty attendance register and signed by authorized person.",
        "D. Fill this form for theory/practical classes for every month.",
        "E. Faculty should not be paid excess amount of Rs 30,000/- PM from D.A.V.V.",
        "F. Verified visiting faculty teaching attendance details should be attached with this bill."
    ];
    notes.forEach(note => {
        doc.text(note, START_X + 8, currentY, { width: USABLE_WIDTH - 8 });
        currentY += 14;
    });

    currentY += 10;
    line(doc, currentY);
    currentY += 16;

    doc.font("Helvetica-Bold").fontSize(10).text("UNDERTAKING", START_X, currentY, { underline: true });
    currentY += 16;

    doc.font("Helvetica").fontSize(9).text(
        "I was directed and permitted by the Head to engage the above classes. For this I have submitted " +
        `this bill. I therefore, request you to deduct ${bill.tds_percent || "____"}% against Income Tax ` +
        "Returns from my payment. Further, I certify that the total amount received per month doesn't " +
        "exceed the maximum permissible limit of remuneration of any amount paid by D.A.V.V. which is " +
        "Rs. 30,000/- at present.",
        START_X,
        currentY,
        { width: USABLE_WIDTH, align: "justify" }
    );
    currentY = doc.y + 14;

    // Bank details box
    const boxHeight = 100;
    doc.rect(START_X, currentY, USABLE_WIDTH, boxHeight).stroke();
    let by = currentY + 8;
    doc.font("Helvetica").fontSize(9);
    doc.text(`Pan Card No. : ${faculty.pan_card_no || ""}`, START_X + 8, by);
    by += 16;
    doc.text(`A/c No. : ${faculty.account_no || ""}`, START_X + 8, by);
    by += 16;
    doc.text(`Bank Name : ${faculty.bank_name || ""}  (State Bank of India Compulsory)`, START_X + 8, by);
    by += 16;
    doc.text(`IFSC Code : ${faculty.ifsc_code || ""}`, START_X + 8, by);
    by += 16;
    doc.text(`Aadhaar No. : ${faculty.aadhaar_no || ""}`, START_X + 8, by);

    currentY += boxHeight + 30;

    doc.font("Helvetica").fontSize(9);
    doc.text("Name & Signature of Visiting Faculty", START_X, currentY);
    doc.text("Verified by Coordinator (Name & Signature)", START_X + 300, currentY);
    currentY += 30;

    doc.text(`Date : ${new Date().toLocaleDateString("en-IN")}`, START_X, currentY);
    currentY += 24;

    doc.text(
        `Received Payment of Rs. ${Number(bill.total_amount).toFixed(2)}`,
        START_X,
        currentY
    );
    doc.text("Signature Director/Head (Name & Seal)", START_X + 300, currentY);
    currentY += 20;

    doc.text("Cheque No. : ____________________", START_X, currentY);

    return currentY;
};

// ----------------------------------------------------------------
// Main entry point
// ----------------------------------------------------------------
const generateBillPDF = (bill, billDetails, faculty) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: "A4" });

            const uploadPath = path.join(__dirname, "../uploads/bills");
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            const pdfPath = path.join(uploadPath, `bill-${bill.bill_id}.pdf`);
            const stream = fs.createWriteStream(pdfPath);

            stream.on("finish", () => resolve(pdfPath));
            stream.on("error", reject);
            doc.on("error", reject);

            doc.pipe(stream);

            drawHeader(doc, bill, faculty);
            const tableEndY = drawAttendanceTable(doc, billDetails, doc.y);
            drawFooter(doc, bill, faculty, tableEndY);

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = {
    generateBillPDF
};