import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";
import { getEmployees, getStores, updateEmployeeStore } from "../services/employee";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [docs, setDocs] = useState({});
  const [docLoading, setDocLoading] = useState({});
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeLoading, setStoreLoading] = useState({});
  const [salaryModal, setSalaryModal] = useState(null); // {emp, salary, commission, bonus, payouts}
  const [regEmailLoading, setRegEmailLoading] = useState({});
  const [regEmailMsg, setRegEmailMsg] = useState({});
  const [salaryForm, setSalaryForm] = useState({
    type: "fixed",
    base: "",
    commission: "",
    bonus: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    role: "",
    contact: "",
    email: "",
    storeId: "",
    photoUrl: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    getEmployees(token)
      .then(async (res) => {
        setEmployees(res.employees || res.members || []);
        // Fetch docs for each employee
        const docsObj = {};
        await Promise.all(
          (res.employees || res.members || []).map(async (emp) => {
            const docRes = await apiFetch(`/employees/${emp.id}/documents`, { token });
            docsObj[emp.id] = docRes.docs || [];
          })
        );
        setDocs(docsObj);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load employees");
        setLoading(false);
      });

    // Fetch stores
    getStores(token)
      .then((res) => setStores(res.stores || []))
      .catch(() => setStores([]));
  }, []);

  const uploadDoc = async (e, empId) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;
    setDocLoading((prev) => ({ ...prev, [empId]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/employees/${empId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      // Refresh docs for this employee
      const docRes = await apiFetch(`/employees/${empId}/documents`);
      setDocs((prev) => ({ ...prev, [empId]: docRes.docs || [] }));
      e.target.reset();
    } catch {
      alert("Failed to upload document");
    }
    setDocLoading((prev) => ({ ...prev, [empId]: false }));
  };

  const handleStoreChange = async (empId, storeId) => {
    setStoreLoading((prev) => ({ ...prev, [empId]: true }));
    try {
      const token = localStorage.getItem("token");
      await updateEmployeeStore(token, empId, storeId);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === empId ? { ...emp, storeId } : emp
        )
      );
    } catch {
      alert("Failed to update store assignment");
    }
    setStoreLoading((prev) => ({ ...prev, [empId]: false }));
  };

  // Salary management
  const openSalaryModal = async (emp) => {
    setSalaryModal(null);
    setSalaryLoading(true);
    try {
      const res = await apiFetch(`/employees/${emp.id}/salary`);
      setSalaryForm({
        type: res.type || "fixed",
        base: res.base || "",
        commission: res.commission || "",
        bonus: "",
      });
      setSalaryModal({
        emp,
        payouts: res.payouts || [],
      });
    } catch {
      setSalaryForm({
        type: "fixed",
        base: "",
        commission: "",
        bonus: "",
      });
      setSalaryModal({
        emp,
        payouts: [],
      });
    }
    setSalaryLoading(false);
  };

  const handleSalaryFormChange = (e) => {
    setSalaryForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveSalary = async () => {
    if (!salaryModal) return;
    setSalaryLoading(true);
    try {
      const token = localStorage.getItem("token");
      await apiFetch(`/employees/${salaryModal.emp.id}/salary`, {
        method: "PUT",
        body: JSON.stringify(salaryForm),
        headers: { "Content-Type": "application/json" },
        token,
      });
      setSalaryModal(null);
    } catch {
      alert("Failed to save salary info");
    }
    setSalaryLoading(false);
  };

  const logBonus = async () => {
    if (!salaryModal || !salaryForm.bonus) return;
    setSalaryLoading(true);
    try {
      await apiFetch(`/employee/${salaryModal.emp.id}/salary/bonus`, {
        method: "POST",
        body: JSON.stringify({ amount: salaryForm.bonus }),
        headers: { "Content-Type": "application/json" },
      });
      setSalaryForm((prev) => ({ ...prev, bonus: "" }));
      // Refresh payouts
      const res = await apiFetch(`/employee/${salaryModal.emp.id}/salary`);
      setSalaryModal((prev) => ({ ...prev, payouts: res.payouts || [] }));
    } catch {
      alert("Failed to log bonus");
    }
    setSalaryLoading(false);
  };

  // Filter employees by selected store
  const filteredEmployees =
    selectedStore === "all"
      ? employees
      : employees.filter((emp) => emp.storeId === parseInt(selectedStore, 10));

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Employee Management</h1>
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
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-max w-full text-gold/90 font-sans text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-2 whitespace-nowrap bg-black sticky left-0 z-10">Photo</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap bg-black sticky left-16 z-10">Name</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap bg-black sticky left-32 z-10">Role</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Contact</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Email</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Store</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Documents</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Salary</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="py-2 px-2 whitespace-nowrap bg-black sticky left-0 z-0">
                        <img
                          src={emp.photo || "https://randomuser.me/api/portraits/men/32.jpg"}
                          alt={emp.name}
                          className="w-12 h-12 rounded-full border-2 border-gold object-cover"
                        />
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap bg-black sticky left-16 z-0">{emp.name}</td>
                      <td className="py-2 px-2 whitespace-nowrap bg-black sticky left-32 z-0">{emp.role}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{emp.contact}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{emp.email}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <select
                          className="bg-black border border-gold rounded px-2 py-1 text-gold"
                          value={emp.storeId || ""}
                          onChange={(e) => handleStoreChange(emp.id, e.target.value)}
                          disabled={storeLoading[emp.id]}
                        >
                          <option value="">Unassigned</option>
                          {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <form
                            className="m-0"
                            onSubmit={(e) => uploadDoc(e, emp.id)}
                          >
                            <input
                              type="file"
                              name="file"
                              className="bg-black border border-gold rounded px-2 py-1 text-gold"
                              required
                            />
                            <button
                              type="submit"
                              className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                              disabled={docLoading[emp.id]}
                              style={{ verticalAlign: "middle" }}
                            >
                              {docLoading[emp.id] ? "Uploading..." : "Upload"}
                            </button>
                          </form>
                        </div>
                        {docs[emp.id] && docs[emp.id].length > 0 ? (
                          <div className="w-full overflow-x-auto">
                            <table className="min-w-max w-full text-gold/80 font-sans text-xs">
                              <thead>
                                <tr>
                                  <th className="text-left py-1 px-2 whitespace-nowrap">File</th>
                                  <th className="text-left py-1 px-2 whitespace-nowrap">Type</th>
                                  <th className="text-left py-1 px-2 whitespace-nowrap">Uploaded</th>
                                  <th className="text-left py-1 px-2 whitespace-nowrap">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {docs[emp.id].map((d) => (
                                  <tr key={d.id}>
                                    <td className="py-1 px-2 whitespace-nowrap">{d.originalName}</td>
                                    <td className="py-1 px-2 whitespace-nowrap">{d.type}</td>
                                    <td className="py-1 px-2 whitespace-nowrap">
                                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="py-1 px-2 whitespace-nowrap">
                                      <a
                                        href={`/api/employees/${emp.id}/documents/${d.id}`}
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
                          </div>
                        ) : (
                          <div className="text-gold/60 font-sans text-xs">No documents</div>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                            onClick={() => openSalaryModal(emp)}
                            style={{ verticalAlign: "middle" }}
                          >
                            Manage
                          </button>
                          <button
                            className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                            title="Edit employee details"
                            onClick={() => {
                              setEditForm({
                                id: emp.id,
                                name: emp.name,
                                role: emp.role,
                                contact: emp.contact,
                                email: emp.email,
                                storeId: emp.storeId || "",
                                photoUrl: emp.photo || "",
                              });
                              setShowEditModal(true);
                            }}
                            style={{ verticalAlign: "middle" }}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                            title="Assign services to employee"
                            onClick={async () => {
                              setAssignEmp(emp);
                              setAssignLoading(true);
                              setAssignError("");
                              try {
                                const token = localStorage.getItem("token");
                                const res = await import("../services/services.js").then((mod) =>
                                  mod.getServices(token)
                                );
                                setAllServices(res.services || []);
                                const assigned = emp.services || [];
                                setAssignedServices(assigned.map((s) => s.id));
                                setShowAssignModal(true);
                              } catch {
                                setAssignError("Failed to load services");
                              }
                              setAssignLoading(false);
                            }}
                            style={{ verticalAlign: "middle" }}
                          >
                            Assign Services
                          </button>
                          <button
                            className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                            title="Send registration email to employee"
                            onClick={async () => {
                              setRegEmailLoading((prev) => ({ ...prev, [emp.id]: true }));
                              setRegEmailMsg((prev) => ({ ...prev, [emp.id]: "" }));
                              try {
                                const token = localStorage.getItem("token");
                                await apiFetch(`/employees/${emp.id}/send-registration-email`, {
                                  method: "POST",
                                  token,
                                });
                                setRegEmailMsg((prev) => ({
                                  ...prev,
                                  [emp.id]: "Registration email sent!",
                                }));
                              } catch (err) {
                                setRegEmailMsg((prev) => ({
                                  ...prev,
                                  [emp.id]: "Failed to send registration email",
                                }));
                              }
                              setRegEmailLoading((prev) => ({ ...prev, [emp.id]: false }));
                            }}
                            disabled={regEmailLoading[emp.id]}
                            style={{ verticalAlign: "middle" }}
                          >
                            {regEmailLoading[emp.id] ? "Sending..." : "Send Registration Email"}
                          </button>
                          <button
                            className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                            title="Log work hours for employee"
                            onClick={() => {
                              setLogEmp(emp);
                              setLogForm({ date: "", hours: "" });
                              setShowLogModal(true);
                            }}
                            style={{ verticalAlign: "middle" }}
                          >
                            Log Hours
                          </button>
                        </div>
                        {regEmailMsg[emp.id] && (
                          <div className="text-xs mt-1" style={{ color: regEmailMsg[emp.id].includes("Failed") ? "#f87171" : "#22c55e" }}>
                            {regEmailMsg[emp.id]}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Add Employee Button and Modal */}
        <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg mb-8">
          <button
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            Add Employee
          </button>
        </div>
        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-black border border-gold rounded-lg p-8 w-full max-w-md shadow-2xl relative">
              <button
                className="absolute top-2 right-2 text-gold hover:text-yellow-400 bg-black border border-gold rounded-full p-2 text-2xl transition-colors"
                onClick={() => {
                  setShowAddModal(false);
                  setAddError("");
                  setAddForm({
                    name: "",
                    role: "",
                    contact: "",
                    email: "",
                    storeId: "",
                    photoUrl: "",
                  });
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gold">Add New Employee</h2>
              {addError && <div className="text-red-500 mb-2">{addError}</div>}
              <form
onSubmit={async (e) => {
                  e.preventDefault();
                  setAddLoading(true);
                  setAddError("");
                  try {
                    const token = localStorage.getItem("token");
                    // Convert storeId "" to null before sending
                    const payload = {
                      ...addForm,
                      storeId: addForm.storeId === "" ? null : addForm.storeId,
                    };
                    const res = await apiFetch("/employees", {
                      method: "POST",
                      body: JSON.stringify(payload),
                      headers: { "Content-Type": "application/json" },
                      token,
                    });
                    // Add new employee to list
                    setEmployees((prev) => [...prev, res.employee]);
                    setShowAddModal(false);
                    setAddForm({
                      name: "",
                      role: "",
                      contact: "",
                      email: "",
                      storeId: "",
                      photoUrl: "",
                    });
                  } catch (err) {
                    setAddError("Failed to add employee");
                  }
                  setAddLoading(false);
                }}
              >
                <div className="mb-3">
                  <label className="block text-gold mb-1">Name</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gold bg-black text-gold"
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gold mb-1">Role</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gold bg-black text-gold"
                    type="text"
                    value={addForm.role}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, role: e.target.value }))}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gold mb-1">Contact</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gold bg-black text-gold"
                    type="text"
                    value={addForm.contact}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gold mb-1">Email</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gold bg-black text-gold"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gold mb-1">Store</label>
                  <select
                    className="w-full px-3 py-2 rounded border border-gold bg-black text-gold"
                    value={addForm.storeId}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, storeId: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gold mb-1">Photo URL</label>
                  <input
                    className="w-full px-3 py-2 rounded border border-gold bg-black text-gold"
                    type="text"
                    value={addForm.photoUrl}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add Employee"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* ...rest of the modals remain unchanged... */}
    </DashboardLayout>
  );
}
