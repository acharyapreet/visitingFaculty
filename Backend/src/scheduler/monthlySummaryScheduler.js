/**
 * monthlySummaryScheduler.js
 *
 * Runs automatically on the 1st of every month at 00:05 AM.
 * It generates and saves the Monthly Summary PDF for ALL active courses
 * for the PREVIOUS month and logs the result.
 *
 * Cron expression:  5 0 1 * *
 *   ┌─ minute (5)
 *   │ ┌─ hour (0 = midnight)
 *   │ │ ┌─ day of month (1 = 1st)
 *   │ │ │ ┌─ month (every month)
 *   │ │ │ │ ┌─ day of week (every day)
 *   5 0 1 * *
 */

const cron = require("node-cron");
const path = require("path");
const fs   = require("fs");

const {
    getAllCoursesMonthlySummary,
    downloadMonthlySummaryPDF
} = require("../service/monthlySummaryService");

const { Course } = require("../Schema");

// ─── Month name array (index 0 = January) ───────────────────────────────────
const MONTH_NAMES = [
    "January", "February", "March",    "April",
    "May",     "June",     "July",     "August",
    "September","October", "November", "December"
];

// ─── Derive previous month + year ───────────────────────────────────────────
const getPreviousMonthAndYear = () => {
    const now   = new Date();
    const month = now.getMonth();          // 0-indexed current month
    const year  = now.getFullYear();

    if (month === 0) {
        // January → previous month is December of last year
        return { month: "December", year: year - 1 };
    }
    return { month: MONTH_NAMES[month - 1], year };
};

// ─── Ensure log directory exists ─────────────────────────────────────────────
const LOG_DIR  = path.join(__dirname, "../uploads/scheduler-logs");
const LOG_FILE = path.join(LOG_DIR, "monthly-summary-cron.log");

const ensureLogDir = () => {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
};

// ─── Append to log file ──────────────────────────────────────────────────────
const writeLog = (message) => {
    ensureLogDir();
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, line, "utf8");
    console.log(`[MonthlySummaryScheduler] ${message}`);
};

// ─── Core job function ───────────────────────────────────────────────────────
const runMonthlySummaryJob = async () => {
    const { month, year } = getPreviousMonthAndYear();

    writeLog(`========================================`);
    writeLog(`JOB STARTED — Generating summary for ${month} ${year}`);

    try {
        // ── Step 1: Aggregate summary data for all courses ──────────────────
        const summaryData = await getAllCoursesMonthlySummary(month, String(year));

        if (!summaryData.courses || summaryData.courses.length === 0) {
            writeLog(`WARNING: No bill data found for ${month} ${year}. PDF generation skipped.`);
            writeLog(`JOB FINISHED (no data)`);
            return;
        }

        writeLog(`Found ${summaryData.courses.length} course(s) with data.`);
        writeLog(`Grand Total for ${month} ${year}: ₹${summaryData.grandTotal}`);

        // ── Step 2: Generate one PDF per active course ───────────────────────
        const courses = await Course.findAll({ where: { is_active: true } });

        let successCount = 0;
        let errorCount   = 0;

        for (const course of courses) {
            try {
                const pdfPath = await downloadMonthlySummaryPDF(
                    month,
                    String(year),
                    String(course.course_id)
                );
                writeLog(`✔ PDF saved for course "${course.course_name}" → ${pdfPath}`);
                successCount++;
            } catch (courseErr) {
                // Some courses may have no data for that month — log and continue
                writeLog(`✘ Skipped course "${course.course_name}": ${courseErr.message}`);
                errorCount++;
            }
        }

        writeLog(`JOB FINISHED — ${successCount} PDF(s) generated, ${errorCount} skipped.`);
        writeLog(`========================================`);

    } catch (err) {
        writeLog(`ERROR: ${err.message}`);
        writeLog(`JOB FAILED`);
        writeLog(`========================================`);
    }
};

// ─── Register the cron job ───────────────────────────────────────────────────
/**
 * Schedule: 5 0 1 * *
 *   → Runs at 00:05 AM on the 1st day of every month
 *   → At that point "previous month" is automatically computed
 *
 * Example timeline:
 *   Aug 1, 00:05 AM  → generates summary for July
 *   Sep 1, 00:05 AM  → generates summary for August
 *   Jan 1, 00:05 AM  → generates summary for December (previous year)
 */
const startMonthlySummaryScheduler = () => {
    cron.schedule(
        "5 0 1 * *",          // At 00:05 on the 1st of every month
        runMonthlySummaryJob,
        {
            scheduled: true,
            timezone: "Asia/Kolkata"   // IST — change if needed
        }
    );

    writeLog("Scheduler registered — will run at 00:05 AM on the 1st of every month (IST).");
};

module.exports = {
    startMonthlySummaryScheduler,
    runMonthlySummaryJob   // exported so you can trigger it manually for testing
};
