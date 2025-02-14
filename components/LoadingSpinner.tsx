import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message = 'Error Loading Article' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-2xl font-bold text-red-500 mb-4">{message}</h2>
    <p className="text-gray-400">Please try again later</p>
  </div>
); 