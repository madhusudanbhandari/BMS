import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/LoginPage";
import Register from "./Pages/Register";
import RegisterOrganization from "./Pages/ORegisterPage";

// Admin pages
import TeamManagement from "./Pages/admin/TeamManagement";
import PendingUsers from "./Pages/admin/UserManagement";
import AdminOverview from "./Pages/admin/Overview";
import ProjectManagement from "./Pages/admin/ProjectManagement";
import TaskManagement from "./Pages/admin/TaskManagement";
import AdminLayout from "./layout/AdminLayout";

// Manager pages
import ManagerLayout from "./layout/ManagerLayout";
import ManagerDashboard from "./Pages/manager/ManagerDashboard";
import ManagerProjects from "./Pages/manager/ManagerProjects";
import ManagerTasks from "./Pages/manager/ManagerTasks";
import ManagerEmployees from "./Pages/manager/ManagerEmployees";
import ManagerTeams from "./Pages/manager/ManagerTeams";

// Employee pages
import EmployeeLayout from "./layout/EmployeeLayout";
import EmployeeOverview from "./Pages/employee/EmployeeOverview";
import EmployeeProjects from "./Pages/employee/EmployeeProjects";
import EmployeeTasks from "./Pages/employee/EmployeeTasks";
import EmployeeTeams from "./Pages/employee/EmployeeTeams";
import EmployeeSalary from "./Pages/employee/EmployeeSalary";
import EmployeeAttendance from "./Pages/employee/EmployeeAttendence";
import EmployeeLeaves from "./Pages/employee/EmployeeLeaves";

//Hr pages
import HRAttendance from "./Pages/hr/HrAttendance";
import HREmployees from "./Pages/hr/HrEmployees";
import HRLayout from "./layout/HrLayout";
import HRLeaveManagement from "./Pages/hr/HrLeaveManagement";
import HRSalaryRequests from "./Pages/hr/HrSalaryRequests";
import HROverview from "./Pages/hr/HrOverview";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/register-organization"
          element={<RegisterOrganization />}
        />

        {/* Organization Admin routes */}
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

        {/* Manager routes */}
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
          <Route path="teams" element={<ManagerTeams />} />
          <Route path="employees" element={<ManagerEmployees />} />
        </Route>

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeOverview />} />
          <Route path="projects" element={<EmployeeProjects />} />
          <Route path="tasks" element={<EmployeeTasks />} />
          <Route path="teams" element={<EmployeeTeams />} />
          <Route path="salary" element={<EmployeeSalary />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leaves" element={<EmployeeLeaves />} />  

        </Route>
                <Route
          path="/hr"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <HROverview />
            </ProtectedRoute>
          }
        />

        <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["HR"]}>
            <HRLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HROverview />} />
        <Route path="employees" element={<HREmployees />} />
        <Route path="salary-requests" element={<HRSalaryRequests />} />
        <Route path="leaves" element={<HRLeaveManagement />} />
        <Route path="attendance" element={<HRAttendance />} />
      </Route>

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
