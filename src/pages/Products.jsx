import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

function ProductAnalytics({ products }) {
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lowStock = products.filter((p) => p.stock !== undefined && p.stock < 5);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    apiFetch("/products/top-selling", { token })
      .then((res) => {
        setTopSelling(res.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analytics");
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg mt-8">
      <h2 className="text-2xl font-serif font-bold mb-4">Product Analytics</h2>
      {loading ? (
        <div className="text-gold">Loading analytics...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-serif font-semibold mb-2">Top Selling Products</h3>
            {topSelling.length === 0 ? (
              <div className="text-gold/80 font-sans">No sales data available.</div>
            ) : (
              <table className="w-full text-gold/90 font-sans text-sm mb-2">
                <thead>
                  <tr>
                    <th className="text-left py-1">Name</th>
                    <th className="text-left py-1">Category</th>
                    <th className="text-left py-1">Sold</th>
                    <th className="text-left py-1">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topSelling.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1">{p.name}</td>
                      <td className="py-1">{p.category}</td>
                      <td className="py-1">{p.sold}</td>
                      <td className="py-1">Ksh {p.revenue?.toLocaleString() ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h3 className="text-lg font-serif font-semibold mb-2">Stock Alerts</h3>
            {lowStock.length === 0 ? (
              <div className="text-gold/80 font-sans">All products sufficiently stocked.</div>
            ) : (
              <table className="w-full text-gold/90 font-sans text-sm mb-2">
                <thead>
                  <tr>
                    <th className="text-left py-1">Name</th>
                    <th className="text-left py-1">Category</th>
                    <th className="text-left py-1">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1">{p.name}</td>
                      <td className="py-1">{p.category}</td>
                      <td className="py-1">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: 0,
    sku: "",
    stock: 0,
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    apiFetch("/products", { token })
      .then((res) => {
        setProducts(res.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        const token = localStorage.getItem("token");
        await apiFetch(`/products/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
          token,
        });
      } else {
        const token = localStorage.getItem("token");
        await apiFetch("/products", {
          method: "POST",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
          token,
        });
      }
      setForm({
        name: "",
        category: "",
        price: 0,
        sku: "",
        stock: 0,
        isActive: true,
      });
      setEditId(null);
      fetchProducts();
    } catch {
      alert("Failed to save product");
    }
    setFormLoading(false);
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await apiFetch(`/products/${id}`, { method: "DELETE", token });
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Product Catalog Management</h1>
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
              name="price"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Price"
              value={form.price}
              onChange={handleFormChange}
              min={0}
              required
            />
            <input
              type="text"
              name="sku"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="SKU"
              value={form.sku}
              onChange={handleFormChange}
              required
            />
            <input
              type="number"
              name="stock"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              placeholder="Stock"
              value={form.stock}
              onChange={handleFormChange}
              min={0}
              required
            />
            <label className="flex items-center gap-2 text-gold font-sans">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleFormChange}
              />
              Active
            </label>
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
                    price: 0,
                    sku: "",
                    stock: 0,
                    isActive: true,
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
                    <th className="text-left py-2 px-2 whitespace-nowrap">Price</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">SKU</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Stock</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Active</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-2 whitespace-nowrap">{item.name}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.category}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.price}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.sku}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.stock}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{item.isActive ? "Yes" : "No"}</td>
                      <td className="py-2 px-2 flex flex-col gap-2">
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
            </div>
          )}
        </div>
        {/* Product Analytics Section */}
        <ProductAnalytics products={products} />
      </div>
    </DashboardLayout>
  );
}
