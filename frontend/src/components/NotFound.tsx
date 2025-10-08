import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="text-center">
        <FiAlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-gray-400 mb-6">Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound; 