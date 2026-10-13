import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/LoginPage";
import Register from "./Pages/Register";
import RegisterOrganization from "./Pages/ORegisterPage";

import TeamManagement from "./Pages/admin/TeamManagement";
import PendingUsers from "./Pages/admin/UserManagement";
import AdminOverview from "./Pages/admin/Overview";
import ProjectManagement from "./Pages/admin/ProjectManagement";
import TaskManagement from "./Pages/admin/TaskManagement";


import ManagerLayout from "./components/manager/ManagerLayout";
import ManagerDashboard from "./Pages/manager/ManagerDashboard";
import ManagerProjects from "./Pages/manager/ManagerProjects";
import ManagerTasks from "./Pages/manager/ManagerTasks";


import AdminLayout from "./layout/AdminLayout";

function ProtectedRoute({ children }) {
const token = localStorage.getItem("token");

return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
return ( <BrowserRouter> <Routes>
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route
path="/register-organization"
element={<RegisterOrganization />}
/>


    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminOverview />} />
      <Route path="teams" element={<TeamManagement />} />
      <Route path="pending-users" element={<PendingUsers />} />
      <Route path="projects" element={<ProjectManagement />} />
      <Route path="task-management" element={<TaskManagement />} />
    </Route>

    <Route
      path="/manager"
      element={
        <ProtectedRoute>
          <ManagerLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<ManagerDashboard />} />
      <Route path="projects" element={<ManagerProjects />} />
      <Route path="tasks" element={<ManagerTasks />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
</BrowserRouter>


);
}
