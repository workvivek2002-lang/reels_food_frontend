import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const FoodPartnerRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Restaurant name is required")
      .matches(/^[a-zA-Z\s]+$/, "Only letters and spaces allowed"),

    contactName: Yup.string()
      .required("Contact name is required")
      .matches(/^[a-zA-Z\s]+$/, "Only letters allowed"),

    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),

    address: Yup.string().required("Address is required"),

    email: Yup.string().email("Invalid email format").required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      contactName: "",
      phone: "",
      address: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const { name, contactName, phone, address, email, password } = values;
        const response = await axios.post(
          `${API}/api/auth/food-partner/register`,
          { name, contactName, phone, address, email, password },
          { withCredentials: true }
        );
        console.log("Registration successful:", response.data);
        navigate("/food-partner/create-food");
      } catch (error) {
        console.error("Registration error:", error);
        const message =
          error.response?.data?.message ||
          "Registration failed. Please check your details and try again.";
        setServerError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fields = [
    { name: "name", label: "Restaurant name", type: "text", placeholder: "e.g. Karim's Kitchen" },
    { name: "contactName", label: "Contact person name", type: "text", placeholder: "Who should we contact?" },
    { name: "phone", label: "Phone number", type: "tel", placeholder: "10-digit mobile number" },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        .pf-input, .pf-textarea {
          width: 100%;
          padding: 13px 14px;
          background: #0d1018;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 14.5px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pf-input:focus, .pf-textarea:focus { border-color: #ff7a1a; box-shadow: 0 0 0 3px rgba(255,122,26,0.12); }
        .pf-input::placeholder, .pf-textarea::placeholder { color: #565b6e; }
        .pf-input.has-error, .pf-textarea.has-error { border-color: #f43f5e; }
        .pf-textarea { resize: vertical; min-height: 64px; }

        .pf-btn { transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease; }
        .pf-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .pf-btn:active:not(:disabled) { transform: translateY(0); }
        .pf-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .pf-link { color: #ff9a4d; cursor: pointer; font-weight: 600; text-decoration: none; }
        .pf-link:hover { text-decoration: underline; }

        .pf-eye { background: none; border: none; cursor: pointer; color: #7b8094; font-size: 13px; }
        .pf-eye:hover { color: #c8cbd9; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .pf-spinner { animation: spin 0.7s linear infinite; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .pf-card { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }

        .pf-card::-webkit-scrollbar { width: 6px; }
        .pf-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 6px; }
      `}</style>

      <div className="pf-card" style={styles.card}>
        <div style={styles.brandRow}>
          <span style={styles.brandMark}>F</span>
          <span style={styles.brandName}>
            Food<span style={{ color: "#ff7a1a" }}>Reels</span>
          </span>
        </div>

        <h3 style={styles.heading}>Become a Partner</h3>
        <p style={styles.subheading}>
          Set up your restaurant profile and start posting reels in minutes.
        </p>

        {serverError && <div style={styles.errorBanner}>{serverError}</div>}

        <form onSubmit={formik.handleSubmit}>
          {fields.map((f) => (
            <div style={styles.formGroup} key={f.name}>
              <label style={styles.label}>{f.label}</label>
              <input
                type={f.type}
                name={f.name}
                className={`pf-input ${
                  formik.touched[f.name] && formik.errors[f.name] ? "has-error" : ""
                }`}
                placeholder={f.placeholder}
                value={formik.values[f.name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched[f.name] && formik.errors[f.name] && (
                <small style={styles.errorText}>{formik.errors[f.name]}</small>
              )}
            </div>
          ))}

          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <textarea
              name="address"
              className={`pf-textarea ${
                formik.touched.address && formik.errors.address ? "has-error" : ""
              }`}
              placeholder="Street, area, city, pincode"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={2}
            />
            {formik.touched.address && formik.errors.address && (
              <small style={styles.errorText}>{formik.errors.address}</small>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              className={`pf-input ${
                formik.touched.email && formik.errors.email ? "has-error" : ""
              }`}
              placeholder="you@restaurant.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <small style={styles.errorText}>{formik.errors.email}</small>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`pf-input ${
                  formik.touched.password && formik.errors.password ? "has-error" : ""
                }`}
                placeholder="At least 6 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="new-password"
                style={{ paddingRight: "52px" }}
              />
              <button
                type="button"
                className="pf-eye"
                style={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <small style={styles.errorText}>{formik.errors.password}</small>
            )}
          </div>

          <button
            type="submit"
            className="pf-btn"
            style={styles.submitBtn}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <span style={styles.btnContent}>
                <span className="pf-spinner" style={styles.spinnerDot} />
                Creating account…
              </span>
            ) : (
              "Register as Partner"
            )}
          </button>
        </form>

        <p style={styles.footerText}>
          Already a partner?{" "}
          <Link to="/food-partner/login" className="pf-link">
            Login
          </Link>
        </p>

        <p style={styles.footerTextSmall}>
          Looking for the diner app?{" "}
          <Link to="/user/register" className="pf-link">
            Sign up as a user
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(ellipse at 50% 0%, rgba(255,122,26,0.08), transparent 55%), #080a11",
    padding: "24px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#10131f",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "36px 32px",
    boxShadow: "0 30px 60px -16px rgba(0,0,0,0.55)",
    color: "#f3f4f6",
  },

  brandRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" },

  brandMark: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background: "linear-gradient(135deg, #ff7a1a, #ffb347)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "15px",
    color: "#0a0a0a",
  },

  brandName: { fontSize: "16px", fontWeight: "800", letterSpacing: "-0.3px" },

  heading: { margin: "0 0 6px 0", fontSize: "23px", fontWeight: "800", letterSpacing: "-0.5px" },

  subheading: { margin: "0 0 22px 0", fontSize: "13.5px", color: "#8b90a3", lineHeight: "1.5" },

  errorBanner: {
    background: "rgba(244, 63, 94, 0.1)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    color: "#fca5b1",
    fontSize: "13px",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "18px",
  },

  formGroup: { marginBottom: "16px" },

  label: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "600",
    color: "#a3a9bd",
    marginBottom: "7px",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontWeight: "600",
  },

  errorText: { color: "#f87171", fontSize: "12.5px", marginTop: "6px", display: "block" },

  submitBtn: {
    width: "100%",
    background: "#ff7a1a",
    color: "#0a0a0a",
    border: "none",
    padding: "13px 0",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "6px",
    boxShadow: "0 10px 26px rgba(255,122,26,0.28)",
  },

  btnContent: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" },

  spinnerDot: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(10,10,10,0.25)",
    borderTopColor: "#0a0a0a",
    borderRadius: "50%",
    display: "inline-block",
  },

  footerText: { textAlign: "center", marginTop: "22px", marginBottom: "4px", fontSize: "13.5px", color: "#c8cbd9" },

  footerTextSmall: { textAlign: "center", marginTop: "0", fontSize: "12.5px", color: "#6b7280" },
};

export default FoodPartnerRegister;