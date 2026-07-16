// Mock data — replace with real API calls (see src/api) when wiring to backend.

export const initialPendingFaculty = [
  {
    id: "p1",
    name: "Prof. Rajesh Patel",
    phone: "9765432109",
    uvfin: "UVFIN-2024-002",
    qualification: "M.Tech (Electronics)",
    department: "Computer Engineering",
    regDate: "Dec 12, 2024",
    appearingSince: "Oct 24, 2023",
    status: "Pending Verification",
    personal: {
      fullName: "Rajesh Kumar Patel",
      phone: "+91 98765 43210",
      email: "rajesh.patel@iips.edu.in",
      dob: "15th July 1978",
      address: "402, Academic Enclave, North Campus University Road, Indore, MP - 452001",
    },
    academic: {
      highestQualification: "Ph.D. in Mobile Computing",
      department: "Computer Engineering",
      experience: "18 Years",
      specialization: "Wireless Networks, VLSI",
      previousInstitution: "SGSITS, Indore (Dept. of Electronics)",
    },
  },
  {
    id: "p2",
    name: "Dr. Priya Singh",
    phone: "9432109876",
    uvfin: "UVFIN-2024-005",
    qualification: "Ph.D. (Chemistry)",
    department: "Applied Chemistry",
    regDate: "Dec 14, 2024",
    appearingSince: "Nov 02, 2023",
    status: "Pending Verification",
    personal: {
      fullName: "Priya Singh",
      phone: "+91 94321 09876",
      email: "priya.singh@iips.edu.in",
      dob: "3rd March 1985",
      address: "12, Faculty Quarters, DAVV Campus, Indore, MP - 452001",
    },
    academic: {
      highestQualification: "Ph.D. in Organic Chemistry",
      department: "Applied Chemistry",
      experience: "9 Years",
      specialization: "Polymer Chemistry",
      previousInstitution: "Vikram University, Ujjain",
    },
  },
];

export const registeredFaculty = [
  {
    uvfin: "UVFIN-2024-001",
    name: "Dr. Meena Sharma",
    qualification: "Ph.D. (Computer Science)",
    status: "Active",
    allocateSubject: "Allocated",
  },
  {
    uvfin: "UVFIN-2024-002",
    name: "Prof. Rajesh Patel",
    qualification: "M.Tech (Electronics)",
    status: "Active",
    allocateSubject: "Allocate Subject",
  },
  {
    uvfin: "UVFIN-2024-003",
    name: "Dr. Sunita Verma",
    qualification: "Ph.D. (Mathematics)",
    status: "Active",
    allocateSubject: "Allocated",
  },
  {
    uvfin: "UVFIN-2024-004",
    name: "Mr. Ashok Dubey",
    qualification: "M.Sc. (Physics)",
    status: "Inactive",
    allocateSubject: "Allocate Subject",
  },
  {
    uvfin: "UVFIN-2024-005",
    name: "Dr. Priya Singh",
    qualification: "Ph.D. (Chemistry)",
    status: "Active",
    allocateSubject: "Allocated",
  },
];

export const initialAllocations = [
  {
    id: "a1",
    facultyId: "UVFIN-2024-001",
    facultyName: "Dr. Meena Sharma",
    course: "M.Tech (CS)",
    semester: "5th Sem",
    session: "2024-25",
    subjectCode: "CS501",
    subjectName: "Data Structures & Alg...",
    type: "THEORY",
  },
  {
    id: "a2",
    facultyId: "UVFIN-2024-001",
    facultyName: "Dr. Meena Sharma",
    course: "M.Tech (CS)",
    semester: "5th Sem",
    session: "2024-25",
    subjectCode: "CS502L",
    subjectName: "DSA LAB",
    type: "PRACTICAL",
  },
];