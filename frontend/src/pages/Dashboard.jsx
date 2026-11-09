import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { user } = useContext(AuthContext);

  const dashboardPaths = {
    admin: "/admin/dashboard",
    exhibitor: "/exhibitor/dashboard",
    attendee: "/attendee/dashboard",
  };

  const destination = dashboardPaths[user?.role];

  if (!destination) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={destination} replace />;
}

export default Dashboard;