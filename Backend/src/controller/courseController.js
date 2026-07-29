const { showDashboard, showDashboardOfCourse, addSections, updateIncharge, semesterSubjectShow, deleteSubjects, addSubjects } = require("../service/coursesService");

async function showDashboardController(req, res) {
    try {
        const result = await showDashboard();
        return res.json({
            success: true,
            message: 'dashboard',
            data: result
        });
    } catch (error) {
        console.error('dashboard Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to show dashboard.'
        });
    }
}

async function showDashboardOfCourseController(req, res) {
    try {
        const result = await showDashboardOfCourse(req.params.course_id);
        return res.json({
            success: true,
            message: 'detail',
            data: result
        });
    } catch (error) {
        console.error('course Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to show course.'
        });
    }
}

async function addSectionsController(req, res) {
    try {
        const result = await addSections(req.body.section_name, req.params.course_id);
        return res.json({
            success: true,
            message: 'detail',
            data: result
        });
    } catch (error) {
        console.error('section addition Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to add section.'
        });
    }
}

async function updateInchargeController(req, res) {
    try {
        const result = await updateIncharge( req.body.program_incharge, req.params.course_id);
        return res.status(200).json({
            success: true,
            message: 'Program Incharge updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update Program Incharge Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to update Program Incharge.'
        });
    }
}

async function showSubjectController(req, res) {
    try {
        const result = await semesterSubjectShow(req.params.course_id, req.params.semester_id);
        return res.json({
            success: true,
            message: 'subjects',
            data: result
        });
    } catch (error) {
        console.error('subjects Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to show subjects.'
        });
    }
}

async function deleteSubjectController(req, res) {
    try {
        const result = await deleteSubjects(req.params.course_id, req.params.semester_id, req.params.subject_id);
        return res.json({
            success: true,
            message: 'subject deleted',
            data: result
        });
    } catch (error) {
        console.error('subject deletion Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to delete subject.'
        });
    }
}
async function addSubjectController(req, res) {
    try {
        const result = await addSubjects(req.params.course_id, req.params.semester_id, req.body);
        return res.json({
            success: true,
            message: 'subject added',
            data: result
        });
    } catch (error) {
        console.error('subject addition Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to add subject.'
        });
    }
}

module.exports = {
    showDashboardController,
    showDashboardOfCourseController,
    addSectionsController,
    updateInchargeController,
    showSubjectController,
    addSubjectController,
    deleteSubjectController
}