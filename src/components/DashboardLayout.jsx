import { Link } from "react-router-dom";
import DashboardTopNav from "./DashboardTopNav";
import { useState, useEffect } from "react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/sales", label: "Sales" },
  { to: "/dashboard/employees", label: "Employees" },
  { to: "/dashboard/inventory", label: "Inventory" },
  { to: "/dashboard/products", label: "Products" },
  { to: "/dashboard/stores", label: "Stores" },
  { to: "/dashboard/settings", label: "Settings" },
  { to: "/dashboard/cms", label: "CMS Editor" },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Set sidebar open/close based on screen size on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    // Set initial state
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Example user info, replace with real user data if available
  const user = {
    name: "Admin",
    avatar: ""
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-black text-gold">
      <DashboardTopNav
        onSidebarToggle={() => setSidebarOpen((open) => !open)}
        user={user}
      />
      <div className="flex flex-1 relative">
        {/* Sidebar for desktop, overlay for mobile */}
        {/* Desktop sidebar */}
        {sidebarOpen && (
          <aside className="hidden md:flex w-56 min-h-screen bg-black border-r border-gold flex-col py-8 px-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-sans px-2 py-2 rounded text-gold hover:text-yellow-400 hover:bg-gold/10 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex md:hidden">
            <div className="w-56 min-h-screen bg-black border-r border-gold flex flex-col py-8 px-4 shadow-2xl">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="font-sans px-2 py-2 rounded text-gold hover:text-yellow-400 hover:bg-gold/10 transition-colors"
                    style={{ textDecoration: "none" }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Overlay background */}
            <div
              className="flex-1 bg-black/60"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            />
          </div>
        )}
        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 md:p-8 bg-black/90 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
