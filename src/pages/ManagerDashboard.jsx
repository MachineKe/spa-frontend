import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

const managerNavLinks = [
  { to: "#pending", label: "Pending Sales", key: "pending" },
  { to: "#summary", label: "Sales Summary", key: "summary" },
  { to: "#stores", label: "Stores", key: "stores" },
  { to: "#employees", label: "Employees", key: "employees" },
  { to: "#settings", label: "Settings", key: "settings" }
];

export default function ManagerDashboard() {
  const [section, setSection] = useState("pending");
  const [pendingSales, setPendingSales] = useState([]);
  const [approvedSales, setApprovedSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      apiFetch("/saleslogs?status=pending", { token }),
      apiFetch("/saleslogs?status=approved", { token }),
      apiFetch("/products", { token }),
      apiFetch("/stores", { token }),
      apiFetch("/employees", { token })
    ])
      .then(([pendingRes, approvedRes, prodRes, storeRes, empRes]) => {
        setPendingSales(pendingRes.saleslogs || []);
        setApprovedSales(approvedRes.saleslogs || []);
        setProducts(prodRes.products || []);
        setStores(storeRes.stores || []);
        setEmployees(empRes.employees || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout
      navLinks={managerNavLinks.map((s) => ({
        ...s,
        to: "#" + s.key,
        label: (
          <button
            type="button"
            className={`block w-full text-left px-2 py-2 rounded font-sans transition-colors ${
              section === s.key
                ? "bg-black/80 text-gold font-bold border-l-4 border-gold"
                : "bg-black/80 text-gold hover:text-yellow-400 hover:bg-gold/10"
            }`}
            style={{
              textDecoration: "none",
            }}
            onClick={() => setSection(s.key)}
          >
            {s.label}
          </button>
        ),
        onClick: () => setSection(s.key),
      }))}
    >
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Manager Dashboard</h1>
      {section === "pending" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Pending Sales for Approval</h2>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : pendingSales.length === 0 ? (
            <div className="text-gold/80 font-sans">No pending sales.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Quantity</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Store</th>
                  <th className="text-left py-2">Employee</th>
                  <th className="text-left py-2">Transaction ID</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2">{s.soldAt ? new Date(s.soldAt).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{products.find((p) => p.id === s.productId)?.name || s.productId}</td>
                    <td className="py-2">{s.quantity}</td>
                    <td className="py-2">Ksh {s.totalPrice?.toLocaleString() ?? 0}</td>
                    <td className="py-2">{stores.find((st) => st.id === s.storeId)?.name || s.storeId}</td>
                    <td className="py-2">{s.employeeId}</td>
                    <td className="py-2">{s.transactionId}</td>
                    <td className="py-2">
                      <button
                        className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                        disabled={actionLoading}
                        onClick={() => handleAction(s.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded"
                        disabled={actionLoading}
                        onClick={() => handleAction(s.id, "reject")}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {section === "summary" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Sales Summary</h2>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : approvedSales.length === 0 ? (
            <div className="text-gold/80 font-sans">No approved sales.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Quantity</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Store</th>
                  <th className="text-left py-2">Employee</th>
                  <th className="text-left py-2">Commission</th>
                </tr>
              </thead>
              <tbody>
                {approvedSales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2">{s.soldAt ? new Date(s.soldAt).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{products.find((p) => p.id === s.productId)?.name || s.productId}</td>
                    <td className="py-2">{s.quantity}</td>
                    <td className="py-2">Ksh {s.totalPrice?.toLocaleString() ?? 0}</td>
                    <td className="py-2">{stores.find((st) => st.id === s.storeId)?.name || s.storeId}</td>
                    <td className="py-2">{s.employeeId}</td>
                    <td className="py-2">{s.commissionAmount ? `Ksh ${s.commissionAmount.toLocaleString()}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Summary totals */}
          <div className="mt-4">
            <div className="text-gold/90 font-sans">
              Total Approved Sales: Ksh{" "}
              {approvedSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0).toLocaleString()}
            </div>
            <div className="text-gold/90 font-sans">
              Total Commission Owed: Ksh{" "}
              {approvedSales.reduce((sum, s) => sum + (s.commissionAmount || 0), 0).toLocaleString()}
            </div>
          </div>
        </section>
      )}
      {section === "stores" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Stores</h2>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : stores.length === 0 ? (
            <div className="text-gold/80 font-sans">No stores found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Store Name</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Manager</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">{s.location}</td>
                    <td className="py-2">{s.managerName || s.managerId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {section === "employees" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Employees</h2>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : employees.length === 0 ? (
            <div className="text-gold/80 font-sans">No employees found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Store</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2">{e.name}</td>
                    <td className="py-2">{e.email}</td>
                    <td className="py-2">{e.role}</td>
                    <td className="py-2">{stores.find((s) => s.id === e.storeId)?.name || e.storeId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {section === "settings" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Settings</h2>
          <div className="text-gold/90 font-sans">
            {/* Placeholder for tenant admin settings */}
            Settings management coming soon.
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}
