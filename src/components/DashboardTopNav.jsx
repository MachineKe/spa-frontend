import { useState } from "react";
import { FaBars, FaBell, FaSearch, FaMoon, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function DashboardTopNav({ onSidebarToggle, user = { name: "Admin", avatar: "" } }) {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Close dropdown on outside click
  const handleDropdownBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    console.log("Logout button clicked");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="w-full flex items-center justify-between bg-black border-b border-yellow-400 px-2 md:px-8 py-2 shadow-sm z-20">
      {/* Left: Logo and sidebar toggle */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          className="bg-black text-yellow-400 text-2xl p-2 rounded-full border border-yellow-400 hover:bg-yellow-400/10 transition focus:outline-none flex-shrink-0"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        <span className="text-yellow-400 text-lg md:text-2xl font-serif font-bold tracking-wide select-none truncate">Fellas Admin</span>
      </div>
      {/* Center: Search (hide on small screens) */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="hidden sm:flex items-center bg-black border border-yellow-400 rounded-full px-2 md:px-4 py-1 w-full max-w-xs md:max-w-md shadow-sm">
          <FaSearch className="text-yellow-400 mr-2" />
          <input
            className="bg-black text-yellow-400 placeholder-yellow-300 font-sans outline-none w-full text-sm md:text-base"
            type="text"
            placeholder="Search or type command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="ml-2 text-yellow-300 text-xs hidden md:inline">⌘K</span>
        </div>
      </div>
      {/* Right: Admin Dropdown */}
      <div
        className="relative flex items-center gap-2 md:gap-3 flex-shrink-0"
        tabIndex={0}
        onBlur={handleDropdownBlur}
      >
        <button
          className="flex items-center gap-1 md:gap-2 cursor-pointer px-2 py-1 rounded-full bg-neutral-900 hover:bg-yellow-400/10 transition focus:outline-none"
          onClick={() => setDropdownOpen((open) => !open)}
          tabIndex={0}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-yellow-400 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold font-sans shadow">
              {user.name[0]}
            </div>
          )}
          <span className="text-yellow-400 font-sans font-semibold text-sm md:text-base">{user.name}</span>
          <FaChevronDown className="text-yellow-400" />
        </button>
        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-32 w-44 bg-black border border-yellow-400 rounded-lg shadow-lg py-2 z-50 flex flex-col gap-1">
            <button className="flex items-center gap-2 px-4 py-2 text-yellow-400 hover:bg-yellow-400/10 rounded transition text-left bg-black">
              <FaMoon className="text-yellow-400" />
              <span>Toggle Dark Mode</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-yellow-400 hover:bg-yellow-400/10 rounded transition text-left relative bg-black">
              <FaBell className="text-yellow-400" />
              <span>Notifications</span>
              <span className="absolute right-3 top-2 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 text-yellow-400 hover:bg-yellow-400/10 rounded transition text-left bg-black"
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
            >
              <FaSignOutAlt className="text-yellow-400" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
