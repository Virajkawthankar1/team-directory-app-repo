import { useState, useRef, useEffect } from "react";
import { addMember } from "../services/api";
import { useAuth } from "../context/AuthContext";



const emptyForm = { name: "", email: "", phone: "", city: "" };

// Returns an object like { name: "message", email: "message" }. Empty object = valid.
const validate = (values, existingMembers) => {
  const errors = {};

  if (values.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  const email = values.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email";
  } else if (existingMembers.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
    errors.email = "This email already exists";   // case-insensitive duplicate check
  }

  if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Phone must be 10 digits";
  }

  if (!values.city.trim()) {
    errors.city = "City is required";
  }

  return errors;
};

export const AddUserForm = ({ members, onAdd }) => {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { accessToken } = useAuth();

  const nameRef = useRef(null);

  // Auto-focus the Name field when the form first loads
  useEffect(() => {
    nameRef.current.focus();
  }, []);

  // One handler for all inputs: the input's name attribute tells us which field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));   // clear that field's error on edit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();                       // stop the page from reloading
    setSubmitError("");

    const validationErrors = validate(values, members);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;   // stop if invalid

    // Split "John Van Doe" into firstName "John" and lastName "Van Doe"
    const [firstName, ...rest] = values.name.trim().split(/\s+/);
    const lastName = rest.join(" ");

    setIsSaving(true);
    try {
      const created = await addMember(accessToken, {
        firstName,
        lastName,
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: { city: values.city.trim() },
        company: { name: "N/A" },
      });

      // DummyJSON returns the same id every time and saves nothing,
      // so we give each member our own unique id.
      onAdd({
        ...created,
        id: Date.now(),
        isLocal: true,  // added in the browser only, not known to the server
        image: `https://dummyjson.com/icon/${encodeURIComponent(firstName)}/128`,
        company: created.company || { name: "N/A" },
      });

      setValues(emptyForm);                   // reset the form
      nameRef.current.focus();                // focus back on Name
    } catch (err) {
      // Keep the entered values so the user can retry
      setSubmitError(err.message || "Could not add member. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Add Member</h5>

        {submitError && <div className="alert alert-danger">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                ref={nameRef}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={values.name}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.name}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={values.email}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.email}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={values.phone}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.phone}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label" htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                className={`form-control ${errors.city ? "is-invalid" : ""}`}
                value={values.city}
                onChange={handleChange}
              />
              <div className="invalid-feedback">{errors.city}</div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-3" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
};