const { Course, Section } = require('../Schema');

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


module.exports = {
    showDashboard,
    showDashboardOfCourse,
    addSections,
    updateIncharge
};