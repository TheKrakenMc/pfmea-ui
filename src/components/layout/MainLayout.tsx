import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-steel-950 bg-grid-pattern">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full min-h-0 overflow-y-auto overflow-x-hidden">
        {/* We use an Outlet here to render the matched child route */}
        <Outlet />
      </main>
    </div>
  );
};
