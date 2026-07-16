import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { IconSearch } from "./icons";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Wire this up to your actual auth flow, e.g. authApi.logout()
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar onSignOut={handleSignOut} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <p className="text-lg font-semibold text-blue-600">
            Unified Visiting Faculty Management, IIPS, DAVV
          </p>
          <div className="relative w-72">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </header>
        <main className="flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}