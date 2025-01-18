import React from 'react';

const Error = ({ errorMessage }) => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <div className="text-center">
        <h3 className="text-2xl text-headingColor font-bold mb-4">
          Oops... Something went wrong
        </h3>
        <p className="text-[15px] leading-6 text-textColor font-medium">
          {errorMessage}
        </p>
      </div>
    </div>
  );
};

export default Error; 