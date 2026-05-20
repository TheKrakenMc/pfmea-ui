import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GitBranch, ShieldCheck, Database, ArrowRight } from 'lucide-react';

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
      color: 'from-blue-500 to-cyan-400',
      shadowColor: 'group-hover:shadow-blue-500/20',
      borderColor: 'group-hover:border-blue-500/50',
    },
    {
      id: 'pfmea',
      icon: ShieldCheck,
      title: t('welcome.pfmea.title'),
      description: t('welcome.pfmea.description'),
      path: '/pfmea',
      color: 'from-emerald-500 to-teal-400',
      shadowColor: 'group-hover:shadow-emerald-500/20',
      borderColor: 'group-hover:border-emerald-500/50',
    },
    {
      id: 'auxiliaries',
      icon: Database,
      title: t('welcome.auxiliaries.title'),
      description: t('welcome.auxiliaries.description'),
      path: '/auxiliaries/customers',
      color: 'from-violet-500 to-purple-400',
      shadowColor: 'group-hover:shadow-violet-500/20',
      borderColor: 'group-hover:border-violet-500/50',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-steel-950 overflow-hidden relative w-full h-full min-h-[calc(100vh-64px)]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        className="w-full max-w-6xl z-10 px-4"
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
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-steel-200 to-steel-500 mb-6 tracking-tight">
            {t('welcome.title')}
          </h1>
          <p className="text-lg md:text-2xl text-steel-400 font-light max-w-3xl mx-auto leading-relaxed">
            {t('welcome.subtitle')}
          </p>
        </motion.div>

        {/* Module Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
              
              <h2 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-steel-300 transition-all">
                {mod.title}
              </h2>
              
              <p className="text-steel-400 leading-relaxed flex-grow">
                {mod.description}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-steel-500 group-hover:text-white transition-colors mt-8 pt-6 border-t border-steel-800/50">
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
