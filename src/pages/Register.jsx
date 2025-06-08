import React, { useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const PLANS = [
  { value: "monthly", label: "Monthly (Annual Payment)" },
  { value: "commission", label: "5% Commission per Sale" },
];

export default function Register() {
  const [form, setForm] = useState({
    businessName: "",
    subdomain: "",
    plan: "monthly",
    adminUsername: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (form.adminPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      await apiFetch("/tenants/register", {
        method: "POST",
        body: {
          name: form.businessName,
          subdomain: form.subdomain,
          plan: form.plan,
          adminUsername: form.adminUsername,
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
        },
        headers: { "Content-Type": "application/json" },
      });
      setMessage("Registration successful! You can now log in as the business admin.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Log error to browser console for debugging
      console.error("Tenant registration error:", err);
      // Optionally log form data (excluding passwords)
      console.log("Registration form data:", {
        businessName: form.businessName,
        subdomain: form.subdomain,
        plan: form.plan,
        adminUsername: form.adminUsername,
        adminEmail: form.adminEmail,
      });
      setError(
        err?.error ||
          (err?.errors && err.errors[0]?.msg) ||
          "Registration failed"
      );
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form
        className="bg-black/90 border border-gold rounded-lg p-8 shadow-lg w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-serif font-bold mb-6 text-gold">
          Register Your Business
        </h1>
        <label className="block mb-2 font-sans text-gold">Business Name</label>
        <input
          type="text"
          name="businessName"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.businessName}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Subdomain</label>
        <input
          type="text"
          name="subdomain"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.subdomain}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Plan</label>
        <select
          name="plan"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.plan}
          onChange={handleChange}
          required
        >
          {PLANS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <hr className="my-4 border-gold/30" />
        <h2 className="text-xl font-serif font-semibold mb-2 text-gold">Admin User</h2>
        <label className="block mb-2 font-sans text-gold">Username</label>
        <input
          type="text"
          name="adminUsername"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.adminUsername}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Email</label>
        <input
          type="email"
          name="adminEmail"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.adminEmail}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Password</label>
        <input
          type="password"
          name="adminPassword"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.adminPassword}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        {message && (
          <div className="mt-4 text-green-500 font-sans text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 text-red-500 font-sans text-center">
            {error}
          </div>
        )}
        <div className="mt-6 text-center">
          <span className="text-gold/80 font-sans">
            Already have an account?{" "}
            <Link to="/login" className="text-gold underline hover:text-yellow-400 transition-colors">
              Login
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
