import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 sm:p-8">
          <Outlet />
        </main>

        <footer className="px-4 pb-6 text-center text-xs text-gray-400 sm:px-8">
          WorkSphere · Organization Management
        </footer>
      </div>
    </div>
  );
}