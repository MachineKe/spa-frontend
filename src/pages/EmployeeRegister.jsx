import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch, getEmployeeRegisterInfo } from "../services/api";

export default function EmployeeRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [form, setForm] = useState({
    username: "",
    phone: "",
    password: "",
    role: "",
    roleDescription: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [infoLoading, setInfoLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setInfoLoading(true);
    getEmployeeRegisterInfo(token)
      .then((info) => {
        setForm((f) => ({
          ...f,
          username: info.username || "",
          role: info.role || "",
          roleDescription: info.roleDescription || "",
        }));
      })
      .catch(() => {
        setError("Invalid or expired registration link.");
      })
      .finally(() => setInfoLoading(false));
  }, [token]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch("/auth/employee-register", {
        method: "POST",
        body: {
          token,
          username: form.username,
          phone: form.phone,
          password: form.password,
          role: form.role,
          roleDescription: form.roleDescription,
        },
      });
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err?.error ||
          "Registration failed. The link may be invalid or expired."
      );
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gold">Invalid Link</h2>
          <p className="text-gold">No registration token found in the link.</p>
        </div>
      </div>
    );
  }

  if (infoLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gold">Employee Registration</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-gold font-sans">Username</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <label className="text-gold font-sans">Phone Number</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <label className="text-gold font-sans">Password</label>
          <input
            type="password"
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <label className="text-gold font-sans">Role</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="role"
            value={form.role}
            readOnly
            tabIndex={-1}
          />
          <label className="text-gold font-sans">Role Description</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="roleDescription"
            value={form.roleDescription}
            readOnly
            tabIndex={-1}
          />
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
          <button
            type="submit"
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
