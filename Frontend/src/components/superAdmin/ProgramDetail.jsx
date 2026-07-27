import React, { useState, useEffect } from "react";
import Topbar from "./Topbar";
import { ChevronLeft, Plus, Trash2, User } from "lucide-react";

export default function ProgramDetail({ program, onBack }) {
  const [courseData, setCourseData] = useState(null);
  const [subjects, setSubjects] = useState({});
  const [expandedSem, setExpandedSem] = useState(1);
  const [loading, setLoading] = useState(true);

  const courseId = program.course_id;

  // 1. Fetch Dashboard Details
  useEffect(() => {
    fetchCourseDashboard();
  }, [courseId]);

  const fetchCourseDashboard = async () => {
    try {
      const res = await fetch(`/api/super_admin/courseDashboard/${courseId}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCourseData(data.data[0]);
      } else {
        throw new Error("API returned no data");
      }
    } catch (error) {
      console.error("Failed to fetch course dashboard, using fallback:", error);
      // Fallback matching the Database row injected from the list
      setCourseData(program);
    } finally {
      setLoading(false);
      fetchSubjects(1); // Fetch 1st semester subjects by default
    }
  };

  // 2. Fetch Subjects per Semester
  const fetchSubjects = async (semesterId) => {
    try {
      const res = await fetch(`/api/super_admin/subjects/${courseId}/${semesterId}`);
      const data = await res.json();
      if (data.success) {
        setSubjects((prev) => ({ ...prev, [semesterId]: data.data || [] }));
      }
    } catch (error) {
      console.error(`Failed to fetch subjects for semester ${semesterId}:`, error);
    }
  };

  const handleAccordionClick = (semId) => {
    const isExpanding = expandedSem !== semId;
    setExpandedSem(isExpanding ? semId : null);
    if (isExpanding && !subjects[semId]) {
      fetchSubjects(semId);
    }
  };

  // 3. Update Program Incharge
  const handleChangeIncharge = async () => {
    const newIncharge = prompt("Enter new Program Incharge name:", courseData.program_incharge);
    if (!newIncharge || newIncharge.trim() === "") return;

    try {
      const res = await fetch(`/api/super_admin/updateIncharge/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_incharge: newIncharge })
      });
      const data = await res.json();
      if (data.success) {
        setCourseData({ ...courseData, program_incharge: newIncharge });
        alert("Program Incharge updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update incharge:", error);
      // Optimistic update for UI if API isn't fully ready
      setCourseData({ ...courseData, program_incharge: newIncharge });
    }
  };

  // 4. Add Section
  const handleAddSection = async () => {
    const sectionName = prompt("Enter new Section Name (e.g., C):");
    if (!sectionName || sectionName.trim() === "") return;

    const formattedSectionName = sectionName.trim().toUpperCase();

    try {
      const res = await fetch(`/api/super_admin/addSection/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_name: formattedSectionName })
      });
      const data = await res.json();
      
      if (data.success) {
        // Update local state to reflect the new section immediately
        setCourseData(prev => ({
          ...prev,
          Sections: [...(prev.Sections || []), { section_id: data.data.section_id, section_name: data.data.section_name }]
        }));
      } else {
        alert("Failed to add section: " + data.message);
      }
    } catch (error) {
      console.error("Failed to add section:", error);
      // Optimistic update for UI if API isn't fully ready
      setCourseData(prev => ({
        ...prev,
        Sections: [...(prev.Sections || []), { section_id: Date.now(), section_name: formattedSectionName }]
      }));
    }
  };

  // 5. Add a new Subject
  const handleAddSubject = async (semesterId) => {
    const subjectCode = prompt("Enter Subject Code (e.g., IT-104A):");
    if (!subjectCode) return;
    const subjectName = prompt("Enter Subject Name:");
    if (!subjectName) return;

    try {
      const res = await fetch(`/api/super_admin/addSubject/${courseId}/${semesterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_code: subjectCode, subject_name: subjectName })
      });
      const data = await res.json();
      if (data.success) {
        fetchSubjects(semesterId);
      }
    } catch (error) {
      console.error("Failed to add subject:", error);
    }
  };

  // 6. Delete a Subject
  const handleDeleteSubject = async (semesterId, subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      const res = await fetch(`/api/super_admin/deleteSubject/${courseId}/${semesterId}/${subjectId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        fetchSubjects(semesterId);
      }
    } catch (error) {
      console.error("Failed to delete subject:", error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading course details...</div>;
  if (!courseData) return <div className="p-8 text-center text-red-500">Error loading course.</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Topbar 
        title="Visiting Faculty Management" 
        subtitle="Manage program details and subjects" 
        showSearch={false} 
      />

      <div className="p-8 flex-1 overflow-y-auto space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <button onClick={onBack} className="hover:text-purple-600 transition-colors">Dashboard</button>
          <span>›</span>
          <button onClick={onBack} className="hover:text-purple-600 transition-colors">Programs</button>
          <span>›</span>
          <span className="text-purple-600">{courseData.course_name} ({courseData.course_code})</span>
        </div>

        {/* Program Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between">
          <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-8 pr-8 border-r border-gray-100">
            <div className="col-span-2 flex justify-between">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  Program Details 
                  {courseData.is_active === 1 && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider">Active</span>
                  )}
               </h3>
            </div>

            {/* Read-Only Fields from API */}
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Program Name</p>
              <p className="font-bold text-gray-800">{courseData.course_name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Course Code</p>
              <p className="font-bold text-gray-800">{courseData.course_code}</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Total Semesters</p>
              <p className="font-bold text-gray-800">{courseData.total_semesters} Semesters</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Sections</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-bold text-gray-800">
                  {courseData.Sections?.length > 0 ? courseData.Sections.map(s => s.section_name).join(", ") : "None"}
                </p>
                <button 
                  onClick={handleAddSection}
                  className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-0.5 rounded text-xs font-semibold border border-purple-200 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Program Incharge Section */}
          <div className="w-64 pl-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Program Incharge</p>
            <p className="font-bold text-gray-900">{courseData.program_incharge || "Not Assigned"}</p>
            <button 
              onClick={handleChangeIncharge}
              className="mt-3 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              Change Incharge
            </button>
          </div>
        </div>

        {/* Subject Management Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Subject Management</h3>
          
          {Array.from({ length: courseData.total_semesters }, (_, i) => i + 1).map((sem) => (
            <div key={sem} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => handleAccordionClick(sem)}
                className="w-full flex items-center gap-3 bg-gray-50 p-4 font-bold text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className={`w-5 h-5 transition-transform ${expandedSem === sem ? "-rotate-90" : "rotate-180"}`} />
                Semester {sem} 
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {subjects[sem] ? subjects[sem].length : 0} Subjects
                </span>
              </button>
              
              {expandedSem === sem && (
                <div className="p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="pb-3">Subject Name</th>
                        <th className="pb-3">Code</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects[sem] && subjects[sem].length > 0 ? (
                        subjects[sem].map(sub => (
                          <tr key={sub.subject_id} className="border-b border-gray-50">
                            <td className="py-4 font-semibold text-gray-800">{sub.subject_name}</td>
                            <td className="py-4 text-gray-500">{sub.subject_code}</td>
                            <td className="py-4 text-right">
                              <button 
                                onClick={() => handleDeleteSubject(sem, sub.subject_id)}
                                className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-sm text-gray-500">
                            No subjects added for this semester yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleAddSubject(sem)}
                      className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Subject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}