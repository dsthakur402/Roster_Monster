import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiX } from 'react-icons/fi';

interface ErrorPopupProps {
  message: string;
  isAuthError?: boolean;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, isAuthError = false, onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-4 bg-red-600/10 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-white">Error</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-300 mb-4">{message}</p>
          <div className="flex justify-end gap-3">
            {isAuthError && (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Go to Login
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPopup; 