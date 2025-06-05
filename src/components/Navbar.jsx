import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

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

  const handleLogout = () => {
    localStorage.removeItem("token");
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
            <button
              onClick={handleLogout}
              className="ml-4 bg-gold text-black font-bold px-4 py-1 rounded hover:bg-yellow-400 transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-4 bg-gold text-black font-bold px-4 py-1 rounded hover:bg-yellow-400 transition-colors"
            >
              Login
            </Link>
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
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="mt-2 bg-gold text-black font-bold px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-2 bg-gold text-black font-bold px-4 py-2 rounded hover:bg-yellow-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
