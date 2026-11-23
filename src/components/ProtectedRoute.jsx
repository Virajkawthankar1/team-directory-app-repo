import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Shows its children only when a user is logged in
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // Not logged in: send to Login. replace keeps this page out of the Back history.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};