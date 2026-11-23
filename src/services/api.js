// Base URL for the fake REST API
const BASE_URL = "https://dummyjson.com";

// Fetch all members. `signal` lets the caller cancel the request.
export const getMembers = async (accessToken, signal) => {
  const response = await fetch(`${BASE_URL}/users?limit=0`, {
    headers: authHeaders(accessToken),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.users || [];
};

// Send a new member to the API. Returns the member the API echoes back.
export const addMember = async (accessToken, memberData) => {
  const response = await fetch(`${BASE_URL}/users/add`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(memberData),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

// Delete a member by id. DummyJSON only simulates this and saves nothing.
export const deleteMember = async (accessToken, id) => {
  const response = await fetch(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};


//LOGIN CODE
// Token lifetime requested at login/refresh. 
const TOKEN_LIFETIME_MINS = 30;

// Error that remembers the HTTP status, e.g 401 unauthorized
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

//headers for a request that needs the access token
export const authHeaders = (accessToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
});

export const loginUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, expiresInMins: TOKEN_LIFETIME_MINS }),
  });

  // Wrong username/password comes back as 400
  if (!response.ok) {
    throw new ApiError("Login failed", response.status);
  }

  const data = await response.json();

  return {
    user: { name: `${data.firstName} ${data.lastName}`, image: data.image },
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
};

// GET /auth/me ..Used to check that a saved token is still valid.
export const getCurrentUser = async (accessToken) => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new ApiError("Could not verify user", response.status);
  }

  const data = await response.json();
  return { name: `${data.firstName} ${data.lastName}`, image: data.image };
};

// POST /auth/refresh -> { accessToken, refreshToken }. Gets a new access token.
export const refreshSession = async (refreshToken) => {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, expiresInMins: TOKEN_LIFETIME_MINS }),
  });

  if (!response.ok) {
    throw new ApiError("Could not refresh session", response.status);
  }

  const data = await response.json();
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
};