import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/LoginPage";
import Register from "./Pages/Register";
import RegisterOrganization from "./Pages/ORegisterPage";
import TeamManagement from "./Pages/admin/TeamManagement";
import PendingUsers from "./Pages/admin/UserManagement";
import AdminOverview from "./Pages/admin/Overview";
import AdminLayout from "./layout/AdminLayout";
import ProjectManagement from "./Pages/admin/ProjectManagement";


function ProtectedRoute({children}){
  const token=localStorage.getItem("token");

  return token ? children:<Navigate to="/login" replace/>;
}



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute>
             <AdminLayout />
          </ProtectedRoute>
         }>
          <Route index element={<AdminOverview />} />
        </Route>
       <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />
                  <Route
          path="/register-organization"
          element={<RegisterOrganization />}
        />
        <Route path="/admin/teams" element={<TeamManagement/>}/>
        <Route path="/admin/pending-users" element={<PendingUsers/>}/>

        <Route path="/admin/projects" element={<ProjectManagement/>}/>
      

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}