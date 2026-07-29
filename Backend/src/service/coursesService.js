const { Course, Section, Subject } = require('../Schema');

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

async function semesterSubjectShow(course_id, semester_id) {
    try {
        const subjects = await Subject.findAll({
            where: {
                course_id: course_id,
                semester_id: semester_id,
                is_active: true
            },
            order: [['subject_code', 'ASC']]
        });
        return subjects;
    } catch (error) {
        console.log(error);
        throw new Error('not able to fetch subjects for the given course and semester');
    }
}

async function deleteSubjects(course_id, semester_id, subject_id) {
    try {
        const result = await Subject.findOne({
            where: {
                course_id: course_id,
                semester_id: semester_id,
                subject_id: subject_id
            }
        });
        if(!result){
            throw new Error('not able to find subject');
        }
        await Subject.destroy({
            where: {
                course_id: course_id,
                semester_id: semester_id,
                subject_id: subject_id
            }
        });
        return result;
    } catch (error) {
        console.log(error);
        throw new Error('not able to delete subject');
    }
}

async function addSubjects(course_id, semester_id, Details) {
    try {
        const result = await Subject.create({
            course_id: course_id,
            semester_id: semester_id,
            subject_code: Details.subject_code,
            subject_name: Details.subject_name
        });
        return result;
    } catch (error) {
        console.log(error);
        throw new Error('not able to add subject');
    }
}


module.exports = {
    showDashboard,
    showDashboardOfCourse,
    addSections,
    updateIncharge,
    semesterSubjectShow,
    deleteSubjects,
    addSubjects
};