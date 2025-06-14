import { useState } from "react";
import { apiFetch } from "../services/api";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [twofa, setTwofa] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handle2faChange = (e) => {
    setTwofa(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // Step 1: email/password
      if (step === 1) {
        const res = await apiFetch("/auth/login", {
          method: "POST",
          body: form,
        });
        if (res.require2fa) {
          setStep(2);
        } else if (res.token) {
          // Save token, redirect, etc.
          localStorage.setItem("token", res.token);
          // Role-based dashboard redirect
          const role = (res.role || (res.user && res.user.role) || "").toLowerCase();
          if (role === "superadmin") {
            window.location.href = "/superadmin";
          } else if (role === "admin") {
            window.location.href = "/dashboard";
          } else if (role === "manager") {
            window.location.href = "/dashboard/admin";
          } else if (role === "tenant") {
            window.location.href = "/dashboard";
          } else if (role === "employee" || role === "staff") {
            window.location.href = "/dashboard/employee";
          } else if (role === "customer") {
            window.location.href = "/dashboard/customer";
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          setError("Invalid login response.");
        }
      } else if (step === 2) {
        // Step 2: 2FA code
        const res = await apiFetch("/auth/2fa", {
          method: "POST",
          body: { email: form.email, code: twofa },
        });
        if (res.token) {
          localStorage.setItem("token", res.token);
          const role = (res.role || (res.user && res.user.role) || "").toLowerCase();
          if (role === "superadmin") {
            window.location.href = "/superadmin";
          } else if (role === "admin") {
            window.location.href = "/dashboard";
          } else if (role === "manager") {
            window.location.href = "/dashboard/admin";
          } else if (role === "tenant") {
            window.location.href = "/dashboard";
          } else if (role === "employee" || role === "staff") {
            window.location.href = "/dashboard/employee";
          } else if (role === "customer") {
            window.location.href = "/dashboard/customer";
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          setError("Invalid 2FA code.");
        }
      }
    } catch (err) {
      setError("Invalid credentials or 2FA code.");
    }
    setSubmitting(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-gold px-4 py-12">
      <div className="w-full max-w-md bg-black/90 rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-center">Admin Login</h1>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <input
                className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </>
          ) : (
            <>
              <input
                className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
                type="text"
                name="twofa"
                placeholder="2FA Code"
                value={twofa}
                onChange={handle2faChange}
                required
              />
            </>
          )}
          {error && (
            <div className="text-red-400 text-sm font-sans">{error}</div>
          )}
          <button
            type="submit"
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            disabled={submitting}
          >
            {step === 1 ? "Login" : "Verify 2FA"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gold/80 font-sans">
            Don't have an account?{" "}
            <Link to="/register" className="text-gold underline hover:text-yellow-400 transition-colors">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
