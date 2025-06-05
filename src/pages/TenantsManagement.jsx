import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function TenantsManagement() {
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    contactInfo: "",
    planId: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      apiFetch("/superadmin/tenants", { token }),
      apiFetch("/superadmin/plans", { token }),
    ])
      .then(([tenantsRes, plansRes]) => {
        setTenants(tenantsRes.tenants || []);
        setPlans(plansRes.plans || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tenants or plans");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await apiFetch(`/superadmin/tenants/${editingId}`, {
          method: "PUT",
          body: form,
          token,
        });
        setMessage("Tenant updated.");
      } else {
        await apiFetch("/superadmin/tenants", {
          method: "POST",
          body: form,
          token,
        });
        setMessage("Tenant created.");
      }
      setForm({ name: "", contactInfo: "", planId: "" });
      setEditingId(null);
      fetchData();
    } catch {
      setMessage("Failed to save tenant.");
    }
  };

  const handleEdit = (tenant) => {
    setForm({
      name: tenant.name,
      contactInfo: tenant.contactInfo || "",
      planId: tenant.planId || "",
    });
    setEditingId(tenant.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tenant?")) return;
    try {
      await apiFetch(`/superadmin/tenants/${id}`, { method: "DELETE", token });
      setMessage("Tenant deleted.");
      fetchData();
    } catch {
      setMessage("Failed to delete tenant.");
    }
  };

  const handleCancel = () => {
    setForm({ name: "", contactInfo: "", planId: "" });
    setEditingId(null);
    setMessage("");
  };

  const getPlanName = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    return plan ? plan.name : "";
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Tenants Management</h1>
      <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
        {loading ? (
          <div className="text-gold">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="w-full text-gold/90 font-sans">
            <thead>
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Contact Info</th>
                <th className="text-left py-2">Plan</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="py-2">{tenant.name}</td>
                  <td className="py-2">{tenant.contactInfo}</td>
                  <td className="py-2">{getPlanName(tenant.planId)}</td>
                  <td className="py-2 flex gap-2">
                    <button
                      className="bg-gold text-black px-2 py-1 rounded font-bold"
                      onClick={() => handleEdit(tenant)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded font-bold"
                      onClick={() => handleDelete(tenant.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <h2 className="text-xl font-serif font-semibold mb-2">{editingId ? "Edit Tenant" : "Add New Tenant"}</h2>
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="text"
            name="name"
            placeholder="Tenant Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="text"
            name="contactInfo"
            placeholder="Contact Info"
            value={form.contactInfo}
            onChange={handleChange}
          />
          <select
            className="bg-black border border-gold rounded px-3 py-2 text-gold font-sans"
            name="planId"
            value={form.planId}
            onChange={handleChange}
            required
          >
            <option value="">Select Plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
          {message && (
            <div className={`mt-2 ${message.includes("fail") ? "text-red-500" : "text-green-500"}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
