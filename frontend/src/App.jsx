import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ExhibitorDashboard from "./pages/exhibitor/ExhibitorDashboard";
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={["exhibitor"]} />}>
            <Route
              path="/exhibitor/dashboard"
              element={<ExhibitorDashboard />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={["attendee"]} />}>
            <Route
              path="/attendee/dashboard"
              element={<AttendeeDashboard />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;