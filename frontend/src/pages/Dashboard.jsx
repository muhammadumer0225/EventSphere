import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  setUser(null);

  navigate("/login");
};
  return (
    <div>
      <h1>Welcome to EventSphere Dashboard</h1>
      <p>You have successfully logged in!</p>
      <p>Welcome, {user?.name}</p>
      <p>Your Role: {user?.role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;