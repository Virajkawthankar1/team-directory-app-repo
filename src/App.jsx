import { Routes, Route, Navigate } from "react-router-dom";
import { DirectoryPage } from "./pages/DirectoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user, authLoading } = useAuth();

  // Don't show any page until we know if the user is logged in
  if (authLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Logged-in users skip the Login page and go to the Directory */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      {/* Only logged-in users can see the Directory */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DirectoryPage />
          </ProtectedRoute>
        }
      />

      {/* Any other URL goes to "/" (which then checks login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;