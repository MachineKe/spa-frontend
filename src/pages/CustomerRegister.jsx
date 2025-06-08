import React, { useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function CustomerRegister() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    tenantIds: [],
  });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch tenants and optionally preselect from query param
  React.useEffect(() => {
    apiFetch("/tenants/public")
      .then((res) => setTenants(res.tenants || []))
      .catch(() => setTenants([]));
    const params = new URLSearchParams(location.search);
    const tid = params.get("tenantId");
    if (tid) setForm((prev) => ({ ...prev, tenantIds: [tid] }));
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value, type, options } = e.target;
    if (name === "tenantIds") {
      // Multi-select
      const selected = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setForm((prev) => ({ ...prev, tenantIds: selected }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (!form.tenantIds || form.tenantIds.length === 0) {
      setError("At least one tenant must be selected.");
      setLoading(false);
      return;
    }
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          username: form.username,
          email: form.email,
          password: form.password,
          role: "Customer",
          tenantIds: form.tenantIds,
        },
        headers: { "Content-Type": "application/json" },
      });
      setMessage("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
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
          Customer Registration
        </h1>
        <label className="block mb-2 font-sans text-gold">Username</label>
        <input
          type="text"
          name="username"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.username}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Email</label>
        <input
          type="email"
          name="email"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.email}
          onChange={handleChange}
          required
        />
        <label className="block mb-2 font-sans text-gold">Password</label>
        <input
          type="password"
          name="password"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.password}
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
        <label className="block mb-2 font-sans text-gold">Business/Tenant(s)</label>
        <select
          name="tenantIds"
          className="w-full mb-4 px-3 py-2 rounded border border-gold bg-black text-gold"
          value={form.tenantIds}
          onChange={handleChange}
          multiple
          required
          size={Math.min(tenants.length, 5) || 2}
        >
          {tenants.length === 0 ? (
            <option value="">No tenants available</option>
          ) : (
            tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subdomain || t.id})
              </option>
            ))
          )}
        </select>
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
