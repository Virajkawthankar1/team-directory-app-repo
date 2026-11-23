// One key holds the whole session as a JSON string
const SESSION_KEY = "teamDirectorySession";

// Remove the session from BOTH storages
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

// Save the session. remember=true -> localStorage, otherwise -> sessionStorage.
export const saveSession = ({ user, accessToken, refreshToken }, remember) => {
  const storage = remember ? localStorage : sessionStorage;

  // Make sure an old session in the other storage can never linger
  clearSession();

  // Store only what we need. The password is never part of this object.
  const session = {
    user: { name: user.name, image: user.image },
    accessToken,
    refreshToken,
  };
  storage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Read the saved session (localStorage first, then sessionStorage). Returns null if none.
export const loadSession = () => {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    clearSession();   // stored value is corrupted, so discard it
    return null;
  }
};

// After a token refresh, update the tokens in whichever storage already holds the session
export const updateTokens = (accessToken, refreshToken) => {
  const storage = localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage;
  const raw = storage.getItem(SESSION_KEY);
  if (!raw) return;

  const session = JSON.parse(raw);
  storage.setItem(SESSION_KEY, JSON.stringify({ ...session, accessToken, refreshToken }));
};