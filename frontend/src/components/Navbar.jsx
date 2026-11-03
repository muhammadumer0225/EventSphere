import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <h2>EventSphere</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Register</Link>
      </div>
    </nav>
  );
}

export default Navbar;