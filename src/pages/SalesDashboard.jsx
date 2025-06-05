import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { apiFetch } from "../services/api";
import { getEmployees } from "../services/employee";
import { getServices } from "../services/services";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const token = localStorage.getItem("token");

  const fetchStores = () => {
    apiFetch("/stores", { token })
      .then((res) => setStores(res.stores || []))
      .catch(() => setStores([]));
  };

  const fetchEmployees = () => {
    getEmployees(token).then((res) => setEmployees(res.employees || []));
  };

  const fetchServices = () => {
    getServices(token).then((res) => setServices(res.services || []));
  };

  const fetchSales = () => {
    setLoading(true);
    let params = [];
    if (selectedStore !== "all") params.push(`storeId=${selectedStore}`); 
    if (selectedEmployee !== "all") params.push(`employeeId=${selectedEmployee}`);
    if (selectedService !== "all") params.push(`serviceId=${selectedService}`);
    if (dateFrom) params.push(`from=${dateFrom}`);
    if (dateTo) params.push(`to=${dateTo}`);
    let query = params.length ? `?${params.join("&")}` : "";
    let summaryUrl = "/sales/summary" + query;
    let recentUrl = "/sales/recent" + query;
    Promise.all([apiFetch(summaryUrl, { token }), apiFetch(recentUrl, { token })])
      .then(([summaryRes, recentRes]) => {
        setSummary(summaryRes);
        setRecentSales(recentRes.sales || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load sales data");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStores();
    fetchEmployees();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line
  }, [selectedStore, selectedEmployee, selectedService, dateFrom, dateTo]);

  // Prepare chart data (mock if summary is missing)
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

  const salesByEmployee = summary?.salesByEmployee || [
    { employee: "John", total: 30000 },
    { employee: "Mary", total: 25000 },
    { employee: "Ali", total: 20000 },
    { employee: "Grace", total: 15000 },
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

  const employeeBarData = {
    labels: salesByEmployee.map((e) => e.employee),
    datasets: [
      {
        label: "Sales by Employee (Ksh)",
        data: salesByEmployee.map((e) => e.total),
        backgroundColor: "#FFD700",
        borderColor: "#333",
      },
    ],
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Sales Dashboard</h1>
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div>
            <label className="block font-sans mb-1">Store</label>
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
          <div>
            <label className="block font-sans mb-1">Date Range</label>
            <input
              type="date"
              className="bg-black border border-gold rounded px-2 py-1 text-gold mr-2"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <input
              type="date"
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-sans mb-1">Employee</label>
            <select
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="all">All</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-sans mb-1">Service</label>
            <select
              className="bg-black border border-gold rounded px-2 py-1 text-gold"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="all">All</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors ml-auto"
            onClick={async () => {
              try {
                let params = [];
                if (selectedStore !== "all") params.push(`storeId=${selectedStore}`);
                if (selectedEmployee !== "all") params.push(`employeeId=${selectedEmployee}`);
                if (selectedService !== "all") params.push(`serviceId=${selectedService}`);
                if (dateFrom) params.push(`from=${dateFrom}`);
                if (dateTo) params.push(`to=${dateTo}`);
                let query = params.length ? `?${params.join("&")}` : "";
                const token = localStorage.getItem("token");
                const res = await fetch("/api/sales/export/csv" + query, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to export CSV");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sales_report.csv";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert("Failed to export CSV");
              }
            }}
          >
            Export CSV
          </button>
          <button
            className="bg-gold text-black font-bold py-2 px-4 rounded hover:bg-yellow-400 transition-colors"
            onClick={async () => {
              try {
                let params = [];
                if (selectedStore !== "all") params.push(`storeId=${selectedStore}`);
                if (selectedEmployee !== "all") params.push(`employeeId=${selectedEmployee}`);
                if (selectedService !== "all") params.push(`serviceId=${selectedService}`);
                if (dateFrom) params.push(`from=${dateFrom}`);
                if (dateTo) params.push(`to=${dateTo}`);
                let query = params.length ? `?${params.join("&")}` : "";
                const token = localStorage.getItem("token");
                const res = await fetch("/api/sales/export/pdf" + query, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to export PDF");
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sales_report.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } catch (err) {
                alert("Failed to export PDF");
              }
            }}
          >
            Export PDF
          </button>
        </div>
        <div className="bg-black/80 border border-gold rounded-lg p-8 shadow-lg mb-8">
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <div className="text-lg font-sans mb-2">Sales Summary</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                <div>
                  <div className="font-sans text-gold/80 text-sm">Today</div>
                  <div className="font-bold text-2xl">Ksh {summary?.today?.toLocaleString() ?? 0}</div>
                </div>
                <div>
                  <div className="font-sans text-gold/80 text-sm">This Week</div>
                  <div className="font-bold text-2xl">Ksh {summary?.week?.toLocaleString() ?? 0}</div>
                </div>
                <div>
                  <div className="font-sans text-gold/80 text-sm">This Month</div>
                  <div className="font-bold text-2xl">Ksh {summary?.month?.toLocaleString() ?? 0}</div>
                </div>
                <div>
                  <div className="font-sans text-gold/80 text-sm">Cash/Card/Mobile</div>
                  <div className="font-bold text-lg">
                    {summary
                      ? `${summary.paymentBreakdown.cash}% / ${summary.paymentBreakdown.card}% / ${summary.paymentBreakdown.mobile}%`
                      : "-"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center text-gold/60 font-sans">
                <div className="w-full md:w-1/2 min-h-[250px] h-[40vw] max-h-[400px]">
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
                <div className="w-full md:w-1/2 min-h-[250px] h-[40vw] max-h-[400px]">
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
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center text-gold/60 font-sans mt-8">
                <div className="w-full md:w-1/2 min-h-[250px] h-[40vw] max-h-[400px]">
                  <Bar
                    data={employeeBarData}
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
            </>
          )}
        </div>
        <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
          <div className="font-sans text-lg mb-4">Recent Sales</div>
          {loading ? (
            <div className="text-gold">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="w-full text-gold/90 font-sans">
              <thead>
                <tr>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Employee</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      {sale.date ? new Date(sale.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-2">{sale.service}</td>
                    <td className="py-2">{sale.employee}</td>
                    <td className="py-2">Ksh {sale.amount?.toLocaleString() ?? 0}</td>
                    <td className="py-2">{sale.payment}</td>
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
