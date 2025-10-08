import { NavLink } from "react-router-dom";
import { FiHome, FiClock, FiSettings } from "react-icons/fi";

const Sidebar = () => {
  // Check if user is admin
  const isAdmin = localStorage.getItem('userRole') === 'admin';

  return (
    <div className="w-16 h-screen bg-white text-white flex flex-col items-center py-4 border-r border-gray-700">
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `p-3 rounded-lg transition-colors duration-200 ${
          isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <FiHome size={24} />
      </NavLink>
      <NavLink 
        to="/history" 
        className={({ isActive }) => `p-3 rounded-lg transition-colors duration-200 mt-2 ${
          isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        <FiClock size={24} />
      </NavLink>
      {isAdmin && (
        <NavLink 
          to="/admin/templates" 
          className={({ isActive }) => `p-3 rounded-lg transition-colors duration-200 mt-2 ${
            isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title="Template Manager"
        >
          <FiSettings size={24} />
        </NavLink>
      )}
    </div>
  );
};

export default Sidebar;
