import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

export default function StoresManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", location: "", notes: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchStores = () => {
    setLoading(true);
    apiFetch("/stores", { token })
      .then((res) => {
        setStores(res.stores || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load stores");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        await apiFetch(`/stores/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
          token,
        });
      } else {
        await apiFetch("/stores", {
          method: "POST",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
          token,
        });
      }
      setForm({ name: "", location: "", notes: "" });
      setEditId(null);
      fetchStores();
    } catch {
      alert("Failed to save store");
    }
    setFormLoading(false);
  };

  const handleEdit = (store) => {
    setEditId(store.id);
    setForm({
      name: store.name,
      location: store.location,
      notes: store.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this store?")) return;
    try {
      await apiFetch(`/stores/${id}`, { method: "DELETE", token });
      fetchStores();
    } catch {
      alert("Failed to delete store");
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Store Management</h1>
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
          <form className="mb-8 flex flex-col md:flex-row gap-4 items-end" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Store Name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
            <input
              type="text"
              name="location"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Location"
              value={form.location}
              onChange={handleFormChange}
              required
            />
            <input
              type="text"
              name="notes"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Notes"
              value={form.notes}
              onChange={handleFormChange}
            />
            <button
              type="submit"
              className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
              disabled={formLoading}
            >
              {formLoading ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            {editId && (
              <button
                type="button"
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  setEditId(null);
                  setForm({ name: "", location: "", notes: "" });
                }}
              >
                Cancel
              </button>
            )}
          </form>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="w-full text-gold/90 font-sans">
              <thead>
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Notes</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.location}</td>
                    <td className="py-2">{item.notes}</td>
                    <td className="py-2 flex flex-col gap-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mb-1"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(item.id)}
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
      </div>
    </DashboardLayout>
  );
}
