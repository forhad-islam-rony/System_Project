import React from 'react';
import HashLoader from 'react-spinners/HashLoader';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <HashLoader color="#0067FF" />
    </div>
  );
};

export default Loading; 