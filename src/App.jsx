import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Team from "./pages/Team";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import GiftCards from "./pages/GiftCards";
import Login from "./pages/Login";
import TenantAdminDashboard from "./pages/TenantAdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import Employees from "./pages/Employees";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import TenantsManagement from "./pages/TenantsManagement";
import PlansManagement from "./pages/PlansManagement";
import UsageMetrics from "./pages/UsageMetrics";
import FeatureToggles from "./pages/FeatureToggles";
import CmsEditor from "./pages/CmsEditor";
import Products from "./pages/Products";
import StoresManagement from "./pages/StoresManagement";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import EmployeeRegister from "./pages/EmployeeRegister";
import CustomerRegister from "./pages/CustomerRegister";

import DashboardLayout from "./components/DashboardLayout";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import { useEffect, useState } from "react";
import { getCurrentUser } from "./services/auth";
import { Navigate } from "react-router-dom";
import CustomerDashboard from "./pages/CustomerDashboard";

function EmployeeRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    getCurrentUser(token)
      .then((res) => {
        setUser(res.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [localStorage.getItem("token")]);

  if (loading) return <div className="text-gold p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if ((user.role || "").toLowerCase() !== "employee") return <div className="text-red-500 p-8">Unauthorized</div>;
  return children;
}

function CustomerRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    getCurrentUser(token)
      .then((res) => {
        setUser(res.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [localStorage.getItem("token")]);

  if (loading) return <div className="text-gold p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if ((user.role || "").toLowerCase() !== "customer") return <div className="text-red-500 p-8">Unauthorized</div>;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/services" element={<><Navbar /><Services /></>} />
        <Route path="/team" element={<><Navbar /><Team /></>} />
        <Route path="/gallery" element={<><Navbar /><Gallery /></>} />
        <Route path="/booking" element={<><Navbar /><Booking /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/giftcards" element={<><Navbar /><GiftCards /></>} />
        {/* Auth */}
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        <Route path="/employee-register" element={<><Navbar /><EmployeeRegister /></>} />
        <Route path="/customer-register" element={<><Navbar /><CustomerRegister /></>} />
        {/* Tenant Admin Dashboard */}
        <Route path="/dashboard" element={<TenantAdminDashboard />} />
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/sales" element={<SalesDashboard />} />
        <Route path="/dashboard/employees" element={<Employees />} />
        <Route path="/dashboard/inventory" element={<Inventory />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/products" element={<Products />} />
        <Route path="/dashboard/stores" element={<StoresManagement />} />
        <Route path="/dashboard/cms" element={<CmsEditor />} />
        {/* Super Admin */}
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/tenants" element={<TenantsManagement />} />
        <Route path="/superadmin/plans" element={<PlansManagement />} />
        <Route path="/superadmin/usage" element={<UsageMetrics />} />
        <Route path="/superadmin/features" element={<FeatureToggles />} />
        {/* Employee Dashboard */}
        <Route
          path="/dashboard/employee"
          element={
            <EmployeeRoute>
              <EmployeeDashboard />
            </EmployeeRoute>
          }
        />
        {/* Customer Dashboard */}
        <Route
          path="/dashboard/customer"
          element={
            <CustomerRoute>
              <CustomerDashboard />
            </CustomerRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
