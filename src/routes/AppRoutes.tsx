import React, { Suspense } from "react";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

// Lazy loading pages for performance optimization
const LoginPage = React.lazy(() =>
  import("../pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const WelcomePage = React.lazy(() =>
  import("../pages/WelcomePage").then((module) => ({
    default: module.WelcomePage,
  })),
);
const FlowchartDashboard = React.lazy(() =>
  import("../pages/flowcharts/FlowchartDashboard").then((module) => ({
    default: module.FlowchartDashboard,
  })),
);
const FlowchartEditorPage = React.lazy(() =>
  import("../pages/flowcharts/FlowchartEditorPage").then((module) => ({
    default: module.FlowchartEditorPage,
  })),
);
const PFMEADashboard = React.lazy(() =>
  import("../pages/pfmea/PFMEADashboard").then((module) => ({
    default: module.PFMEADashboard,
  })),
);
const PFMEAEditorPage = React.lazy(() =>
  import("../pages/pfmea/PFMEAEditorPage").then((module) => ({
    default: module.PFMEAEditorPage,
  })),
);
const CustomersPage = React.lazy(
  () => import("../pages/auxiliaries/CustomersPage"),
);
const ComponentsPage = React.lazy(
  () => import("../pages/auxiliaries/ComponentsPage"),
);
const MachineryPage = React.lazy(
  () => import("../pages/auxiliaries/MachineryPage"),
);
const OperationsPage = React.lazy(
  () => import("../pages/auxiliaries/OperationsPage"),
);
const TechnologiesPage = React.lazy(
  () => import("../pages/auxiliaries/TechnologiesPage"),
);
const LocationsPage = React.lazy(
  () => import("../pages/auxiliaries/LocationsPage"),
);
const MeasurementUnitsPage = React.lazy(
  () => import("../pages/auxiliaries/MeasurementUnitsPage").then((module) => ({
    default: module.MeasurementUnitsPage,
  })),
);
const ProductListPage = React.lazy(
  () => import("../pages/products/ProductListPage"),
);
const ProductDetailPage = React.lazy(
  () => import("../pages/products/ProductDetailPage"),
);
const UserManagementPage = React.lazy(() =>
  import("../pages/admin/UserManagementPage").then((module) => ({
    default: module.UserManagementPage,
  })),
);

// ─── Protected Route Component ───────────────────────────────────────────────

const ProtectedRoute: React.FC<{ allowedRoles?: string[] }> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-steel-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-forge-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-semibold tracking-wider text-steel-400 uppercase">
            {t("common.loadingSession", "Cargando sesión segura...")}
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = user?.role_name?.toLowerCase();
    const hasRole = allowedRoles.some(
      (role) => role.toLowerCase() === userRole,
    );
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

// ─── AppRoutes Component ──────────────────────────────────────────────────────

export const AppRoutes: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-steel-950 text-white">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-forge-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-xs text-steel-500 uppercase tracking-widest">
              {t("common.loadingModules", "Iniciando módulos...")}
            </span>
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Secure Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              {/* Welcome Page */}
              <Route index element={<WelcomePage />} />

              {/* Flowchart Module Routes */}
              <Route path="flowcharts">
                <Route index element={<FlowchartDashboard />} />
                <Route path=":id" element={<FlowchartEditorPage />} />
              </Route>

              <Route path="pfmea">
                <Route index element={<PFMEADashboard />} />
                <Route path=":id" element={<PFMEAEditorPage />} />
              </Route>

              {/* Product Module Routes */}
              <Route path="products">
                <Route index element={<ProductListPage />} />
                <Route path=":id" element={<ProductDetailPage />} />
              </Route>

              {/* Auxiliaries */}
              <Route path="auxiliaries">
                <Route path="customers" element={<CustomersPage />} />
                <Route path="components" element={<ComponentsPage />} />
                <Route path="machinery" element={<MachineryPage />} />
                <Route path="operations" element={<OperationsPage />} />
                <Route path="technologies" element={<TechnologiesPage />} />
                <Route path="locations" element={<LocationsPage />} />
                <Route path="measurement-units" element={<MeasurementUnitsPage />} />
              </Route>

              {/* Administrative User Directory */}
              <Route
                element={<ProtectedRoute allowedRoles={["Administrator"]} />}
              >
                <Route path="admin/users" element={<UserManagementPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};
