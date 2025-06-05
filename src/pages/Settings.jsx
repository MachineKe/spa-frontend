import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

export default function Settings() {
  const [tenant, setTenant] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    mapUrl: "",
    features: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch tenant info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    apiFetch("/tenants/me", { token })
      .then((res) => {
        setTenant(res.tenant);
        setForm({
          name: res.tenant.name || "",
          address: res.tenant.address || "",
          email: res.tenant.email || "",
          phone: res.tenant.phone || "",
          mapUrl: res.tenant.mapUrl || "",
          features: Array.isArray(res.tenant.features) ? res.tenant.features : [],
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tenant info");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setForm((prev) => {
      const features = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await apiFetch("/tenants/me", {
        method: "PUT",
        body: form,
        token,
      });
      setTenant(res.tenant);
      setMessage("Settings updated successfully");
    } catch (err) {
      setError("Failed to update settings");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-gold text-xl p-8">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Business Settings</h1>
        <form
          className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8 flex flex-col gap-6"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-serif font-semibold mb-2">Business Info</h2>
          <label className="font-sans">Business Name</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label className="font-sans">Address</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          <label className="font-sans">Email</label>
          <input
            type="email"
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <label className="font-sans">Phone</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <label className="font-sans">Google Maps URL</label>
          <input
            className="bg-black border border-gold rounded px-2 py-1 text-gold"
            name="mapUrl"
            value={form.mapUrl}
            onChange={handleChange}
          />

          <h2 className="text-xl font-serif font-semibold mt-6 mb-2">Feature Toggles</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 font-sans">
              <input
                type="checkbox"
                className="accent-gold"
                checked={form.features.includes("giftCards")}
                onChange={() => handleFeatureToggle("giftCards")}
              />
              Enable Gift Cards
            </label>
            <label className="flex items-center gap-2 font-sans">
              <input
                type="checkbox"
                className="accent-gold"
                checked={form.features.includes("promotions")}
                onChange={() => handleFeatureToggle("promotions")}
              />
              Enable Promotions
            </label>
            <label className="flex items-center gap-2 font-sans">
              <input
                type="checkbox"
                className="accent-gold"
                checked={form.features.includes("employeeSelfService")}
                onChange={() => handleFeatureToggle("employeeSelfService")}
              />
              Enable Employee Self-Service
            </label>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {message && <div className="text-green-500">{message}</div>}
          <button
            type="submit"
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors mt-4"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
