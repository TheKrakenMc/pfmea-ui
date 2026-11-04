import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="app-shell h-dvh overflow-hidden flex flex-col">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full min-h-0 overflow-y-auto">
        {/* We use an Outlet here to render the matched child route */}
        <Outlet />
      </main>
    </div>
  );
};
