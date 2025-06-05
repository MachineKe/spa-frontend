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
import DashboardHome from "./pages/DashboardHome";
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

import DashboardLayout from "./components/DashboardLayout";

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
        {/* Tenant Admin Dashboard */}
        <Route path="/dashboard" element={<DashboardHome />} />
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
      </Routes>
    </Router>
  );
}

export default App;
