import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

export default function AdvancedAnalytics() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      const res = await apiFetch(`/analytics/overview${params.length ? "?" + params.join("&") : ""}`);
      setData(res);
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  // Prepare chart data
  const salesByStore = data?.sales?.map((s) => ({
    store: s.storeId,
    total: Number(s.totalSales),
  })) || [];
  const bookingsByStore = data?.bookings?.map((b) => ({
    store: b.storeId,
    total: Number(b.totalBookings),
  })) || [];
  const empPerf = data?.empPerf?.map((e) => ({
    employee: e.employeeId,
    total: Number(e.totalSales),
  })) || [];

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Advanced Analytics</h1>
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block font-sans mb-1">From</label>
            <input
              type="date"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-sans mb-1">To</label>
            <input
              type="date"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button
            className="bg-gold text-black font-bold py-1 px-4 rounded hover:bg-yellow-400 transition-colors self-end"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-serif font-semibold mb-2">Sales by Store</h2>
            <Bar
              data={{
                labels: salesByStore.map((s) => `Store ${s.store}`),
                datasets: [
                  {
                    label: "Total Sales (Ksh)",
                    data: salesByStore.map((s) => s.total),
                    backgroundColor: "#FFD700",
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-serif font-semibold mb-2">Bookings by Store</h2>
            <Bar
              data={{
                labels: bookingsByStore.map((b) => `Store ${b.store}`),
                datasets: [
                  {
                    label: "Total Bookings",
                    data: bookingsByStore.map((b) => b.total),
                    backgroundColor: "#FFD700",
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg col-span-1 md:col-span-2">
            <h2 className="text-xl font-serif font-semibold mb-2">Employee Performance</h2>
            <Line
              data={{
                labels: empPerf.map((e) => `Emp ${e.employee}`),
                datasets: [
                  {
                    label: "Total Sales (Ksh)",
                    data: empPerf.map((e) => e.total),
                    borderColor: "#FFD700",
                    backgroundColor: "rgba(255,215,0,0.2)",
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
