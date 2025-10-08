import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    // Clear any other user-related data
    localStorage.removeItem('userData');
    
    // Close the dropdown
    setIsOpen(false);
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full hover:bg-gray-600"
        style={{backgroundColor: "#fff"}}
      >
        <span className="text-white text-lg">👤</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden z-50">
          <button 
            className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors" 
            style={{padding: "0.6em 1em", backgroundColor: "#101828"}}
          >
            Profile
          </button>
          <button 
            className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors" 
            style={{padding: "0.6em 1em", backgroundColor: "#101828"}}
          >
            Settings
          </button>
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors" 
            style={{padding: "0.6em 1em", backgroundColor: "#101828"}}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
