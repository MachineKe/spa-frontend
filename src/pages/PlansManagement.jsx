import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function PlansManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    billing: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchPlans = () => {
    setLoading(true);
    apiFetch("/superadmin/plans", { token })
      .then((res) => {
        setPlans(res.plans || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load plans");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPlans();
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
        await apiFetch(`/superadmin/plans/${editingId}`, {
          method: "PUT",
          body: form,
          token,
        });
        setMessage("Plan updated.");
      } else {
        await apiFetch("/superadmin/plans", {
          method: "POST",
          body: form,
          token,
        });
        setMessage("Plan created.");
      }
      setForm({ name: "", price: "", billing: "", description: "" });
      setEditingId(null);
      fetchPlans();
    } catch {
      setMessage("Failed to save plan.");
    }
  };

  const handleEdit = (plan) => {
    setForm({
      name: plan.name,
      price: plan.price,
      billing: plan.billing,
      description: plan.description || "",
    });
    setEditingId(plan.id);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await apiFetch(`/superadmin/plans/${id}`, { method: "DELETE", token });
      setMessage("Plan deleted.");
      fetchPlans();
    } catch {
      setMessage("Failed to delete plan.");
    }
  };

  const handleCancel = () => {
    setForm({ name: "", price: "", billing: "", description: "" });
    setEditingId(null);
    setMessage("");
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Subscription Plans</h1>
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
                <th className="text-left py-2">Price</th>
                <th className="text-left py-2">Billing</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="py-2">{plan.name}</td>
                  <td className="py-2">{plan.price}</td>
                  <td className="py-2">{plan.billing}</td>
                  <td className="py-2">{plan.description}</td>
                  <td className="py-2 flex gap-2">
                    <button
                      className="bg-gold text-black px-3 py-1 rounded font-bold hover:bg-yellow-400"
                      onClick={() => handleEdit(plan)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-400"
                      onClick={() => handleDelete(plan.id)}
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
          <h2 className="text-xl font-serif font-semibold mb-2">{editingId ? "Edit Plan" : "Add New Plan"}</h2>
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="text"
            name="name"
            placeholder="Plan Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <input
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            type="text"
            name="billing"
            placeholder="Billing (e.g. annual, per sale)"
            value={form.billing}
            onChange={handleChange}
            required
          />
          <textarea
            className="bg-black border border-gold rounded px-3 py-2 text-gold placeholder-gold/60 font-sans"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
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
