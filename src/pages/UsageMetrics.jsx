import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export default function UsageMetrics() {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }
    console.log("UsageMetrics: token being sent:", token);
    setLoading(true);
    apiFetch("/superadmin/usage", { token })
      .then((res) => {
        setUsage(res.usage || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load usage metrics");
        setLoading(false);
      });
  }, [token]);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Usage & Metrics</h1>
      <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
        {loading ? (
          <div className="text-gold">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <table className="w-full text-gold/90 font-sans">
            <thead>
              <tr>
                <th className="text-left py-2">Tenant</th>
                <th className="text-left py-2">Active Users</th>
                <th className="text-left py-2">Sales</th>
                <th className="text-left py-2">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-2">{row.tenant}</td>
                  <td className="py-2">{row.activeUsers}</td>
                  <td className="py-2">Ksh {row.sales?.toLocaleString() ?? 0}</td>
                  <td className="py-2">{row.bookingCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* More analytics */}
      <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg mt-6">
        <h2 className="text-xl font-serif font-semibold mb-4">More Analytics</h2>
        {usage.length === 0 ? (
          <div className="font-sans text-gold/80">No data available.</div>
        ) : (
          <div className="space-y-2">
            <div>
              <span className="font-bold">Total Platform Sales:</span>{" "}
              Ksh {usage.reduce((sum, row) => sum + (row.sales || 0), 0).toLocaleString()}
            </div>
            <div>
              <span className="font-bold">Total Bookings:</span>{" "}
              {usage.reduce((sum, row) => sum + (row.bookingCount || 0), 0).toLocaleString()}
            </div>
            <div>
              <span className="font-bold">Average Sales per Tenant:</span>{" "}
              Ksh {usage.length ? Math.round(usage.reduce((sum, row) => sum + (row.sales || 0), 0) / usage.length).toLocaleString() : 0}
            </div>
            <div>
              <span className="font-bold">Top Tenant by Sales:</span>{" "}
              {usage.reduce((top, row) => (row.sales > (top?.sales || 0) ? row : top), null)?.tenant || "N/A"}
            </div>
            <div>
              <span className="font-bold">Top Tenant by Bookings:</span>{" "}
              {usage.reduce((top, row) => (row.bookingCount > (top?.bookingCount || 0) ? row : top), null)?.tenant || "N/A"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
