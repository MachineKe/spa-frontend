import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

const employeeNavLinks = [
  { to: "#payouts", label: "My Payouts", key: "payouts" },
  { to: "#sales", label: "Sales", key: "sales" },
  { to: "#attendance", label: "Attendance", key: "attendance" },
  { to: "#documents", label: "Documents", key: "documents" },
  { to: "#leaves", label: "Leave Requests", key: "leaves" },
];

export default function EmployeeDashboard() {
  const [section, setSection] = useState("payouts");
  const [user, setUser] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [saleForm, setSaleForm] = useState({
    productId: "",
    quantity: 1,
    totalPrice: "",
    storeId: "",
    transactionId: ""
  });
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleError, setSaleError] = useState("");
  const [saleSuccess, setSaleSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState("annual");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [attStatus, setAttStatus] = useState("present");
  const [attNotes, setAttNotes] = useState("");
  const [attLoading, setAttLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [docLoading, setDocLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    apiFetch("/auth/me", { token })
      .then(async (res) => {
        setUser(res.user);
        // Fetch employee record by email (self-service endpoint)
        const empRes = await apiFetch(`/employees/by-email/${encodeURIComponent(res.user.email)}`, { token });
        const employee = empRes.employee;
        if (!employee) {
          setError("Employee record not found for this user.");
          setLoading(false);
          return;
        }
        setEmployeeId(employee.id);
        // Fetch products, stores, and sales for this employee
        return Promise.all([
          apiFetch(`/employees/${employee.id}/salary-history`, { token }),
          apiFetch(`/employees/${employee.id}/attendance`, { token }),
          apiFetch(`/employees/${employee.id}/leave-requests`, { token }),
          apiFetch(`/employees/${employee.id}/documents`, { token }),
          apiFetch(`/products`, { token }),
          apiFetch(`/stores`, { token }),
          apiFetch(`/saleslogs?employeeId=${employee.id}`, { token })
        ]);
      })
      .then((results) => {
        if (!results) return;
        const [salaryRes, attRes, leaveRes, docRes, prodRes, storeRes, salesRes] = results;
        setPayouts(salaryRes.payouts || []);
        setAttendance(attRes.attendance || []);
        setLeaves(leaveRes.leaves || []);
        setDocs(docRes.docs || []);
        setProducts(prodRes.products || []);
        setStores(storeRes.stores || []);
        setSales(salesRes.saleslogs || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load self-service data");
        setLoading(false);
      });
  }, []);

  const logAttendance = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setAttLoading(true);
    try {
      await apiFetch(`/employees/${employeeId}/attendance`, {
        method: "POST",
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          status: attStatus,
          notes: attNotes,
        }),
        token: localStorage.getItem("token"),
        headers: { "Content-Type": "application/json" },
      });
      const attRes = await apiFetch(`/employees/${employeeId}/attendance`, { token: localStorage.getItem("token") });
      setAttendance(attRes.attendance || []);
      setAttNotes("");
    } catch {
      alert("Failed to log attendance");
    }
    setAttLoading(false);
  };

  const handleSaleFormChange = (e) => {
    const { name, value } = e.target;
    setSaleForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const submitSale = async (e) => {
    e.preventDefault();
    setSaleLoading(true);
    setSaleError("");
    setSaleSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/sales/record`, {
        method: "POST",
        body: JSON.stringify({
          productId: saleForm.productId,
          quantity: Number(saleForm.quantity),
          totalPrice: Number(saleForm.totalPrice),
          storeId: saleForm.storeId,
          transactionId: saleForm.transactionId
        }),
        token,
        headers: { "Content-Type": "application/json" }
      });
      setSaleSuccess("Sale recorded and pending approval.");
      setSaleForm({
        productId: "",
        quantity: 1,
        totalPrice: "",
        storeId: "",
        transactionId: ""
      });
      // Refresh sales
      const salesRes = await apiFetch(`/saleslogs?employeeId=${employeeId}`, { token });
      setSales(salesRes.saleslogs || []);
    } catch (err) {
      setSaleError("Failed to record sale");
    }
    setSaleLoading(false);
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setLeaveLoading(true);
    try {
      await apiFetch(`/employees/${employeeId}/leave-requests`, {
        method: "POST",
        body: JSON.stringify({
          startDate: leaveStart,
          endDate: leaveEnd,
          type: leaveType,
          reason: leaveReason,
        }),
        token: localStorage.getItem("token"),
        headers: { "Content-Type": "application/json" },
      });
      const leaveRes = await apiFetch(`/employees/${employeeId}/leave-requests`, { token: localStorage.getItem("token") });
      setLeaves(leaveRes.leaves || []);
      setLeaveStart("");
      setLeaveEnd("");
      setLeaveReason("");
    } catch {
      alert("Failed to submit leave request");
    }
    setLeaveLoading(false);
  };

  const uploadDoc = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    const file = e.target.file.files[0];
    if (!file) return;
    setDocLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/employees/${employeeId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const docRes = await apiFetch(`/employees/${employeeId}/documents`, { token: localStorage.getItem("token") });
      setDocs(docRes.docs || []);
      e.target.reset();
    } catch {
      alert("Failed to upload document");
    }
    setDocLoading(false);
  };



  return (
    <DashboardLayout
      navLinks={employeeNavLinks.map((s) => ({
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
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Employee Dashboard</h1>
      {section === "payouts" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Salary & Payout History</h2>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : payouts.length === 0 ? (
            <div className="text-gold/80 font-sans">No payout records found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2">{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                    <td className="py-2">Ksh {p.amount?.toLocaleString() ?? 0}</td>
                    <td className="py-2">{p.type}</td>
                    <td className="py-2">{p.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Commission summary */}
          <div className="mt-4">
            <h3 className="text-lg font-serif font-semibold mb-2">Commission from Sales</h3>
            <div className="text-gold/90 font-sans">
              Total Commission Earned: Ksh{" "}
              {sales
                .filter((s) => s.status === "approved")
                .reduce((sum, s) => sum + (s.commissionAmount || 0), 0)
                .toLocaleString()}
            </div>
          </div>
        </section>
      )}
      {section === "sales" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Record a Sale</h2>
          <form className="mb-6 flex flex-col md:flex-row gap-4 items-end" onSubmit={submitSale}>
            <div>
              <label className="block font-sans mb-1">Product</label>
              <select
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                name="productId"
                value={saleForm.productId}
                onChange={handleSaleFormChange}
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                name="quantity"
                value={saleForm.quantity}
                onChange={handleSaleFormChange}
                required
              />
            </div>
            <div>
              <label className="block font-sans mb-1">Total Price</label>
              <input
                type="number"
                min="0"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                name="totalPrice"
                value={saleForm.totalPrice}
                onChange={handleSaleFormChange}
                required
              />
            </div>
            <div>
              <label className="block font-sans mb-1">Store</label>
              <select
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                name="storeId"
                value={saleForm.storeId}
                onChange={handleSaleFormChange}
                required
              >
                <option value="">Select store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans mb-1">Transaction ID</label>
              <input
                type="text"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                name="transactionId"
                value={saleForm.transactionId}
                onChange={handleSaleFormChange}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
              disabled={saleLoading}
            >
              {saleLoading ? "Recording..." : "Record Sale"}
            </button>
          </form>
          {saleError && <div className="text-red-500 mb-2">{saleError}</div>}
          {saleSuccess && <div className="text-green-500 mb-2">{saleSuccess}</div>}
          <h3 className="text-lg font-serif font-semibold mb-2">My Sales</h3>
          {sales.length === 0 ? (
            <div className="text-gold/80 font-sans">No sales recorded yet.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Quantity</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Store</th>
                  <th className="text-left py-2">Transaction ID</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Commission</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2">{s.soldAt ? new Date(s.soldAt).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{products.find((p) => p.id === s.productId)?.name || s.productId}</td>
                    <td className="py-2">{s.quantity}</td>
                    <td className="py-2">Ksh {s.totalPrice?.toLocaleString() ?? 0}</td>
                    <td className="py-2">{stores.find((st) => st.id === s.storeId)?.name || s.storeId}</td>
                    <td className="py-2">{s.transactionId}</td>
                    <td className="py-2">{s.status}</td>
                    <td className="py-2">{s.status === "approved" ? `Ksh ${s.commissionAmount?.toLocaleString()}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {section === "attendance" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Attendance</h2>
          <form className="mb-6 flex flex-col md:flex-row gap-4 items-end" onSubmit={logAttendance}>
            <div>
              <label className="block font-sans mb-1">Status</label>
              <select
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
            <div>
              <label className="block font-sans mb-1">Notes</label>
              <input
                type="text"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={attNotes}
                onChange={(e) => setAttNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            <button
              type="submit"
              className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
              disabled={attLoading}
            >
              {attLoading ? "Logging..." : "Log Today's Attendance"}
            </button>
          </form>
          {attendance.length === 0 ? (
            <div className="text-gold/80 font-sans">No attendance records found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2">{a.date ? new Date(a.date).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{a.status}</td>
                    <td className="py-2">{a.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {section === "documents" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Documents</h2>
          <form className="mb-6 flex flex-col md:flex-row gap-4 items-end" onSubmit={uploadDoc}>
            <input
              type="file"
              name="file"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              required
            />
            <button
              type="submit"
              className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
              disabled={docLoading}
            >
              {docLoading ? "Uploading..." : "Upload Document"}
            </button>
          </form>
          {docs.length === 0 ? (
            <div className="text-gold/80 font-sans">No documents found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans mb-8">
              <thead>
                <tr>
                  <th className="text-left py-2">File</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Uploaded</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2">{d.originalName}</td>
                    <td className="py-2">{d.type}</td>
                    <td className="py-2">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2">
                      <a
                        href={`/api/employees/${employeeId}/documents/${d.id}`}
                        className="text-gold underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
      {section === "leaves" && (
        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Leave Requests</h2>
          <form className="mb-6 flex flex-col md:flex-row gap-4 items-end" onSubmit={submitLeave}>
            <div>
              <label className="block font-sans mb-1">Type</label>
              <select
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
              >
                <option value="annual">Annual</option>
                <option value="sick">Sick</option>
                <option value="unpaid">Unpaid</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-sans mb-1">Start Date</label>
              <input
                type="date"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={leaveStart}
                onChange={(e) => setLeaveStart(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-sans mb-1">End Date</label>
              <input
                type="date"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={leaveEnd}
                onChange={(e) => setLeaveEnd(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-sans mb-1">Reason</label>
              <input
                type="text"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <button
              type="submit"
              className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
              disabled={leaveLoading}
            >
              {leaveLoading ? "Submitting..." : "Submit Leave Request"}
            </button>
          </form>
          {leaves.length === 0 ? (
            <div className="text-gold/80 font-sans">No leave requests found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans">
              <thead>
                <tr>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Start</th>
                  <th className="text-left py-2">End</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Reason</th>
                  <th className="text-left py-2">Manager Response</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2">{l.type}</td>
                    <td className="py-2">{l.startDate ? new Date(l.startDate).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{l.endDate ? new Date(l.endDate).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{l.status}</td>
                    <td className="py-2">{l.reason}</td>
                    <td className="py-2">{l.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </DashboardLayout>
  );
}
