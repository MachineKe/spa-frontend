import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { getCurrentUser } from "../services/auth";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/team", label: "Team" },
  { to: "/gallery", label: "Gallery" },
  { to: "/booking", label: "Booking" },
  { to: "/contact", label: "Contact" },
  { to: "/giftcards", label: "Gift Cards" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Simple auth check: token in localStorage
  const isLoggedIn = !!localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (isLoggedIn && token) {
      getCurrentUser(token)
        .then(res => {
          if (res && res.user) setUser(res.user);
        })
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
    // eslint-disable-next-line
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="w-full bg-black border-b border-gold">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="text-gold text-2xl font-serif font-bold tracking-wide">
          Fellas
        </Link>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-sans px-2 py-1 rounded transition-colors ${
                pathname === link.to
                  ? "text-gold font-semibold"
                  : "text-white hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <div className="relative flex items-center ml-4" tabIndex={0} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropdownOpen(false); }}>
              <button
                className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-full bg-neutral-900 hover:bg-yellow-400/10 transition focus:outline-none"
                onClick={() => setDropdownOpen(open => !open)}
                tabIndex={0}
              >
                {user && user.avatar ? (
                  <img src={user.avatar} alt={user.username || user.name || user.email || "User"} className="w-8 h-8 rounded-full border-2 border-gold object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center font-bold font-sans shadow">
                    {(user && (user.username || user.name || user.email)) ? (user.username || user.name || user.email)[0] : "U"}
                  </div>
                )}
                <span className="text-gold font-sans font-semibold text-sm">{user ? (user.username || user.name || user.email) : "User"}</span>
                <FaChevronDown className="text-gold" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-32 w-44 bg-black border border-gold rounded-lg shadow-lg py-2 z-50 flex flex-col gap-1">
                  {user && user.role && (
                    <Link
                        to={{
                          superadmin: "/superadmin-dashboard",
                          admin: "/dashboard/manager",
                          manager: "/dashboard/manager",
                          employee: "/employee-dashboard",
                          customer: "/customer-dashboard",
                          tenantadmin: "/tenant-admin-dashboard"
                        }[user.role.toLowerCase()] || "/"}
                      className="flex items-center gap-2 px-4 py-2 text-gold hover:bg-gold/10 rounded transition text-left bg-black"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-gold hover:bg-gold/10 rounded transition text-left bg-black"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="text-gold" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/customer-register"
                className="ml-4 bg-black text-gold border border-gold font-bold px-4 py-1 rounded hover:bg-gold hover:text-black transition-colors"
              >
                Customer Register
              </Link>
              <Link
                to="/login"
                className="ml-4 bg-gold text-black font-bold px-4 py-1 rounded hover:bg-yellow-400 transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 bg-black rounded-full border-2 border-gold hover:bg-neutral-900 transition-colors"
          aria-label="Open menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`block w-6 h-0.5 bg-gold mb-1 transition-transform ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-gold mb-1 transition-opacity ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block w-6 h-0.5 bg-gold transition-transform ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
        </button>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gold px-4 pb-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-sans px-2 py-2 rounded transition-colors ${
                  pathname === link.to
                    ? "text-gold font-semibold"
                    : "text-white hover:text-gold"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="relative flex flex-col mt-2">
                <button
                  className="flex items-center gap-2 cursor-pointer px-2 py-2 rounded-full bg-neutral-900 hover:bg-gold/10 transition focus:outline-none"
                  onClick={() => setDropdownOpen(open => !open)}
                  tabIndex={0}
                >
                  {user && user.avatar ? (
                    <img src={user.avatar} alt={user.username || user.name || user.email || "User"} className="w-8 h-8 rounded-full border-2 border-gold object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center font-bold font-sans shadow">
                      {(user && (user.username || user.name || user.email)) ? (user.username || user.name || user.email)[0] : "U"}
                    </div>
                  )}
                  <span className="text-gold font-sans font-semibold text-sm">{user ? (user.username || user.name || user.email) : "User"}</span>
                  <FaChevronDown className="text-gold" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-12 w-44 bg-black border border-gold rounded-lg shadow-lg py-2 z-50 flex flex-col gap-1">
                    {user && user.role && (
                      <Link
                        to={{
                        superadmin: "/superadmin-dashboard",
                        admin: "/dashboard/manager",
                        manager: "/dashboard/manager",
                        employee: "/employee-dashboard",
                        customer: "/customer-dashboard",
                        tenantadmin: "/tenant-admin-dashboard"
                        }[user.role.toLowerCase()] || "/"}
                        className="flex items-center gap-2 px-4 py-2 text-gold hover:bg-gold/10 rounded transition text-left bg-black"
                        onClick={() => {
                          setDropdownOpen(false);
                          setMenuOpen(false);
                        }}
                      >
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-gold hover:bg-gold/10 rounded transition text-left bg-black"
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <FaSignOutAlt className="text-gold" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/customer-register"
                  className="mt-2 bg-black text-gold border border-gold font-bold px-4 py-2 rounded hover:bg-gold hover:text-black transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Customer Register
                </Link>
                <Link
                  to="/login"
                  className="mt-2 bg-gold text-black font-bold px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
