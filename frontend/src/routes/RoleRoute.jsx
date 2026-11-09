import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

function RoleRoute({ allowedRoles }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const dashboardPaths = {
      admin: "/admin/dashboard",
      exhibitor: "/exhibitor/dashboard",
      attendee: "/attendee/dashboard",
    };

    return (
      <Navigate
        to={dashboardPaths[user.role] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleRoute;