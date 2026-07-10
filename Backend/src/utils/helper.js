const User = require('../Schema/userSchema');
const { Op } = require('sequelize');

async function generateAdminId() {
    try {
        const currentYear = new Date().getFullYear();
        const yearShort = currentYear.toString().slice(-2);

        //count how many admins registered in this year
        const adminCount = await User.count({
            where: {
                role: 'admin',
                is_approved: true,
                created_at: {
                    [Op.between]: [
                        new Date(currentYear, 0, 1),
                        new Date(currentYear, 11, 31)
                    ]
                }
            }
        });
        const sequence = String(adminCount + 1).padStart(3, '0');
        return `AD-2k${yearShort}-${sequence}`;
    } catch (error) {
        console.log("error in getting admin Id", error);
        const timestamp = Date.now().toString().slice(-6);
        return `AD-${timestamp}`;

    }
};

async function generateFacultyId() {
    try {
        const currentYear = new Date().getFullYear();
        const yearShort = currentYear.toString().slice(-2);

        //count how many faculty registered in this year
        const facultyCount = await User.count({
            where: {
                role: 'faculty',
                is_approved: true,
                created_at: {
                    [Op.between]: [
                        new Date(currentYear, 0, 1),
                        new Date(currentYear, 11, 31)
                    ]
                }
            }
        });
        const sequence = String(facultyCount + 1).padStart(3, '0');
        return `VF-2k${yearShort}-${sequence}`;
    } catch (error) {
        console.log("error in getting faculty Id", error);
        const timestamp = Date.now().toString().slice(-6);
        return `VF-${timestamp}`;

    }
} const generateUserId = async (role) => {
    if (role === 'admin') {
        return await generateAdminId();
    } else if (role === 'faculty') {
        return await generateFacultyId();
    } else {
        // Super admin or other
        const timestamp = Date.now().toString().slice(-6);
        return `${role.toUpperCase()}-${timestamp}`;
    }
};
function numberToWords(num) {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convert = (n) => {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    return convert(Math.round(num)) + ' Rupees Only';
};


const getMonthName = (monthNumber) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
};
const isValidDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
};
const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}-${nextYear.toString().slice(-2)}`;
};
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

module.exports = {
    generateAdminId,
    generateFacultyId,
    generateUserId,
    numberToWords,
    getMonthName,
    isValidDateRange,
    getCurrentAcademicYear,
    formatDate
}