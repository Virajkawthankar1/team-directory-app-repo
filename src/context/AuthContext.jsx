import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, getCurrentUser, refreshSession } from "../services/api";
import { saveSession, loadSession, clearSession, updateTokens } from "../services/storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);                  // { name, image } or null
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // true while we check for a saved session on app load
  const [authLoading, setAuthLoading] = useState(true);

  // message for the Login page, e.g. "Session expired, please log in again"
  const [sessionMessage, setSessionMessage] = useState("");

  // Put a logged-in session into state
  const startSession = (userData, newAccessToken, newRefreshToken) => {
    setUser(userData);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  };

  // Runs ONCE when the app opens: restore the session from browser storage
  useEffect(() => {
    const restoreSession = async () => {
      const saved = loadSession();

      // Step 1: nothing saved, so the user is simply logged out
      if (!saved) {
        setAuthLoading(false);
        return;
      }

      try {
        // Step 2: ask the API if the saved access token is still valid
        const currentUser = await getCurrentUser(saved.accessToken);
        startSession(currentUser, saved.accessToken, saved.refreshToken);
      } catch {
        // Step 3: token probably expired, so refresh ONCE and try again
        try {
          const newTokens = await refreshSession(saved.refreshToken);
          const currentUser = await getCurrentUser(newTokens.accessToken);

          updateTokens(newTokens.accessToken, newTokens.refreshToken);   // save new tokens
          startSession(currentUser, newTokens.accessToken, newTokens.refreshToken);
        } catch {
          // Step 4: refresh failed too, so clear everything
          clearSession();
          setSessionMessage("Session expired, please log in again");
        }
      }

      setAuthLoading(false);   // the check is finished, so the app can render
    };

    restoreSession();
  }, []);

  // Full login flow: call the API, save to browser storage, update shared state
  const login = async (username, password, remember) => {
    const session = await loginUser(username, password);
    saveSession(session, remember);
    startSession(session.user, session.accessToken, session.refreshToken);
    setSessionMessage("");   // clear any old "session expired" message
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    authLoading,
    sessionMessage,
    startSession,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};