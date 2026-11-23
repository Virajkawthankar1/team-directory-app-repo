import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Returns { username: "message", password: "message" }. Empty object = valid.
const validate = ({ username, password }) => {
    const errors = {};

    if (!username.trim()) {
        errors.username = "Username is required";
    } else if (username.trim().length < 3) {
        errors.username = "Username must be at least 3 characters";
    }

    if (!password) {
        errors.password = "Password is required";
    } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    return errors;
};

export const LoginPage = () => {
    const navigate = useNavigate();
    

    const [values, setValues] = useState({ username: "", password: "", remember: false });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState("");

    const { login, sessionMessage } = useAuth();

    // One handler for the text inputs and the checkbox
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));   // clear that field's error
        setLoginError("");                                // clear the failed-login alert
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;   // stop if invalid

        setIsLoggingIn(true);
        setLoginError("");

        try {
            await login(values.username.trim(), values.password, values.remember);
            navigate("/", { replace: true });                     // success -> Directory page
        } catch (err) {
            // 4xx > the server rejected the credentials. Anything else = network/server problem.
            if (err.status >= 400 && err.status < 500) {
                setLoginError("Invalid username or password");
            } else {
                setLoginError("Something went wrong. Please check your connection and try again.");
            }
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: "420px" }}>
            <div className="card shadow-sm">
                <div className="card-body">
                    <h3 className="card-title mb-3">Team Directory Login</h3>

                    {sessionMessage && <div className="alert alert-warning">{sessionMessage}</div>}
                    {loginError && <div className="alert alert-danger">{loginError}</div>}

                    <form onSubmit={handleSubmit} noValidate>
                        {/* Username */}
                        <div className="mb-3">
                            <label className="form-label" htmlFor="username">Username</label>
                            <input
                                id="username"
                                name="username"
                                autoComplete="username"
                                className={`form-control ${errors.username ? "is-invalid" : ""}`}
                                value={values.username}
                                onChange={handleChange}
                            />
                            <div className="invalid-feedback">{errors.username}</div>
                        </div>

                        {/* Password with show/hide toggle */}
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div className="input-group has-validation">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                    value={values.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                                <div className="invalid-feedback">{errors.password}</div>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="form-check mb-3">
                            <input
                                id="remember"
                                name="remember"
                                type="checkbox"
                                className="form-check-input"
                                checked={values.remember}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="remember">Remember me</label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={isLoggingIn}>
                            {isLoggingIn && (
                                <span className="spinner-border spinner-border-sm me-2" role="status" />
                            )}
                            {isLoggingIn ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};