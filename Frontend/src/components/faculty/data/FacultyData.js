// Central mock data for the Faculty Portal module.
// In a real app this would come from an API layer.

export const currentFaculty = {
  name: "Dr. Meena Sharma",
  role: "Visiting Faculty",
  avatar: null, // set to an image URL to show a photo instead of initials
  session: "2024-25",
  month: "December 2024",
};

export const allocatedSubjects = [
  {
    code: "CS501",
    name: "Data Structures & Algorithms",
    course: "B.Tech (CS)",
    semester: "5th Semester",
    section: "A",
    type: "Theory",
  },
  {
    code: "CS502L",
    name: "DSA Laboratory",
    course: "B.Tech (CS)",
    semester: "5th Semester",
    section: "B",
    type: "Practical",
  },
];

export const attendanceHistory = [
  { sn: 1, date: "02/12/2024", code: "CS501", name: "Data Structures & Algorithms", type: "Theory", time: "09:00-10:00", hours: "1h", rate: 500, amount: 500 },
  { sn: 2, date: "04/12/2024", code: "CS502L", name: "DSA Laboratory", type: "Practical", time: "11:00-13:00", hours: "2h", rate: 300, amount: 600 },
  { sn: 3, date: "05/12/2024", code: "CS501", name: "Data Structures & Algorithms", type: "Theory", time: "09:00-10:00", hours: "1h", rate: 500, amount: 500 },
  { sn: 4, date: "09/12/2024", code: "CS501", name: "Data Structures & Algorithms", type: "Theory", time: "09:00-10:00", hours: "1h", rate: 500, amount: 500 },
  { sn: 5, date: "11/12/2024", code: "CS502L", name: "DSA Laboratory", type: "Practical", time: "11:00-13:00", hours: "2h", rate: 300, amount: 600 },
  { sn: 6, date: "12/12/2024", code: "CS501", name: "Data Structures & Algorithms", type: "Theory", time: "09:00-10:00", hours: "1h", rate: 500, amount: 500 },
  { sn: 7, date: "16/12/2024", code: "CS501", name: "Data Structures & Algorithms", type: "Theory", time: "09:00-10:00", hours: "1h", rate: 500, amount: 500 },
];

export const attendanceSummary = {
  classesSubmitted: 10,
  totalHours: "13 hrs",
  totalEarnings: "₹5,300",
};

export const billData = {
  billNo: "VFB/2024-25/DEC/001",
  monthYear: "December 2024",
  dateOfSubmission: "31/12/2024",
  uvfin: "UVFIN-2024-001",
  name: "Dr. Meena Sharma",
  address: "42, Vijay Nagar, Indore — 452010",
  qualification: "Ph.D. (Computer Science)",
  experience: "12 years",
  program: "B.Tech (Computer Science)",
  semester: "5th Semester",
  session: "2024-25",
  rows: [
    { sr: 1, date: "02/12/2024", code: "CS501", subject: "Data Structures & Algorithms", tp: "T", hrs: 1, rate: 500, amount: 500 },
    { sr: 2, date: "04/12/2024", code: "CS501", subject: "Data Structures & Algorithms", tp: "T", hrs: 1, rate: 500, amount: 500 },
    { sr: 3, date: "09/12/2024", code: "CS503", subject: "Operating Systems Lab", tp: "P", hrs: 2, rate: 500, amount: 1000 },
    { sr: 4, date: "11/12/2024", code: "CS501", subject: "Data Structures & Algorithms", tp: "T", hrs: 1, rate: 500, amount: 500 },
  ],
  totalAmount: 2500,
  amountInWords: "Two Thousand Five Hundred Rupees Only.",
  bank: {
    name: "State Bank of India",
    account: "XXXX XXXX 8901",
    ifsc: "SBIN00001",
    pan: "ABCDE1234F",
  },
};

// Calendar events for Mark Attendance grid view (Dec 2024)
export const decemberEvents = {
  2: [{ code: "CS-502", time: "10:00 AM", status: "Marked" }],
  3: [{ code: "CS-504", time: "12:30 PM", status: "Cancelled" }],
};
