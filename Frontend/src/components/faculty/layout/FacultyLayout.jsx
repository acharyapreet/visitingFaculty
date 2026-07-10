import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar";

export default function FacultyLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
