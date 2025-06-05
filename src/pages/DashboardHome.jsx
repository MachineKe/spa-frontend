import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Line, Bar } from "react-chartjs-2";
import { apiFetch } from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardHome() {
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryRes, empRes, prodRes, storeRes] = await Promise.all([
          apiFetch("/sales/summary", { token }),
          apiFetch("/employees", { token }),
          apiFetch("/products", { token }),
          apiFetch("/stores", { token }),
        ]);
        setSummary(summaryRes);
        setEmployees(empRes.employees || []);
        setProducts(prodRes.products || []);
        setStores(storeRes.stores || []);
      } catch {
        // ignore errors for now
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Prepare chart data
  const salesOverTime = summary?.salesOverTime || [
    { date: "2025-06-01", total: 12000 },
    { date: "2025-06-02", total: 15000 },
    { date: "2025-06-03", total: 9000 },
    { date: "2025-06-04", total: 18000 },
    { date: "2025-06-05", total: 21000 },
    { date: "2025-06-06", total: 17000 },
    { date: "2025-06-07", total: 22000 },
  ];

  const salesByStore = summary?.salesByStore || [
    { store: "CBD", total: 50000 },
    { store: "Westlands", total: 35000 },
    { store: "Karen", total: 20000 },
  ];

  const lineData = {
    labels: salesOverTime.map((d) => d.date),
    datasets: [
      {
        label: "Sales (Ksh)",
        data: salesOverTime.map((d) => d.total),
        borderColor: "#FFD700",
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const barData = {
    labels: salesByStore.map((s) => s.store),
    datasets: [
      {
        label: "Sales by Store (Ksh)",
        data: salesByStore.map((s) => s.total),
        backgroundColor: ["#FFD700", "#333", "#BFA14A"],
        borderColor: "#FFD700",
      },
    ],
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Welcome to Your Dashboard</h1>
        <p className="font-sans text-gold/90 mb-6">
          Manage your spa & barbershop business, view sales, staff, inventory, and more.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg flex flex-col items-center">
            <div className="text-xs font-sans text-gold/80 mb-1">Total Sales (Month)</div>
            <div className="text-2xl font-bold text-gold">Ksh {summary?.month?.toLocaleString() ?? 0}</div>
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg flex flex-col items-center">
            <div className="text-xs font-sans text-gold/80 mb-1">Employees</div>
            <div className="text-2xl font-bold text-gold">{employees.length}</div>
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg flex flex-col items-center">
            <div className="text-xs font-sans text-gold/80 mb-1">Products</div>
            <div className="text-2xl font-bold text-gold">{products.length}</div>
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg flex flex-col items-center">
            <div className="text-xs font-sans text-gold/80 mb-1">Stores</div>
            <div className="text-2xl font-bold text-gold">{stores.length}</div>
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg flex flex-col items-center">
            <div className="text-xs font-sans text-gold/80 mb-1">Today</div>
            <div className="text-2xl font-bold text-gold">Ksh {summary?.today?.toLocaleString() ?? 0}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-serif font-semibold mb-2">Sales Overview</h2>
            <div className="w-full min-h-[250px] h-[40vw] max-h-[400px]">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: "#FFD700" } },
                  },
                  scales: {
                    x: { ticks: { color: "#FFD700" }, grid: { color: "#333" } },
                    y: { ticks: { color: "#FFD700" }, grid: { color: "#333" } },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-serif font-semibold mb-2">Sales by Store</h2>
            <div className="w-full min-h-[250px] h-[40vw] max-h-[400px]">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: "#FFD700" } },
                  },
                  scales: {
                    x: { ticks: { color: "#FFD700" }, grid: { color: "#333" } },
                    y: { ticks: { color: "#FFD700" }, grid: { color: "#333" } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
