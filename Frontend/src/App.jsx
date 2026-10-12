import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/LoginPage";
import Register from "./Pages/RegisterPage";

function Dashboard() {
  return <h1>WorkSphere Dashboard</h1>;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<Register />} />


        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}