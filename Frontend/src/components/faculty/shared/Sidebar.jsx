import {
  LayoutGrid,
  CalendarCheck,
  History,
  FileText,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Edit2,
  Save,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Landmark,
  CreditCard,
  Briefcase,
  Fingerprint, // For biometric/identity
  IdCard,      // For UVFIN / Employee ID
  Wallet,      // For Account Number
  Building,     //For Bank Branch / IFSC
  Hash
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const navItems = [
  { view: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { view: "mark-attendance", label: "Mark Attendance", icon: CalendarCheck },
  { view: "attendance-history", label: "Attendance History", icon: History },
  { view: "view-bill", label: "View Bill", icon: FileText },
];

function NavItems({ onNavigate, currentView, onClose }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ view, label, icon: Icon }) => (
        <button
          key={view}
          onClick={() => {
            onNavigate(view);
            if (onClose) onClose();
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            currentView === view
              ? "bg-[#004DD2] text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-50 hover:text-[#004DD2]"
          }`}
        >
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// --- ELEGANT PROFILE MODAL ---
function ProfileModal({ isOpen, onClose, userId, token }) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", phone_number: "" });

  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      setSaveSuccess(false);
      axios
        .get(`http://localhost:5000/api/admin/faculty/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            setProfileData(res.data.data);
            setFormData({
              full_name: res.data.data.full_name,
              phone_number: res.data.data.phone_number,
            });
          }
        })
        .catch((err) => console.error("Error fetching profile:", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, userId, token]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim()
      };

      const response = await axios.put(`http://localhost:5000/api/auth/update/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProfileData(prev => ({ ...prev, ...formData }));
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3s
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper component for elegant read-only fields
  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50/50 p-3 border border-slate-100 transition-colors hover:bg-slate-50">
      <div className="mt-0.5 text-slate-400">
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value || "N/A"}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col rounded-[24px] bg-white shadow-2xl ring-1 ring-slate-900/5">
        
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8 bg-gradient-to-r from-blue-50/50 to-transparent">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#004DD2] shadow-sm ring-1 ring-slate-200/50">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Profile</h2>
              <p className="text-sm text-slate-500 font-medium">Manage your university identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white p-2.5 text-slate-400 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#004DD2] mb-4" />
              <p className="font-medium">Retrieving profile data...</p>
            </div>
          ) : profileData ? (
            <div className="space-y-8 pb-4">
              
              {/* Success Toast / Notification */}
              {saveSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center text-green-700 text-sm font-medium">
                  Profile updated successfully.
                </div>
              )}

              {/* Personal Information Section */}
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#004DD2] uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" /> Personal Details
                  </h3>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-[#004DD2] hover:border-blue-200"
                    >
                      <Edit2 className="h-[14px] w-[14px]" /> Edit Details
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ full_name: profileData.full_name, phone_number: profileData.phone_number });
                        }}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 rounded-full bg-[#004DD2] px-5 py-1.5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-800 disabled:opacity-70"
                      >
                        {isSaving ? <Loader2 className="h-[14px] w-[14px] animate-spin" /> : <Save className="h-[14px] w-[14px]" />}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Full Name</label>
                        <input 
                          type="text" 
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-shadow focus:border-[#004DD2] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/10"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Phone Number</label>
                        <input 
                          type="tel" 
                          maxLength={10}
                          value={formData.phone_number}
                          onChange={(e) => setFormData({...formData, phone_number: e.target.value.replace(/\D/g,'')})}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-shadow focus:border-[#004DD2] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/10"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <InfoField icon={User} label="Full Name" value={profileData.full_name} />
                      <InfoField icon={Phone} label="Phone Number" value={profileData.phone_number} />
                    </>
                  )}
                  
                  <div className="sm:col-span-2">
                    <InfoField icon={Mail} label="Email Address" value={profileData.email} />
                  </div>
                  <div className="sm:col-span-2">
                    <InfoField icon={MapPin} label="Residential Address" value={profileData.address} />
                  </div>
                </div>
              </section>

              <div className="grid gap-8 sm:grid-cols-2">
                {/* Academic & Identity Section */}
                <section>
                  <h3 className="mb-5 text-sm font-bold text-[#004DD2] uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" /> Academic & ID
                  </h3>
                  <div className="flex flex-col gap-3">
                    <InfoField icon={Briefcase} label="Qualification" value={profileData.qualification} />
                    {/* Upgraded icon for UVFIN */}
                    <InfoField icon={IdCard} label="UVFIN / Employee ID" value={profileData.uvfin} />
                    <InfoField icon={CreditCard} label="PAN Card No" value={profileData.pan_card_no} />
                    {/* Restored the original code and added Fingerprint icon */}
                    <InfoField icon={Fingerprint} label="Aadhaar No" value={profileData.aadhaar_no} />
                  </div>
                </section>

                {/* Banking Section */}
                <section>
                  <h3 className="mb-5 text-sm font-bold text-[#004DD2] uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="h-4 w-4" /> Banking Information
                  </h3>
                  <div className="flex flex-col gap-3">
                    <InfoField icon={Landmark} label="Bank Name" value={profileData.bank_name} />
                    {/* Upgraded icon for Account Number */}
                    <InfoField icon={Wallet} label="Account Number" value={profileData.account_no} />
                    {/* Upgraded icon for IFSC Code */}
                    <InfoField icon={Building} label="IFSC Code" value={profileData.ifsc_code} />
                  </div>
                </section>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                <X className="h-6 w-6" />
              </div>
              <p className="font-medium">Failed to load profile data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ onNavigate, currentView = "dashboard", onSignOut }) {
  const [open, setOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [facultyName, setFacultyName] = useState("Loading...");
  const [facultyRole, setFacultyRole] = useState("Faculty");
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem('iipsCurrentSession');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        setSessionData(session);
        setFacultyName(session.fullName || "Visiting Faculty");
        if (session.role) {
          setFacultyRole(session.role.charAt(0).toUpperCase() + session.role.slice(1));
        }
      } catch (e) {
        console.error("Error parsing session data", e);
      }
    }
  }, []);

  const initials = facultyName
    .replace("Dr. ", "")
    .replace("Prof. ", "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#004DD2] text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-[#004DD2]">IIPS</p>
            <p className="text-[11px] font-medium leading-tight text-slate-500">Faculty Portal</p>
          </div>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="absolute inset-x-0 top-[61px] z-50 border-b border-slate-200 bg-white px-4 pb-4 shadow-lg lg:hidden">
          <NavItems onNavigate={onNavigate} currentView={currentView} onClose={() => setOpen(false)} />
          
          <div className="mt-4 border-t border-slate-200 pt-2">
            <button 
              onClick={() => { setIsProfileModalOpen(true); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#004DD2]">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{facultyName}</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{facultyRole}</p>
              </div>
            </button>
          </div>
          
          <button onClick={onSignOut} className="mt-1 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4 shrink-0" /> Sign Out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex z-10 relative">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004DD2] text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xl font-black leading-tight text-[#004DD2] tracking-tight">IIPS</p>
            <p className="text-xs font-semibold leading-tight text-slate-500 uppercase tracking-wider mt-0.5">Faculty Portal</p>
          </div>
        </div>

        <NavItems onNavigate={onNavigate} currentView={currentView} />

        <div className="mt-auto">
          {/* Profile Section Button */}
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="group flex w-full items-center gap-3 border-t border-slate-200 pt-5 pb-3 text-left hover:bg-slate-50 rounded-xl px-2 transition-all"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#004DD2] ring-2 ring-transparent group-hover:ring-blue-200 transition-all">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800 group-hover:text-[#004DD2] transition-colors">{facultyName}</p>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">{facultyRole}</p>
            </div>
          </button>
          
          <button onClick={onSignOut} className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all">
            <LogOut className="h-[18px] w-[18px] shrink-0" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Render Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        userId={sessionData?.userId}
        token={sessionData?.token}
      />
    </>
  );
}