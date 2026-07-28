import React from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, Box, Package, Wrench, Settings, MapPin, GitBranch, ClipboardList, Zap, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const auxiliaries = [
  { nameKey: 'navbar.auxiliaries.customers', icon: Users, path: '/auxiliaries/customers' },
  { nameKey: 'navbar.auxiliaries.components', icon: Box, path: '/auxiliaries/components' },
  { nameKey: 'navbar.auxiliaries.machinery', icon: Wrench, path: '/auxiliaries/machinery' },
  { nameKey: 'navbar.auxiliaries.locations', icon: MapPin, path: '/auxiliaries/locations' },
  { nameKey: 'navbar.auxiliaries.technologies', icon: Zap, path: '/auxiliaries/technologies' },
  { nameKey: 'navbar.auxiliaries.measurementUnits', icon: Ruler, path: '/auxiliaries/measurement-units' },
];

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userRole = user?.role_name?.toLowerCase() || "";
  const isAdmin = userRole === "administrator" || userRole === "admin";

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-md transition-industrial text-sm font-medium ${
      isActive ? 'bg-steel-800 text-forge-400' : 'text-steel-300 hover:text-steel-100 hover:bg-steel-800/50'
    }`;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-steel-900/40 dark:bg-black/50 backdrop-blur-md z-[100]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Side panel */}
          <motion.aside
            className="fixed inset-y-0 left-0 w-64 bg-steel-900/95 dark:bg-steel-950/95 backdrop-blur-xl border-r-2 border-forge-500 z-[110] shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            <div className="flex items-center justify-between p-4">
              <Link to="/" className="flex items-center gap-2" onClick={onClose}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-500 to-forge-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-steel-100 font-bold text-lg hidden sm:block">APG</span>
              </Link>
              <button onClick={onClose} className="p-2 rounded-md text-steel-300 hover:text-steel-100">
                <ChevronDown className="transform rotate-180" />
              </button>
            </div>
            <nav className="flex flex-col space-y-2 px-2 pb-6">
              <NavLink to="/products" className={navLinkClasses} onClick={onClose}>
                <Package className="w-4 h-4 mr-1.5 inline-block" />
                {t('navbar.products')}
              </NavLink>
              <NavLink to="/flowcharts" className={navLinkClasses} onClick={onClose}>
                <GitBranch className="w-4 h-4 mr-1.5 inline-block" />
                {t('navbar.flowchart')}
              </NavLink>
              <NavLink to="/pfmea" className={navLinkClasses} onClick={onClose}>
                <ClipboardList className="w-4 h-4 mr-1.5 inline-block" />
                {t('navbar.pfmea')}
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin/users" className={navLinkClasses} onClick={onClose}>
                  <Users className="w-4 h-4 mr-1.5 inline-block" />
                  {t("navbar.users", "Usuarios")}
                </NavLink>
              )}
              
              <div className="mt-4 pt-4 border-t border-steel-800">
                <h4 className="px-4 text-xs font-semibold text-steel-400 uppercase tracking-wider mb-2">
                  {t('navbar.auxiliaries.title', 'Auxiliares')}
                </h4>
                <div className="flex flex-col space-y-1">
                  {auxiliaries.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-steel-200 hover:bg-steel-800 hover:text-steel-100 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-steel-400" />
                      {t(item.nameKey)}
                    </Link>
                  );
                })}
                </div>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Drawer;
