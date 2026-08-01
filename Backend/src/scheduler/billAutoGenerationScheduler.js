/**
 * billAutoGenerationScheduler.js
 *
 * Runs automatically at 23:55 on the last day of every month (IST).
 * For each active faculty member who has attendance records for that month
 * and does NOT already have a bill → auto-generates the bill.
 *
 * Cron expression:  55 23 28-31 * *
 *   ┌─ minute  (55)
 *   │  ┌─ hour (23)
 *   │  │  ┌─ day-of-month (28-31 — handler checks if it's truly the last day)
 *   │  │  │       ┌─ month (every month)
 *   │  │  │       │  ┌─ day-of-week (every day)
 *   55 23 28-31 * *
 *
 * Schedule timeline examples:
 *   Jan 31, 23:55  → generates bills for January
 *   Feb 28/29, 23:55 → generates bills for February
 *   Jul 31, 23:55  → generates bills for July
 */

const cron = require("node-cron");
const path = require("path");
const fs   = require("fs");

const { generateBill }     = require("../service/billService");
const { User, Attendance } = require("../Schema");

// ─── Month name array (index 0 = January) ────────────────────────────────────
const MONTH_NAMES = [
    "January", "February", "March",    "April",
    "May",     "June",     "July",     "August",
    "September","October", "November", "December"
];

// ─── Check if today is the last day of the current month ─────────────────────
const isLastDayOfMonth = () => {
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    // If tomorrow is the 1st, today is the last day
    return tomorrow.getDate() === 1;
};

// ─── Get current month name and year ─────────────────────────────────────────
const getCurrentMonthAndYear = () => {
    const now = new Date();
    return {
        month: MONTH_NAMES[now.getMonth()],
        year:  now.getFullYear()
    };
};

// ─── Log directory & file ─────────────────────────────────────────────────────
const LOG_DIR  = path.join(__dirname, "../uploads/scheduler-logs");
const LOG_FILE = path.join(LOG_DIR, "bill-auto-gen.log");

const ensureLogDir = () => {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
};

const writeLog = (message) => {
    ensureLogDir();
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, line, "utf8");
    console.log(`[BillAutoGenScheduler] ${message}`);
};

// ─── Core job function ────────────────────────────────────────────────────────
const runBillAutoGenerationJob = async () => {
    const { month, year } = getCurrentMonthAndYear();

    writeLog(`========================================`);
    writeLog(`JOB STARTED — Auto-generating bills for ${month} ${year}`);

    try {
        // Step 1: Find all active, approved faculty
        const activeFaculty = await User.findAll({
            where: {
                role:        "faculty",
                is_active:   true,
                is_approved: true
            },
            attributes: ["user_id", "full_name", "uvfin"]
        });

        writeLog(`Found ${activeFaculty.length} active faculty member(s).`);

        if (activeFaculty.length === 0) {
            writeLog(`No active faculty found. Job finished.`);
            writeLog(`========================================`);
            return;
        }

        // Step 2: For each faculty check attendance → generate bill if not already done
        let generated        = 0;
        let skippedNoBill    = 0;
        let skippedDuplicate = 0;
        let errors           = 0;

        for (const faculty of activeFaculty) {
            try {
                // Check attendance exists for this month
                const attendanceCount = await Attendance.count({
                    where: { user_id: faculty.user_id, month, year }
                });

                if (attendanceCount === 0) {
                    writeLog(`  ↷ SKIP (no attendance) — ${faculty.full_name} [ID: ${faculty.user_id}]`);
                    skippedNoBill++;
                    continue;
                }

                // generateBill internally checks for duplicate bills
                await generateBill(faculty.user_id, month, year);

                writeLog(`  ✔ GENERATED — ${faculty.full_name} [ID: ${faculty.user_id}]`);
                generated++;

            } catch (err) {
                if (err.message === "Bill already generated for this month.") {
                    writeLog(`  ↷ SKIP (bill exists) — ${faculty.full_name} [ID: ${faculty.user_id}]`);
                    skippedDuplicate++;
                } else {
                    writeLog(`  ✘ ERROR — ${faculty.full_name} [ID: ${faculty.user_id}]: ${err.message}`);
                    errors++;
                }
            }
        }

        writeLog(`SUMMARY: Generated=${generated} | No-Attendance=${skippedNoBill} | Already-Billed=${skippedDuplicate} | Errors=${errors}`);
        writeLog(`JOB FINISHED — ${month} ${year}`);
        writeLog(`========================================`);

        return { month, year, generated, skippedNoBill, skippedDuplicate, errors };

    } catch (err) {
        writeLog(`CRITICAL ERROR: ${err.message}`);
        writeLog(`JOB FAILED`);
        writeLog(`========================================`);
        throw err;
    }
};

// ─── Register the cron job ────────────────────────────────────────────────────
/**
 * Schedule: 55 23 28-31 * *
 *   → Fires on days 28-31 at 23:55 PM (IST)
 *   → isLastDayOfMonth() guard ensures it only truly runs on the last day.
 *
 * Why 28-31? Because months end on 28, 29, 30, or 31. The guard function
 * checks if tomorrow is the 1st — so Feb 28 (non-leap) passes, Apr 31 never
 * fires (day doesn't exist), and Jan 28 is correctly skipped.
 */
const startBillAutoGenerationScheduler = () => {
    cron.schedule(
        "55 23 28-31 * *",
        async () => {
            if (!isLastDayOfMonth()) {
                // e.g., Jan 28/29/30 are NOT the last day → skip
                return;
            }
            await runBillAutoGenerationJob();
        },
        {
            scheduled: true,
            timezone: "Asia/Kolkata"   // IST
        }
    );

    writeLog("Scheduler registered — will auto-generate bills at 23:55 IST on the last day of every month.");
};

module.exports = {
    startBillAutoGenerationScheduler,
    runBillAutoGenerationJob   // exported so API can trigger it manually
};
