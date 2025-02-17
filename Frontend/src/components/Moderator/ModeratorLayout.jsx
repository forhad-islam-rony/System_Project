import React from 'react';
import ModeratorNav from './ModeratorNav';

const ModeratorLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <ModeratorNav />
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
};

export default ModeratorLayout; 