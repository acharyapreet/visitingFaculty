import { useState } from "react";

import FirstPage1 from "./pages/FirstPage1";
import Sidebar from "./components/superAdmin/Sidebar";
import SettingsPage from "./components/superAdmin/Settings";
import AllAdminsPage from "./components/superAdmin/AllAdminsPage";
import PendingApprovalsPage from "./components/superAdmin/PendingApprovals";

function App() {
  const [active, setActive] = useState("settings");

  return (
    <>
      <FirstPage1 />

      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
        <Sidebar active={active} onNavigate={setActive} />

        {active === "settings" && <SettingsPage />}
        {active === "admins" && <AllAdminsPage />}
        {active === "pending" && <PendingApprovalsPage />}
      </div>
    </>
  );
}

export default App;