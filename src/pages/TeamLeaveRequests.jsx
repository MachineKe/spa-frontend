import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";

export default function TeamLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    // Fetch all team members and their leave requests
    apiFetch("/team/leave-requests")
      .then((res) => {
        setRequests(res.requests || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load leave requests");
        setLoading(false);
      });
  }, []);

  const handleAction = async (employeeId, requestId, status) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await apiFetch(`/employee/${employeeId}/leave-requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      // Refresh requests
      const res = await apiFetch("/team/leave-requests");
      setRequests(res.requests || []);
    } catch {
      alert("Failed to update leave request");
    }
    setActionLoading((prev) => ({ ...prev, [requestId]: false }));
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Team Leave Requests</h1>
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-gold/80 font-sans">No leave requests found.</div>
          ) : (
            <table className="w-full text-gold/90 font-sans">
              <thead>
                <tr>
                  <th className="text-left py-2">Employee</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Start</th>
                  <th className="text-left py-2">End</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Reason</th>
                  <th className="text-left py-2">Manager Response</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2">{r.employeeName}</td>
                    <td className="py-2">{r.type}</td>
                    <td className="py-2">{r.startDate ? new Date(r.startDate).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{r.endDate ? new Date(r.endDate).toLocaleDateString() : "-"}</td>
                    <td className="py-2">{r.status}</td>
                    <td className="py-2">{r.reason}</td>
                    <td className="py-2">{r.response}</td>
                    <td className="py-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            disabled={actionLoading[r.id]}
                            onClick={() => handleAction(r.employeeId, r.id, "approved")}
                          >
                                Approve
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            disabled={actionLoading[r.id]}
                            onClick={() => handleAction(r.employeeId, r.id, "rejected")}
                          >
                                Reject
                          </button>
                        </>
                      )}
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
