import React, { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#FFD700", "#8884d8"];

export default function PlatformOverview() {
  const [overview, setOverview] = useState({
    tenants: 0,
    users: 0,
    sales: 0,
    bookings: 0,
    activeTenants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState([]);
  const [tenants, setTenants] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOverview() {
      setLoading(true);
      try {
        // Fetch tenants and usage metrics
        const [tenantsRes, usageRes] = await Promise.all([
          apiFetch("/superadmin/tenants", { token }),
          apiFetch("/superadmin/usage", { token }),
        ]);
        const tenants = tenantsRes.tenants || [];
        const usage = usageRes.usage || [];

        // Compute stats
        const totalTenants = tenants.length;
        const totalUsers = usage.reduce((sum, row) => sum + (row.activeUsers || 0), 0);
        const totalSales = usage.reduce((sum, row) => sum + (row.sales || 0), 0);
        const totalBookings = usage.reduce((sum, row) => sum + (row.bookingCount || 0), 0);
        const activeTenants = usage.filter(row => row.activeUsers > 0).length;

        setOverview({
          tenants: totalTenants,
          users: totalUsers,
          sales: totalSales,
          bookings: totalBookings,
          activeTenants,
        });
        setUsage(usage);
        setTenants(tenants);
      } catch {
        setOverview({
          tenants: 0,
          users: 0,
          sales: 0,
          bookings: 0,
          activeTenants: 0,
        });
        setUsage([]);
        setTenants([]);
      }
      setLoading(false);
    }
    fetchOverview();
  }, []);

  // Pie chart data for active/inactive tenants
  const pieData = [
    { name: "Active Tenants", value: overview.activeTenants },
    { name: "Inactive Tenants", value: Math.max(overview.tenants - overview.activeTenants, 0) },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-serif font-semibold mb-4">Platform Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <OverviewCard label="Tenants" value={loading ? "..." : overview.tenants} />
        <OverviewCard label="Active Tenants" value={loading ? "..." : overview.activeTenants} />
        <OverviewCard label="Users" value={loading ? "..." : overview.users} />
        <OverviewCard label="Sales" value={loading ? "..." : `Ksh ${overview.sales.toLocaleString()}`} />
        <OverviewCard label="Bookings" value={loading ? "..." : overview.bookings} />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Bar Chart: Sales per Tenant */}
        <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
          <div className="text-lg font-serif font-semibold mb-2 text-gold/80">Sales per Tenant</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="tenant" stroke="#FFD700" />
              <YAxis stroke="#FFD700" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#FFD700" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Line Chart: Bookings per Tenant */}
        <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
          <div className="text-lg font-serif font-semibold mb-2 text-gold/80">Bookings per Tenant</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="tenant" stroke="#FFD700" />
              <YAxis stroke="#FFD700" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookingCount" stroke="#FFD700" name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Pie Chart: Active vs Inactive Tenants */}
      <div className="flex justify-center mt-8">
        <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg">
          <div className="text-lg font-serif font-semibold mb-2 text-gold/80 text-center">Active vs Inactive Tenants</div>
          <PieChart width={300} height={250}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ label, value }) {
  return (
    <div className="bg-black/80 border border-gold rounded-lg p-6 shadow-lg flex flex-col items-center">
      <div className="text-lg font-serif font-semibold text-gold/80 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gold">{value}</div>
    </div>
  );
}
