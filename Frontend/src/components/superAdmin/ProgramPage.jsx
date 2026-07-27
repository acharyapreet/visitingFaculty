import React, { useState } from "react";
import Topbar from "./Topbar";
import ProgramDetail from "./ProgramDetail";
import { Eye, ChevronDown, Search } from "lucide-react";

// Dummy data to simulate API response
const initialPrograms = [
  { id: 1, code: "MCA", name: "Master of Computer Applications", department: "Computer Science", duration: "5 Years", semesters: 10, sections: ["A", "B"] },
  { id: 2, code: "M.Tech", name: "Master of Technology", department: "Engineering", duration: "5 Years", semesters: 10, sections: ["A", "B"] },
  { id: 3, code: "M.Tech CS", name: "Master of Technology (Computer Science)", department: "Computer Science", duration: "5 Years", semesters: 10, sections: ["A"] },
  { id: 4, code: "MBA-MS", name: "MBA-MS (Integrated)", department: "Management", duration: "5 Years", semesters: 10, sections: ["A", "B"] }
];

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Switch to Detail View if a program is selected
  if (selectedProgram) {
    return (
      <ProgramDetail 
        program={selectedProgram} 
        onBack={() => setSelectedProgram(null)} 
      />
    );
  }

  // Filter the programs based on the search query (checking both code and name)
  const filteredPrograms = initialPrograms.filter((prog) => 
    prog.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    prog.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Topbar 
        title="Programs" 
        subtitle="View and manage all academic programs available in the IIPS." 
        showSearch={false} // Hiding topbar search to use the local page search
      />

      <div className="p-8 flex-1 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          
          {/* Filters & Search Bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex gap-4 flex-wrap">
              
              {/* Search Program Input */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white w-64 focus-within:border-purple-500 transition-colors">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Program"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
                />
              </div>

              {/* Dropdowns */}
              <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 outline-none focus:border-purple-500 bg-white">
                <option>Department</option>
              </select>
              <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 outline-none focus:border-purple-500 bg-white">
                <option>Duration</option>
              </select>
              <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 outline-none focus:border-purple-500 bg-white">
                <option>Section</option>
              </select>
            </div>
            
            {/* Dynamic Count Badge */}
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              {filteredPrograms.length} Programs
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Program Code</th>
                <th className="p-4">Program Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Semesters</th>
                <th className="p-4">Sections</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {/* Note: Mapping over filteredPrograms instead of initialPrograms */}
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((prog) => (
                  <tr key={prog.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{prog.code}</td>
                    <td className="p-4">{prog.name}</td>
                    <td className="p-4 text-gray-500">{prog.department}</td>
                    <td className="p-4">{prog.duration}</td>
                    <td className="p-4">{prog.semesters}</td>
                    <td className="p-4">
                      <button className="flex items-center justify-between min-w-[100px] border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">
                        <span>Section<br/>{prog.sections.join(", ")}</span>
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
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No programs found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}