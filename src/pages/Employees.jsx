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
                    <th className="text-left py-2 px-2 whitespace-nowrap">Photo</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Name</th>
                    <th className="text-left py-2 px-2 whitespace-nowrap">Role</th>
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
                      <td className="py-2 px-2 whitespace-nowrap">
                        <img
                          src={emp.photo || "https://randomuser.me/api/portraits/men/32.jpg"}
                          alt={emp.name}
                          className="w-12 h-12 rounded-full border-2 border-gold object-cover"
                        />
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">{emp.name}</td>
                      <td className="py-2 px-2 whitespace-nowrap">{emp.role}</td>
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
                      <td className="py-2 px-2 whitespace-nowrap">
                        <form
                          className="mb-2 flex flex-col md:flex-row gap-2 items-end"
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
                          >
                            {docLoading[emp.id] ? "Uploading..." : "Upload"}
                          </button>
                        </form>
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
                      <td className="py-2 px-2 whitespace-nowrap">
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                          onClick={() => openSalaryModal(emp)}
                        >
                          Manage
                        </button>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors mr-2"
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
                        >
                          Edit
                        </button>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors mr-2"
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
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                          onClick={async () => {
                            setAssignEmp(emp);
                            setAssignLoading(true);
                            setAssignError("");
                            try {
                              // Fetch all services
                              const token = localStorage.getItem("token");
                              const res = await import("../services/services.js").then((mod) =>
                                mod.getServices(token)
                              );
                              setAllServices(res.services || []);
                              // Fetch assigned services for this employee
                              const assigned = emp.services || [];
                              setAssignedServices(assigned.map((s) => s.id));
                              setShowAssignModal(true);
                            } catch {
                              setAssignError("Failed to load services");
                            }
                            setAssignLoading(false);
                          }}
                        >
                          Assign Services
                        </button>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors mr-2"
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
                        >
                          Edit
                        </button>
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors mr-2"
                          onClick={async () => {
                            setAssignEmp(emp);
                            setAssignLoading(true);
                            setAssignError("");
                            try {
                              // Fetch all services
                              const token = localStorage.getItem("token");
                              const res = await import("../services/services.js").then((mod) =>
                                mod.getServices(token)
                              );
                              setAllServices(res.services || []);
                              // Fetch assigned services for this employee
                              const assigned = emp.services || [];
                              setAssignedServices(assigned.map((s) => s.id));
                              setShowAssignModal(true);
                            } catch {
                              setAssignError("Failed to load services");
                            }
                            setAssignLoading(false);
                          }}
                        >
                          Assign Services
                        </button>
                        <button
                          className="bg-gold text-black font-bold py-1 px-3 rounded hover:bg-yellow-400 transition-colors"
                          onClick={() => {
                            setLogEmp(emp);
                            setLogForm({ date: "", hours: "" });
                            setShowLogModal(true);
                          }}
                        >
                          Log Hours
                        </button>
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
      </div>
      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gold rounded-lg p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-4">Add Employee</h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setAddLoading(true);
                setAddError("");
                try {
                  const body = {
                    name: addForm.name,
                    role: addForm.role,
                    contact: addForm.contact,
                    email: addForm.email,
                    photoUrl: addForm.photoUrl,
                  };
                  if (addForm.storeId) {
                    body.storeId = addForm.storeId;
                  }
                  const token = localStorage.getItem("token");
                  const res = await apiFetch("/employees", {
                    method: "POST",
                    body,
                    token,
                  });
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
              <label className="font-sans">Name</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <label className="font-sans">Role</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                required
              />
              <label className="font-sans">Contact</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={addForm.contact}
                onChange={(e) => setAddForm((f) => ({ ...f, contact: e.target.value }))}
                required
              />
              <label className="font-sans">Email</label>
              <input
                type="email"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <label className="font-sans">Store</label>
              <select
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={addForm.storeId}
                onChange={(e) => setAddForm((f) => ({ ...f, storeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <label className="font-sans">Photo URL</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={addForm.photoUrl}
                onChange={(e) => setAddForm((f) => ({ ...f, photoUrl: e.target.value }))}
              />
              {addError && <div className="text-red-500">{addError}</div>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gold rounded-lg p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-4">Edit Employee</h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);
                setEditError("");
                try {
                  const body = {
                    name: editForm.name,
                    role: editForm.role,
                    contact: editForm.contact,
                    email: editForm.email,
                    storeId: editForm.storeId,
                    photoUrl: editForm.photoUrl,
                  };
                  const res = await apiFetch(`/employees/${editForm.id}`, {
                    method: "PUT",
                    body: JSON.stringify(body),
                    headers: { "Content-Type": "application/json" },
                  });
                  setEmployees((prev) =>
                    prev.map((emp) =>
                      emp.id === editForm.id ? res.employee : emp
                    )
                  );
                  setShowEditModal(false);
                  setEditForm({
                    id: "",
                    name: "",
                    role: "",
                    contact: "",
                    email: "",
                    storeId: "",
                    photoUrl: "",
                  });
                } catch (err) {
                  setEditError("Failed to update employee");
                }
                setEditLoading(false);
              }}
            >
              <label className="font-sans">Name</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <label className="font-sans">Role</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                required
              />
              <label className="font-sans">Contact</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={editForm.contact}
                onChange={(e) => setEditForm((f) => ({ ...f, contact: e.target.value }))}
                required
              />
              <label className="font-sans">Email</label>
              <input
                type="email"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <label className="font-sans">Store</label>
              <select
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={editForm.storeId}
                onChange={(e) => setEditForm((f) => ({ ...f, storeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <label className="font-sans">Photo URL</label>
              <input
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={editForm.photoUrl}
                onChange={(e) => setEditForm((f) => ({ ...f, photoUrl: e.target.value }))}
              />
              {editError && <div className="text-red-500">{editError}</div>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Services Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gold rounded-lg p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Assign Services — {assignEmp?.name}
            </h2>
            {assignLoading ? (
              <div className="text-gold">Loading...</div>
            ) : assignError ? (
              <div className="text-red-500">{assignError}</div>
            ) : (
              <form
                className="flex flex-col gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAssignLoading(true);
                  setAssignError("");
                  try {
                    await apiFetch(`/employees/${assignEmp.id}/services`, {
                      method: "POST",
                      body: JSON.stringify({ serviceIds: assignedServices }),
                      headers: { "Content-Type": "application/json" },
                    });
                    setShowAssignModal(false);
                  } catch {
                    setAssignError("Failed to assign services");
                  }
                  setAssignLoading(false);
                }}
              >
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {allServices.map((service) => (
                    <label key={service.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={assignedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedServices((prev) => [...prev, service.id]);
                          } else {
                            setAssignedServices((prev) =>
                              prev.filter((id) => id !== service.id)
                            );
                          }
                        }}
                      />
                      <span>{service.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                    disabled={assignLoading}
                  >
                    {assignLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Log Hours Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gold rounded-lg p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Log Hours — {logEmp?.name}
            </h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setLogLoading(true);
                setLogError("");
                try {
                  await apiFetch(`/employees/${logEmp.id}/hours`, {
                    method: "POST",
                    body: JSON.stringify(logForm),
                    headers: { "Content-Type": "application/json" },
                  });
                  setShowLogModal(false);
                } catch {
                  setLogError("Failed to log hours");
                }
                setLogLoading(false);
              }}
            >
              <label className="font-sans">Date</label>
              <input
                type="date"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={logForm.date}
                onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
              <label className="font-sans">Hours</label>
              <input
                type="number"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={logForm.hours}
                onChange={(e) => setLogForm((f) => ({ ...f, hours: e.target.value }))}
                required
                min="0"
                step="0.1"
              />
              {logError && <div className="text-red-500">{logError}</div>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                  disabled={logLoading}
                >
                  {logLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {salaryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black border border-gold rounded-lg p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-4">
              Salary & Payouts — {salaryModal.emp.name}
            </h2>
            <div className="mb-4 flex flex-col gap-2">
              <label className="font-sans">Type</label>
              <select
                name="type"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={salaryForm.type}
                onChange={handleSalaryFormChange}
              >
                <option value="fixed">Fixed Salary</option>
                <option value="commission">Commission</option>
              </select>
              <label className="font-sans">Base Salary (Ksh)</label>
              <input
                type="number"
                name="base"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={salaryForm.base}
                onChange={handleSalaryFormChange}
              />
              {salaryForm.type === "commission" && (
                <>
                  <label className="font-sans">Commission Rate (%)</label>
                  <input
                    type="number"
                    name="commission"
                    className="bg-black border border-gold rounded px-2 py-1 text-gold"
                    value={salaryForm.commission}
                    onChange={handleSalaryFormChange}
                  />
                </>
              )}
              <label className="font-sans">Bonus (Ksh)</label>
              <input
                type="number"
                name="bonus"
                className="bg-black border border-gold rounded px-2 py-1 text-gold"
                value={salaryForm.bonus}
                onChange={handleSalaryFormChange}
              />
              <button
                className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors mt-2"
                onClick={logBonus}
                disabled={salaryLoading}
              >
                Log Bonus
              </button>
            </div>
            <div className="mb-4">
              <button
                className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
                onClick={saveSalary}
                disabled={salaryLoading}
              >
                Save Salary Info
              </button>
              <button
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-400 transition-colors ml-2"
                onClick={() => setSalaryModal(null)}
              >
                Close
              </button>
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold mb-2">Payout History</h3>
              {salaryModal.payouts.length === 0 ? (
                <div className="text-gold/80 font-sans">No payouts found.</div>
              ) : (
                <table className="w-full text-gold/90 font-sans text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-1">Date</th>
                      <th className="text-left py-1">Amount</th>
                      <th className="text-left py-1">Type</th>
                      <th className="text-left py-1">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryModal.payouts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-1">{p.date ? new Date(p.date).toLocaleDateString() : "-"}</td>
                        <td className="py-1">Ksh {p.amount?.toLocaleString() ?? 0}</td>
                        <td className="py-1">{p.type}</td>
                        <td className="py-1">{p.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
