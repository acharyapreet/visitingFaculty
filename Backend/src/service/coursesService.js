const { Course, Section, Semester, Subject } = require('../Schema');
const { Op } = require('sequelize');

async function showDashboard() {
    try{
        const courses = await Course.findAll({
            include: [
                {
                    model: Section,
                    attributes: ['section_id', 'section_name'],
                    required: false
                }
            ],
            order: [['course_id', 'ASC']]
        });

        return courses;
    }catch(error){
        console.log(error);
        throw new Error('not able to fetch dashboard');
    }
}

async function showDashboardOfCourse(course_id) {
    try{
        const courses = await Course.findAll({
            where: {course_id},
            include: [
                {
                    model: Section,
                    attributes: ['section_id', 'section_name'],
                    required: false
                }
            ],
            order: [['course_id', 'ASC']]
        });

        return courses;
    }catch(error){
        console.log(error);
        throw new Error('not able to fetch course');
    }
}

async function addSections(section_name, course_id) {
    try {
        const course = await Section.create({
            section_name: section_name,
            course_id: course_id
        });
    return course;
    } catch (error) {
        console.log(error);
        throw new Error('not able to add section');
    }

}
async function updateIncharge(program_incharge, course_id) {
    try {
        const result = await Course.findByPk(course_id);
        await result.update({
            program_incharge: program_incharge
        });
        return {message: "Program Incharge updated"};
    } catch (error) {
        console.log(error);
        throw new Error('not able to update Program Incharge');
    }
}

async function getSubjectsForCourse(course_id, semester_id) {
    try {
        let targetSemesterId = semester_id;
        const semRecord = await Semester.findOne({
            where: {
                course_id: course_id,
                [Op.or]: [
                    { semester_id: semester_id },
                    { semester_number: semester_id }
                ]
            }
        });
        if (semRecord) {
            targetSemesterId = semRecord.semester_id;
        }

        const subjects = await Subject.findAll({
            where: {
                course_id: course_id,
                semester_id: targetSemesterId,
                is_active: true
            },
            order: [['subject_code', 'ASC']]
        });
        return subjects;
    } catch (error) {
        console.log(error);
        throw new Error('not able to fetch subjects');
    }
}

async function addSubjectToCourse(course_id, semester_id, subject_code, subject_name) {
    try {
        let [semRecord] = await Semester.findOrCreate({
            where: {
                course_id: course_id,
                semester_number: semester_id
            },
            defaults: {
                course_id: course_id,
                semester_number: semester_id,
                is_active: true
            }
        });

        const subject = await Subject.create({
            subject_code: subject_code.trim(),
            subject_name: subject_name.trim(),
            course_id: course_id,
            semester_id: semRecord.semester_id,
            is_active: true
        });

        return subject;
    } catch (error) {
        console.log(error);
        throw new Error('not able to add subject');
    }
}

async function deleteSubjectFromCourse(course_id, semester_id, subject_id) {
    try {
        const subject = await Subject.findByPk(subject_id);
        if (!subject) {
            throw new Error('Subject not found');
        }
        await subject.destroy();
        return { message: "Subject deleted successfully" };
    } catch (error) {
        console.log(error);
        throw new Error('not able to delete subject');
    }
}

module.exports = {
    showDashboard,
    showDashboardOfCourse,
    addSections,
    updateIncharge,
    getSubjectsForCourse,
    addSubjectToCourse,
    deleteSubjectFromCourse
};