import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

function RestockLogs({ assets, token }) {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all(
      assets.map((asset) =>
        apiFetch(`/assets/${asset.id}/restock`, { token })
          .then((res) => ({ id: asset.id, logs: res.logs || [] }))
          .catch(() => ({ id: asset.id, logs: [] }))
      )
    ).then((results) => {
      if (!isMounted) return;
      const logsObj = {};
      results.forEach(({ id, logs }) => {
        logsObj[id] = logs;
      });
      setLogs(logsObj);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [assets, token]);

  if (assets.length === 0) return <div className="text-gold/80">No assets found.</div>;
  if (loading) return <div className="text-gold">Loading restock logs...</div>;

  return (
    <div className="flex flex-col gap-8">
      {assets.map((asset) => (
        <div key={asset.id}>
          <h3 className="text-lg font-serif font-semibold mb-2">{asset.name}</h3>
          {logs[asset.id] && logs[asset.id].length > 0 ? (
            <table className="w-full text-gold/90 font-sans text-sm mb-2">
              <thead>
                <tr>
                  <th className="text-left py-1">Date</th>
                  <th className="text-left py-1">Amount</th>
                  <th className="text-left py-1">Restocked By (User ID)</th>
                </tr>
              </thead>
              <tbody>
                {logs[asset.id].slice(0, 5).map((log) => (
                  <tr key={log.id}>
                    <td className="py-1">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-1">{log.amount}</td>
                    <td className="py-1">{log.restockedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gold/60 font-sans text-xs">No restock logs.</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Inventory() {
  const [assets, setAssets] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    minStock: 0,
    notes: "",
    storeId: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [restockId, setRestockId] = useState(null);
  const [restockAmount, setRestockAmount] = useState(1);
  const [restockLoading, setRestockLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchAssets = () => {
    setLoading(true);
    let url = "/assets";
    if (selectedStore !== "all") {
      url += `?storeId=${selectedStore}`;
    }
    apiFetch(url, { token })
      .then((res) => {
        setAssets(res.assets || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load inventory");
        setLoading(false);
      });
  };

  const fetchStores = () => {
    apiFetch("/stores", { token })
      .then((res) => setStores(res.stores || []))
      .catch(() => setStores([]));
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line
  }, [selectedStore]);

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        await apiFetch(`/assets/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
          token,
        });
      } else {
        // Omit storeId for POST (not in model)
        const { storeId, ...assetData } = form;
        // Ensure quantity and minStock are numbers
        assetData.quantity = Number(assetData.quantity);
        assetData.minStock = Number(assetData.minStock);
        await apiFetch("/assets", {
          method: "POST",
          body: JSON.stringify(assetData),
          headers: { "Content-Type": "application/json" },
          token,
        });
      }
      setForm({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        minStock: 0,
        notes: "",
        storeId: "",
      });
      setEditId(null);
      fetchAssets();
    } catch {
      alert("Failed to save asset");
    }
    setFormLoading(false);
  };

  const handleEdit = (asset) => {
    setEditId(asset.id);
    setForm({
      name: asset.name,
      category: asset.category,
      quantity: asset.quantity,
      unit: asset.unit,
      minStock: asset.minStock,
      notes: asset.notes || "",
      storeId: asset.storeId || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await apiFetch(`/assets/${id}`, { method: "DELETE", token });
      fetchAssets();
    } catch {
      alert("Failed to delete asset");
    }
  };

  const handleRestock = async (id) => {
    setRestockLoading(true);
    try {
      await apiFetch(`/assets/${id}/restock`, {
        method: "POST",
        body: JSON.stringify({ amount: restockAmount }),
        headers: { "Content-Type": "application/json" },
        token,
      });
      setRestockId(null);
      setRestockAmount(1);
      fetchAssets();
    } catch {
      alert("Failed to restock asset");
    }
    setRestockLoading(false);
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Product & Asset Management</h1>
        <div className="mb-4 flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block font-sans mb-1">Filter by Store</label>
            <select
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
            >
              <option value="all">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
          <form className="mb-8 flex flex-col md:flex-row gap-4 items-end" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Name"
              value={form.name}
              onChange={handleFormChange}
              required
            />
            <input
              type="text"
              name="category"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Category"
              value={form.category}
              onChange={handleFormChange}
              required
            />
            <input
              type="number"
              name="quantity"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleFormChange}
              min={0}
              required
            />
            <input
              type="text"
              name="unit"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Unit"
              value={form.unit}
              onChange={handleFormChange}
              required
            />
            <input
              type="number"
              name="minStock"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Min Stock"
              value={form.minStock}
              onChange={handleFormChange}
              min={0}
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
            <select
              name="storeId"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={form.storeId}
              onChange={handleFormChange}
            >
              <option value="">Unassigned/Shared</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
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
                  setForm({
                    name: "",
                    category: "",
                    quantity: 0,
                    unit: "",
                    minStock: 0,
                    notes: "",
                    storeId: "",
                  });
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
            <div className="w-full overflow-x-auto">
              <table className="min-w-max w-full text-gold/90 font-sans text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Name</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Category</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Quantity</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Unit</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Min Stock</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Store</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Last Restocked</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Notes</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-2 whitespace-nowrap">{item.name}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.category}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.quantity}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.unit}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.minStock}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {item.storeId
                          ? stores.find((s) => s.id === item.storeId)?.name || "—"
                          : "Shared"}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {item.lastRestocked
                          ? new Date(item.lastRestocked).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.notes}</td>
                      <td className="py-2 px-2 flex flex-col gap-2">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded mb-1"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded mb-1"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                        {restockId === item.id ? (
                          <form
                            className="flex gap-2 items-center"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleRestock(item.id);
                            }}
                          >
                            <input
                              type="number"
                              min={1}
                              value={restockAmount}
                              onChange={(e) => setRestockAmount(Number(e.target.value))}
                              className="w-16 bg-black border border-gold rounded px-2 py-1 text-gold"
                            />
                            <button
                              type="submit"
                              className="bg-green-500 text-white px-2 py-1 rounded"
                              disabled={restockLoading}
                            >
                              {restockLoading ? "Restocking..." : "Confirm"}
                            </button>
                            <button
                              type="button"
                              className="bg-gray-600 text-white px-2 py-1 rounded"
                              onClick={() => setRestockId(null)}
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded"
                            onClick={() => setRestockId(item.id)}
                          >
                            Restock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Restock Logs Section */}
        <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-serif font-bold mb-4">Restock Logs</h2>
          <RestockLogs assets={assets} token={token} />
        </div>
      </div>
    </DashboardLayout>
  );
}
