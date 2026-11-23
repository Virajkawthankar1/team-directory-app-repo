import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({ memberCount }) => {
  const { user, logout } = useAuth();      // no props needed for the user
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();                               // clear the auth state
    navigate("/login", { replace: true });  // go to Login without leaving a Back entry
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3 mb-3 rounded">
      <span className="navbar-brand mb-0 h1">
        Team Directory <span className="badge bg-primary">{memberCount}</span>
      </span>

      {user && (
        <div className="d-flex align-items-center gap-2">
          <img
            src={user.image}
            alt={user.name}
            width="32"
            height="32"
            className="rounded-circle"
          />
          <span className="text-white">{user.name}</span>
          <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};