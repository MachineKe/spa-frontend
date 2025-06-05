import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    userId: "",
    action: "",
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }
      if (filters.userId) params.userId = filters.userId;
      if (filters.action) params.action = filters.action;
      const token = localStorage.getItem("token");
      const res = await apiFetch("/auditlogs", { token, params });
      setLogs(res.logs || []);
    } catch {
      setError("Failed to load audit logs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Audit Logs</h1>
        <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={handleFilterSubmit}>
          <div>
            <label className="block font-sans mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block font-sans mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block font-sans mb-1">User ID</label>
            <input
              type="text"
              name="userId"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="User ID"
            />
          </div>
          <div>
            <label className="block font-sans mb-1">Action</label>
            <input
              type="text"
              name="action"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={filters.action}
              onChange={handleFilterChange}
              placeholder="Action"
            />
          </div>
          <button
            type="submit"
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors self-end"
          >
            Filter
          </button>
        </form>
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-gold/70">No audit logs found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="py-2">{log.userId || "-"}</td>
                    <td className="py-2">{log.action}</td>
                    <td className="py-2">{log.details || "-"}</td>
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
