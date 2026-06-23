import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const UserRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const API = import.meta.env.VITE_API_URL;
  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("First name is required")
      .matches(/^[a-zA-Z\s]+$/, "Only letters allowed"),

    lastName: Yup.string()
      .required("Last name is required")
      .matches(/^[a-zA-Z\s]+$/, "Only letters allowed"),

    email: Yup.string().email("Invalid email format").required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required")
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
        "Password must contain at least one letter and one number"
      ),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError("");
      try {
        const { firstName, lastName, email, password } = values;
        const response = await axios.post(
          `${API}/api/auth/user/register`,
          {
            fullName: `${firstName} ${lastName}`,
            email,
            password,
          },
          { withCredentials: true }
        );
        console.log(response.data);
        navigate("/home");
      } catch (error) {
        console.error(error.response?.data || error.message);
        const message =
          error.response?.data?.message ||
          "Registration failed. Please check your details and try again.";
        setServerError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div style={styles.page}>
      <style>{`
        .pf-input {
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
        .pf-input:focus { border-color: #ff7a1a; box-shadow: 0 0 0 3px rgba(255,122,26,0.12); }
        .pf-input::placeholder { color: #565b6e; }
        .pf-input.has-error { border-color: #f43f5e; }

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

        .pf-row { display: flex; gap: 12px; }
        @media (max-width: 420px) { .pf-row { flex-direction: column; gap: 0; } }
      `}</style>

      <div className="pf-card" style={styles.card}>
        <div style={styles.brandRow}>
          <span style={styles.brandMark}>F</span>
          <span style={styles.brandName}>
            Food<span style={{ color: "#ff7a1a" }}>Reels</span>
          </span>
        </div>

        <h3 style={styles.heading}>Create your account</h3>
        <p style={styles.subheading}>Join thousands discovering great food nearby.</p>

        {serverError && <div style={styles.errorBanner}>{serverError}</div>}

        <form onSubmit={formik.handleSubmit}>
          <div className="pf-row">
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>First name</label>
              <input
                type="text"
                name="firstName"
                className={`pf-input ${
                  formik.touched.firstName && formik.errors.firstName ? "has-error" : ""
                }`}
                placeholder="Jane"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <small style={styles.errorText}>{formik.errors.firstName}</small>
              )}
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Last name</label>
              <input
                type="text"
                name="lastName"
                className={`pf-input ${
                  formik.touched.lastName && formik.errors.lastName ? "has-error" : ""
                }`}
                placeholder="Doe"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <small style={styles.errorText}>{formik.errors.lastName}</small>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              name="email"
              className={`pf-input ${
                formik.touched.email && formik.errors.email ? "has-error" : ""
              }`}
              placeholder="you@example.com"
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
                placeholder="At least 6 characters, 1 letter & 1 number"
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
            {formik.touched.password && formik.errors.password ? (
              <small style={styles.errorText}>{formik.errors.password}</small>
            ) : (
              <small style={styles.hintText}>Use at least 6 characters, with a letter and a number.</small>
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
              "Register"
            )}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/user/login" className="pf-link">
            Login
          </Link>
        </p>

        <p style={styles.footerTextSmall}>
          Own a restaurant?{" "}
          <Link to="/food-partner/register" className="pf-link">
            Register as a partner
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
    maxWidth: "420px",
    background: "#10131f",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "18px",
    padding: "36px 32px",
    boxShadow: "0 30px 60px -16px rgba(0,0,0,0.55)",
    color: "#f3f4f6",
  },

  brandRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "26px" },

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

  hintText: { color: "#6b7280", fontSize: "12px", marginTop: "6px", display: "block" },

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

export default UserRegister;