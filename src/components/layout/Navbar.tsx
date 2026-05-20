{
  /* Main Links */
}
import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Users,
  Box,
  Wrench,
  Settings,
  UserCircle,
  Sun,
  Moon,
  Languages,
  Menu,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Drawer from "./Drawer";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isAuxiliariesOpen, setIsAuxiliariesOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAuxiliariesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-md transition-industrial text-sm font-medium ${
      isActive
        ? "bg-steel-800 text-forge-400"
        : "text-steel-300 hover:text-steel-100 hover:bg-steel-800/50"
    }`;

  const auxiliariesMenu = [
    {
      name: t("navbar.auxiliaries.customers"),
      icon: Users,
      path: "/auxiliaries/customers",
    },
    {
      name: t("navbar.auxiliaries.components"),
      icon: Box,
      path: "/auxiliaries/components",
    },
    {
      name: t("navbar.auxiliaries.machinery"),
      icon: Wrench,
      path: "/auxiliaries/machinery",
    },
    {
      name: t("navbar.auxiliaries.operations"),
      icon: Settings,
      path: "/auxiliaries/operations",
    },
  ];

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-steel-800 bg-steel-950/80">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Navigation */}
          <div className="flex items-center gap-8">
            {/* APG Stylized Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 focus-ring"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-forge-500 to-forge-700 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <span className="text-white font-bold text-lg tracking-wider">
                  A
                </span>
              </div>
              <span className="text-steel-100 font-bold text-xl tracking-widest uppercase hidden sm:block">
                APG
              </span>
            </Link>

            {/* Main Links */}
            <div className="hidden lg:flex items-center space-x-2">
              <NavLink to="/flowcharts" className={navLinkClasses}>
                {t("navbar.flowchart")}
              </NavLink>

              <NavLink to="/pfmea" className={navLinkClasses}>
                {t("navbar.pfmea")}
              </NavLink>

              {/* Auxiliaries Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsAuxiliariesOpen(!isAuxiliariesOpen)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-industrial text-sm font-medium focus-ring ${
                    isAuxiliariesOpen
                      ? "bg-steel-800 text-steel-100"
                      : "text-steel-300 hover:text-steel-100 hover:bg-steel-800/50"
                  }`}
                  aria-expanded={isAuxiliariesOpen}
                  aria-haspopup="true"
                >
                  {t("navbar.auxiliaries.title")}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isAuxiliariesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isAuxiliariesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full mt-2 w-56 rounded-lg glass-card border border-steel-700 shadow-xl overflow-hidden py-1"
                    >
                      {auxiliariesMenu.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsAuxiliariesOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-steel-200 hover:bg-steel-800 hover:text-steel-100 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-steel-400" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden flex items-center p-2 rounded-md text-steel-300 hover:text-steel-100 hover:bg-steel-800 transition-colors focus-ring"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
              />
            </div>
          </div>

          {/* Right Section: Language & User */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-md text-steel-300 hover:text-steel-100 hover:bg-steel-800 transition-colors focus-ring cursor-pointer"
              title={t("theme.toggle", "Toggle Theme")}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Language Toggle CTA */}
            <motion.button
              type="button"
              onClick={toggleLanguage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-xl border border-steel-700 bg-steel-800/60 px-3.5 py-2 text-xs font-medium text-steel-300 transition-industrial hover:border-forge-500/30 hover:text-forge-400 cursor-pointer"
            >
              <Languages size={14} />
              <span>{i18n.language === "es" ? "ES" : "EN"}</span>
            </motion.button>

            <div className="h-6 w-px bg-steel-700 hidden sm:block"></div>

            <div className="flex items-center gap-3 cursor-pointer group focus-ring p-1 rounded-md">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-steel-100 group-hover:text-forge-400 transition-colors">
                  John Doe
                </p>
                <p className="text-xs text-steel-400">Process Engineer</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-steel-800 border border-steel-600 flex items-center justify-center text-steel-300 group-hover:border-forge-500 group-hover:text-forge-400 transition-colors">
                <UserCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
