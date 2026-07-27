import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import ProgramDetail from "./ProgramDetail";
import { Eye, ChevronDown } from "lucide-react";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all programs on mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/super_admin/courses');
      const data = await res.json();
      if (data.success) {
        setPrograms(data.data);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      // Fallback data reflecting the actual database 'courses' table
      setPrograms([
        { course_id: 1, course_code: "C1", course_name: "MCA", program_incharge: "Dr. Shaligram Prajapati", total_semesters: 10, is_active: 1, year: 0, Sections: [{ section_name: "A" }, { section_name: "B" }] },
        { course_id: 2, course_code: "C2", course_name: "Mtech(IT)", program_incharge: "Dr. Kirti Mathur", total_semesters: 10, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 3, course_code: "C3", course_name: "Mtech(CS)", program_incharge: "Dr. Yasmin Shaikh", total_semesters: 10, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 4, course_code: "C4", course_name: "MBA(MS)", program_incharge: "Dr. Manmindar Singh", total_semesters: 10, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 5, course_code: "C5", course_name: "MBA(MS)", program_incharge: "Dr. Kapil Jain", total_semesters: 4, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 6, course_code: "C6", course_name: "MBA(APR)", program_incharge: "Dr. Anshu Bhati", total_semesters: 4, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 7, course_code: "C7", course_name: "MBA(EShip)", program_incharge: "Dr. Nirmala Sawan", total_semesters: 4, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 8, course_code: "C8", course_name: "Bcom(Hons)", program_incharge: "Dr. Sujata Parwani", total_semesters: 8, is_active: 1, year: 0, Sections: [{ section_name: "A" }] },
        { course_id: 9, course_code: "C9", course_name: "MBA(TM)", program_incharge: "Dr. Shilpa Bagdare", total_semesters: 10, is_active: 1, year: 0, Sections: [{ section_name: "A" }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Switch to Detail View if a program is selected
  if (selectedProgram) {
    return (
      <ProgramDetail 
        program={selectedProgram} 
        onBack={() => setSelectedProgram(null)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Topbar 
        title="Programs" 
        subtitle="View and manage all academic programs available in the IIPS." 
        showSearch={false} 
      />

      <div className="p-8 flex-1 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          
          {/* Header & Dynamic Count Badge */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-lg font-bold text-gray-800">Program List</h2>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              {programs.length} Programs
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading programs...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-4">Program Code</th>
                  <th className="p-4">Semesters</th>
                  <th className="p-4">Sections</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {programs.length > 0 ? (
                  programs.map((prog) => (
                    <tr key={prog.course_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{prog.course_name} ({prog.course_code})</td>
                      <td className="p-4">{prog.total_semesters}</td>
                      <td className="p-4">
                        <button className="flex items-center justify-between min-w-[100px] border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">
                          <span>
                            Section<br/>
                            {prog.Sections?.map(s => s.section_name).join(", ") || "None"}
                          </span>
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </button>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => setSelectedProgram(prog)}
                          className="flex items-center gap-2 text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500">
                      No programs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}