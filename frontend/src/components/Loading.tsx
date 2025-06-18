import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false }) => {
  return (
    <div className={`flex justify-center items-center w-full h-full p-5 ${fullScreen ? 'fixed inset-0 bg-white/80' : ''}`}>
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
