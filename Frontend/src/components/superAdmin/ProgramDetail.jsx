import React, { useState } from "react";
import Topbar from "./Topbar";
import { ChevronLeft, Plus, Trash2, Settings2, User } from "lucide-react";

export default function ProgramDetail({ program, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...program });
  const [expandedSem, setExpandedSem] = useState(1);

  // Dummy Subjects State
  const [subjects, setSubjects] = useState([
    { id: 1, sem: 1, name: "Mathematics - I", code: "IT-101", credits: "4.0" },
    { id: 2, sem: 1, name: "Computer Organization", code: "IT-102", credits: "3.0" }
  ]);

  const handleSave = () => {
    // TODO: Send formData and updated subjects to backend API here
    setIsEditing(false);
    console.log("Saving to backend:", formData);
  };

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
          <span className="text-purple-600">{formData.name} [{formData.code}]</span>
        </div>

        {/* Program Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-between">
          <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-8 pr-8 border-r border-gray-100">
            <div className="col-span-2 flex justify-between">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  Program Details 
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded uppercase tracking-wider">Active</span>
               </h3>
               {isEditing ? (
                 <button onClick={handleSave} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Save Changes</button>
               ) : (
                 <button onClick={() => setIsEditing(true)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Edit Program</button>
               )}
            </div>

            {/* Editable Fields */}
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Program Name</p>
              {isEditing ? (
                <input type="text" className="border rounded p-1 w-full text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              ) : <p className="font-bold text-gray-800">{formData.name}</p>}
            </div>
            
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Department</p>
              {isEditing ? (
                <input type="text" className="border rounded p-1 w-full text-sm" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              ) : <p className="font-bold text-gray-800">{formData.department}</p>}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Duration</p>
              {isEditing ? (
                <input type="text" className="border rounded p-1 w-full text-sm" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
              ) : <p className="font-bold text-gray-800">{formData.duration} (Integrated)</p>}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Total Semesters</p>
              {isEditing ? (
                <input type="number" className="border rounded p-1 w-full text-sm" value={formData.semesters} onChange={e => setFormData({...formData, semesters: e.target.value})} />
              ) : <p className="font-bold text-gray-800">{formData.semesters} Semesters</p>}
            </div>
          </div>

          {/* Program Incharge Section */}
          <div className="w-64 pl-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Program Incharge</p>
            <p className="font-bold text-gray-900">Dr. Vikram Sharma</p>
            <button className="mt-3 text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-50">
              Change Incharge
            </button>
          </div>
        </div>

        {/* Subject Management Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Subject Management</h3>
          
          {[1, 2].map((sem) => (
            <div key={sem} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setExpandedSem(expandedSem === sem ? null : sem)}
                className="w-full flex items-center gap-3 bg-gray-50 p-4 font-bold text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className={`w-5 h-5 transition-transform ${expandedSem === sem ? "-rotate-90" : "rotate-180"}`} />
                Semester {sem} 
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{subjects.filter(s => s.sem === sem).length} Subjects</span>
              </button>
              
              {expandedSem === sem && (
                <div className="p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="pb-3">Subject Name</th>
                        <th className="pb-3">Code</th>
                        <th className="pb-3">Credits</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.filter(s => s.sem === sem).map(sub => (
                        <tr key={sub.id} className="border-b border-gray-50">
                          <td className="py-4 font-semibold text-gray-800">{sub.name}</td>
                          <td className="py-4 text-gray-500">{sub.code}</td>
                          <td className="py-4 font-semibold">{sub.credits}</td>
                          <td className="py-4 text-right">
                            <button className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-end">
                    <button className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50">
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