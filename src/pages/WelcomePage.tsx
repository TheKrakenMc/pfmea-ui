import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GitBranch, ShieldCheck, Database, ArrowRight, Package } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const modules = [
    {
      id: 'flowcharts',
      icon: GitBranch,
      title: t('welcome.flowchart.title'),
      description: t('welcome.flowchart.description'),
      path: '/flowcharts',
      color: 'from-forge-500 to-forge-400',
      shadowColor: 'group-hover:shadow-forge-500/20',
      borderColor: 'group-hover:border-forge-500/50',
    },
    {
      id: 'pfmea',
      icon: ShieldCheck,
      title: t('welcome.pfmea.title'),
      description: t('welcome.pfmea.description'),
      path: '/pfmea',
      color: 'from-forge-600 to-forge-500',
      shadowColor: 'group-hover:shadow-forge-600/20',
      borderColor: 'group-hover:border-forge-600/50',
    },
    {
      id: 'products',
      icon: Package,
      title: t('navbar.products'), // Using navbar key or products.title
      description: t('products.subtitle'),
      path: '/products',
      color: 'from-forge-700 to-forge-600',
      shadowColor: 'group-hover:shadow-forge-700/20',
      borderColor: 'group-hover:border-forge-700/50',
    },
    {
      id: 'auxiliaries',
      icon: Database,
      title: t('welcome.auxiliaries.title'),
      description: t('welcome.auxiliaries.description'),
      path: '/auxiliaries/customers',
      color: 'from-forge-400 to-forge-300',
      shadowColor: 'group-hover:shadow-forge-400/20',
      borderColor: 'group-hover:border-forge-400/50',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent overflow-hidden relative w-full h-full min-h-[calc(100vh-64px)]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-forge-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-forge-400/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="w-full max-w-7xl z-10 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-steel-900 border border-steel-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-steel-400">
              Workspace Environment
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-forge-300 via-forge-500 to-forge-700 mb-6 tracking-tight pb-2">
            {t('welcome.title')}
          </h1>
          <p className="text-sm md:text-base text-steel-500 dark:text-steel-500 max-w-4xl mx-auto mt-6 leading-relaxed font-medium">
            {t('welcome.vision')}
          </p>
        </motion.div>

        {/* Module Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {modules.map((mod) => (
            <motion.div
              key={mod.id}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(mod.path)}
              className={`group cursor-pointer p-8 rounded-3xl bg-steel-900/40 border border-steel-800/80 backdrop-blur-md transition-all duration-300 ${mod.borderColor} shadow-2xl shadow-black/40 ${mod.shadowColor} relative overflow-hidden flex flex-col h-full min-h-[320px]`}
            >
              {/* Card internal gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

              <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center bg-gradient-to-br ${mod.color} shadow-lg`}>
                <mod.icon className="w-7 h-7 text-white drop-shadow-md" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 tracking-tight text-steel-100 dark:text-white group-hover:text-forge-600 dark:group-hover:text-forge-400 transition-colors">
                {mod.title}
              </h2>
              
              <p className="text-steel-400 dark:text-steel-600 leading-relaxed flex-grow">
                {mod.description}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-steel-500 transition-colors mt-8 pt-6 border-t border-steel-800/50">
                {t('welcome.getStarted')}
                <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
};
