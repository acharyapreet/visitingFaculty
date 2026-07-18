const fs = require('fs');
const path = require('path');
const { Course, Semester, Section, Subject } = require('../Schema');

// Helper function to parse CSV lines cleanly handling quotes
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // RegEx to handle CSV values with commas inside quotes
        const values = [];
        let insideQuote = false;
        let currentValue = '';

        for (let charIndex = 0; charIndex < line.length; charIndex++) {
            const char = line[charIndex];
            if (char === '"' || char === "'") {
                insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
                values.push(currentValue.trim().replace(/^["']|["']$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/^["']|["']$/g, ''));

        // Map row to object using headers
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] !== undefined ? values[index] : '';
        });
        rows.push(row);
    }

    return rows;
}

// Map known course metadata (total semesters & sections)
const defaultCourseMeta = {
    'C1': { name: 'MCA', semCount: 10, sections: ['A', 'B'] },
    'C2': { name: 'Mtech(it)', semCount: 10, sections: ['A', 'B'] },
    'C3': { name: 'Mtech(cs)', semCount: 10, sections: [] },
    'C4': { name: 'MBA(ms)', semCount: 10, sections: ['A', 'B'] },
    'C5': { name: 'MBA(ms)', semCount: 4, sections: ['A', 'B', 'C'] },
    'C6': { name: 'Mtech(apr)', semCount: 4, sections: [] },
    'C7': { name: 'Mtech(eship)', semCount: 4, sections: [] },
    'C8': { name: 'bcom(honurs)', semCount: 8, sections: [] },
    'C9': { name: 'MBA(tm)', semCount: 10, sections: [] }
};

/**
 * Main importer function to process CSV content or file path
 * @param {Object} options - { csvText, filePath }
 */
async function importSubjectsFromCSV(options = {}) {
    let rawCSVText = '';

    if (options.csvText) {
        rawCSVText = options.csvText;
    } else if (options.filePath) {
        const absolutePath = path.isAbsolute(options.filePath)
            ? options.filePath
            : path.join(__dirname, '..', options.filePath);
        if (fs.existsSync(absolutePath)) {
            rawCSVText = fs.readFileSync(absolutePath, 'utf8');
        } else {
            throw new Error(`CSV file not found at path: ${absolutePath}`);
        }
    } else {
        // Default fallback to data directory for any .csv file (e.g., Subject.csv, subjects.csv)
        const dataDir = path.join(__dirname, '../data');
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir);
            const csvFile = files.find(f => f.toLowerCase().endsWith('.csv'));
            if (csvFile) {
                const targetPath = path.join(dataDir, csvFile);
                console.log(`Found CSV file: ${targetPath}`);
                rawCSVText = fs.readFileSync(targetPath, 'utf8');
            }
        }

        if (!rawCSVText) {
            console.log("No CSV content or default CSV file found. Skipping CSV auto-import.");
            return { success: false, message: "No CSV file provided or found." };
        }
    }

    const rows = parseCSV(rawCSVText);
    if (rows.length === 0) {
        return { success: true, message: "CSV file is empty.", importedCount: 0 };
    }

    console.log(`Parsed ${rows.length} rows from CSV. Starting database import...`);

    let countImported = 0;

    for (const row of rows) {
        // Flexible key matching for column names
        const courseCode = row['Course_ID'] || row['Course_Code'] || row['Course_'] || row['course_code'] || row['CourseCode'] || row['Course_id'];
        const semIdStr = row['Sem_Id'] || row['semester_id'] || row['Sem_ID'] || row['sem_id'] || row['Semester'];
        const subCode = row['Sub_Code'] || row['subject_code'] || row['Sub_code'] || row['SubjectCode'];
        const subName = row['Sub_Name'] || row['subject_name'] || row['Sub_name'] || row['SubjectName'];

        if (!courseCode || !semIdStr || !subCode || !subName) {
            continue; // Skip invalid or header-only rows
        }

        const semNum = parseInt(semIdStr, 10);
        if (isNaN(semNum)) continue;

        const cleanCourseCode = courseCode.trim();
        const cleanSubCode = subCode.trim();
        const cleanSubName = subName.trim();

        // 1. Get or create Course
        const meta = defaultCourseMeta[cleanCourseCode] || { name: cleanCourseCode, semCount: Math.max(10, semNum), sections: [] };
        
        let [course] = await Course.findOrCreate({
            where: { course_code: cleanCourseCode },
            defaults: {
                course_code: cleanCourseCode,
                course_name: meta.name,
                total_semesters: meta.semCount,
                is_active: true
            }
        });

        // Ensure semesters for course exist up to semCount
        for (let s = 1; s <= Math.max(meta.semCount, semNum); s++) {
            await Semester.findOrCreate({
                where: { course_id: course.course_id, semester_number: s },
                defaults: {
                    course_id: course.course_id,
                    semester_number: s,
                    is_active: true
                }
            });
        }

        // Ensure sections exist if meta specifies sections
        if (meta.sections && meta.sections.length > 0) {
            for (const secName of meta.sections) {
                await Section.findOrCreate({
                    where: { course_id: course.course_id, section_name: secName },
                    defaults: {
                        course_id: course.course_id,
                        section_name: secName,
                        is_active: true
                    }
                });
            }
        }

        // 2. Find Semester record
        const semester = await Semester.findOne({
            where: { course_id: course.course_id, semester_number: semNum }
        });
        if (!semester) continue;

        // 3. Upsert Subject
        const existingSubject = await Subject.findOne({
            where: {
                course_id: course.course_id,
                semester_id: semester.semester_id,
                subject_code: cleanSubCode
            }
        });

        if (!existingSubject) {
            await Subject.create({
                subject_code: cleanSubCode,
                subject_name: cleanSubName,
                course_id: course.course_id,
                semester_id: semester.semester_id,
                is_active: true
            });
        } else {
            await existingSubject.update({ subject_name: cleanSubName });
        }

        countImported++;
    }

    console.log(`Successfully imported/updated ${countImported} subjects from CSV!`);
    return {
        success: true,
        message: `Successfully processed CSV and updated ${countImported} subjects.`,
        importedCount: countImported
    };
}

module.exports = { parseCSV, importSubjectsFromCSV };
