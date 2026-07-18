const { importSubjectsFromCSV } = require('./csvImporter');

async function seedSubjects() {
    try {
        console.log("Delegating database seeding to CSV Importer...");
        return await importSubjectsFromCSV();
    } catch (error) {
        console.error("Error in seedSubjects:", error);
        throw error;
    }
}

module.exports = { seedSubjects };
