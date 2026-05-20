import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-steel-950">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-4rem)]">
        {/* We use an Outlet here to render the matched child route */}
        <Outlet />
      </main>
    </div>
  );
};
