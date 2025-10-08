import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
        <FiLoader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
};

export default Loader; 