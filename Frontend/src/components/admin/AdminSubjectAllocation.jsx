import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileCheck, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle,
  FilePlus,
  BookOpen
} from 'lucide-react';

export default function AdminSubjectAllocation() {
  // 1. Data State (Ready for Backend Integration)
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Form State
  const [formData, setFormData] = useState({
    facultyId: '',
    courseName: '',
    semester: '5th Sem', // Default for mobile pills
    session: '2024-25',
    subjectCode: '',
    subjectName: '',
    type: 'THEORY', // Default for mobile pills
    rate: ''
  });

  // 3. Simulated API Fetch (Parallel Development)
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        setIsLoading(true);
        // Backend dev will replace this setTimeout with:
        // const response = await api.get('/admin/allocations');
        // setAllocations(response.data);
        
        setTimeout(() => {
          setAllocations([
            { id: 1, facultyName: 'Dr. Meena', facultyId: '001', course: 'M.Tech (CS)', semester: '5th Sem', session: '2024-25', subjectCode: 'CS501', subjectName: 'Data Structures & Alg...', type: 'THEORY' },
            { id: 2, facultyName: 'Dr. Meena', facultyId: '001', course: 'M.Tech (CS)', semester: '5th Sem', session: '2024-25', subjectCode: 'CS502L', subjectName: 'DSA LAB', type: 'PRACTICAL' }
          ]);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Failed to fetch allocations", error);
        setIsLoading(false);
      }
    };
    fetchAllocations();
  }, []);

  // 4. Input Handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Special handler for mobile pill buttons
  const handlePillChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Backend dev will replace this with: await api.post('/admin/allocate', formData);
      setTimeout(() => {
        alert("Subject successfully allocated!");
        setFormData({ ...formData, subjectCode: '', subjectName: '', rate: '' });
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error submitting form", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#F8F9FB] p-4 sm:p-6 lg:p-8 relative pb-24">
      
      {/* Top Header Section */}
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subject Allocation</h1>
          <p className="mt-1 text-sm text-slate-500">Assign courses and subjects to faculty members</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search faculty or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        
        {/* Left Column: Form */}
        <div className="xl:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-[#004DD2]" />
              <h2 className="text-lg font-bold text-slate-900">Assign New Subject</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Select Faculty</label>
                <select 
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
                >
                  <option value="">Select Faculty...</option>
                  <option value="001">Dr. Meena (001)</option>
                  <option value="002">Dr. Amit (002)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Course Name</label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Semester</label>
                  {/* Desktop Dropdown */}
                  <select 
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="hidden w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2] sm:block"
                  >
                    <option value="3rd Sem">3rd Sem</option>
                    <option value="4th Sem">4th Sem</option>
                    <option value="5th Sem">5th Sem</option>
                    <option value="6th Sem">6th Sem</option>
                  </select>
                  {/* Mobile Pills */}
                  <div className="grid grid-cols-2 gap-2 sm:hidden">
                    {['3rd Sem', '4th Sem', '5th Sem', '6th Sem'].map(sem => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => handlePillChange('semester', sem)}
                        className={`rounded-lg py-2 text-xs font-semibold transition-colors ${formData.semester === sem ? 'bg-[#004DD2] text-white' : 'border border-slate-300 text-slate-600'}`}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Academic Session</label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject Code</label>
                <input
                  type="text"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. CS501"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject Name</label>
                <input
                  type="text"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  required
                  placeholder="Full subject name"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                {/* Desktop Dropdown */}
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="hidden w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2] sm:block"
                >
                  <option value="THEORY">Theory</option>
                  <option value="PRACTICAL">Practical</option>
                </select>
                {/* Mobile Pills */}
                <div className="grid grid-cols-2 gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => handlePillChange('type', 'THEORY')}
                    className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${formData.type === 'THEORY' ? 'bg-[#004DD2] text-white' : 'border border-slate-300 text-slate-600'}`}
                  >
                    Theory
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePillChange('type', 'PRACTICAL')}
                    className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${formData.type === 'PRACTICAL' ? 'bg-[#004DD2] text-white' : 'border border-slate-300 text-slate-600'}`}
                  >
                    Practical
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Per Hour Rate (₹)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">₹</div>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 500"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#004DD2] py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-70"
              >
                <FilePlus className="h-4 w-4" /> 
                {isSubmitting ? 'Assigning...' : 'Assign Subject'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Allocations List */}
        <div className="xl:col-span-8">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-5">
              <List className="h-5 w-5 text-[#004DD2]" />
              <h2 className="text-lg font-bold text-slate-900">Current Allocations ({allocations.length})</h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden flex-grow overflow-x-auto lg:block">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Faculty</th>
                    <th className="px-6 py-4">Course / Semester</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr><td colSpan="4" className="py-12 text-center text-slate-500">Loading allocations...</td></tr>
                  ) : allocations.length === 0 ? (
                    <tr><td colSpan="4" className="py-12 text-center text-slate-500">No subjects allocated yet.</td></tr>
                  ) : (
                    allocations.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-900">{row.facultyName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">ID: {row.facultyId}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-900">{row.course}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{row.semester} • {row.session}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-500">{row.subjectCode}</p>
                          <p className="mt-0.5 font-bold text-slate-900">{row.subjectName}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${row.type === 'THEORY' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {row.type}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Matches FacultyDashboard logic) */}
            <div className="divide-y divide-slate-100 lg:hidden">
               {isLoading ? (
                  <div className="py-12 text-center text-sm text-slate-500">Loading allocations...</div>
                ) : allocations.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">No subjects allocated yet.</div>
                ) : (
                  allocations.map((row) => (
                    <div key={row.id} className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-slate-900">{row.facultyName}</p>
                          <p className="text-xs text-slate-500">ID: {row.facultyId}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${row.type === 'THEORY' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {row.type}
                        </span>
                      </div>
                      
                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                           <BookOpen className="h-4 w-4 text-[#004DD2]" />
                           <p className="font-bold text-[#004DD2]">{row.subjectCode}</p>
                        </div>
                        <p className="mb-3 font-bold text-slate-900">{row.subjectName}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="mb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Course</p>
                            <p className="font-medium text-slate-800">{row.course}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Semester</p>
                            <p className="font-medium text-slate-800">{row.semester}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
            </div>

            {/* Pagination */}
            {!isLoading && allocations.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-4">
                <div className="flex items-center justify-center gap-1.5">
                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md bg-[#004DD2] text-sm font-semibold text-white">1</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50">2</button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8">
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg transition-transform hover:scale-105 hover:bg-slate-700">
          <HelpCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}