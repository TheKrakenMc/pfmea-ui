import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { AnimatePresence } from 'framer-motion';

// Lazy loading pages for performance optimization
const WelcomePage = React.lazy(() => import('../pages/WelcomePage').then(module => ({ default: module.WelcomePage })));
const FlowchartDashboard = React.lazy(() => import('../pages/flowcharts/FlowchartDashboard').then(module => ({ default: module.FlowchartDashboard })));
const FlowchartEditorPage = React.lazy(() => import('../pages/flowcharts/FlowchartEditorPage').then(module => ({ default: module.FlowchartEditorPage })));
const PFMEAPage = React.lazy(() => import('../pages/PFMEAPage'));
const CustomersPage = React.lazy(() => import('../pages/auxiliaries/CustomersPage'));
const ComponentsPage = React.lazy(() => import('../pages/auxiliaries/ComponentsPage'));
const MachineryPage = React.lazy(() => import('../pages/auxiliaries/MachineryPage'));
const OperationsPage = React.lazy(() => import('../pages/auxiliaries/OperationsPage'));

export const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-steel-950 text-white">Loading...</div>}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainLayout />}>
            {/* Welcome Page */}
            <Route index element={<WelcomePage />} />
            
            {/* Flowchart Module Routes */}
            <Route path="flowcharts">
              <Route index element={<FlowchartDashboard />} />
              <Route path=":id" element={<FlowchartEditorPage />} />
            </Route>

            <Route path="pfmea" element={<PFMEAPage />} />
            
            {/* Auxiliaries */}
            <Route path="auxiliaries">
              <Route path="customers" element={<CustomersPage />} />
              <Route path="components" element={<ComponentsPage />} />
              <Route path="machinery" element={<MachineryPage />} />
              <Route path="operations" element={<OperationsPage />} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};
