const { User, Course, Semester, Section, Subject, Allocation } = require('../Schema');
const { Op } = require('sequelize');

class AllocationService {
    // 1. Live Faculty Search
    async searchFaculty(query) {
        const whereClause = {
            role: 'faculty',
            is_approved: true,
            is_active: true
        };

        if (query && query.trim()) {
            whereClause.full_name = { [Op.like]: `%${query.trim()}%` };
        }

        const facultyList = await User.findAll({
            where: whereClause,
            attributes: ['user_id', 'full_name', 'email', 'phone_number'],
            limit: 20
        });

        return facultyList;
    }

    // 2. Get All Courses
    async getCourses() {
        const courses = await Course.findAll({
            where: { is_active: true },
            order: [['course_code', 'ASC']]
        });
        return courses;
    }

    // 3. Get Sections by Course
    async getCourseSections(courseId) {
        const sections = await Section.findAll({
            where: { course_id: courseId, is_active: true },
            order: [['section_name', 'ASC']]
        });
        return sections;
    }

    // 4. Get Semesters by Course
    async getCourseSemesters(courseId) {
        const semesters = await Semester.findAll({
            where: { course_id: courseId, is_active: true },
            order: [['semester_number', 'ASC']]
        });
        return semesters;
    }

    // 5. Get Subjects by Course and Semester
    async getSubjects(courseId, semesterId) {
        const subjects = await Subject.findAll({
            where: {
                course_id: courseId,
                semester_id: semesterId,
                is_active: true
            },
            order: [['subject_code', 'ASC']]
        });
        return subjects;
    }

    // 6. Create Subject Allocation
    async createAllocation(data, adminUserId) {
        const {
            user_id,
            course_id,
            semester_id,
            section_id,
            subject_id,
            session_type,
            rate_per_hour,
            academic_year
        } = data;

        if (!user_id || !course_id || !semester_id || !subject_id || !session_type || !rate_per_hour || !academic_year) {
            throw new Error('All required fields (Faculty, Course, Semester, Subject, Type, Rate, Academic Year) must be provided.');
        }

        const allocation = await Allocation.create({
            user_id,
            course_id,
            semester_id,
            section_id: section_id || null,
            subject_id,
            session_type,
            rate_per_hour,
            academic_year,
            created_by: adminUserId,
            is_active: true
        });

        return allocation;
    }

    // 7. Get All Allocations with Relations
    async getAllocations() {
        const allocations = await Allocation.findAll({
            where: { is_active: true },
            include: [
                { model: User, attributes: ['user_id', 'full_name', 'email'] },
                { model: Course, attributes: ['course_id', 'course_code', 'course_name'] },
                { model: Semester, attributes: ['semester_id', 'semester_number'] },
                { model: Section, attributes: ['section_id', 'section_name'] },
                { model: Subject, attributes: ['subject_id', 'subject_code', 'subject_name'] }
            ],
            order: [['allocation_id', 'DESC']]
        });

        return allocations;
    }

    // 8. Delete Allocation
    async deleteAllocation(allocationId) {
        const allocation = await Allocation.findByPk(allocationId);
        if (!allocation) {
            throw new Error('Allocation record not found.');
        }

        await allocation.destroy();
        return { success: true, message: 'Allocation deleted successfully.' };
    }
}

module.exports = new AllocationService();
