import React from 'react';
import { useTranslation } from 'react-i18next';

const PFMEAPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="glass-card p-12 rounded-xl text-center max-w-lg w-full border border-steel-700">
        <h1 className="text-3xl font-bold text-steel-100 mb-4">{t('navbar.pfmea')}</h1>
        <p className="text-steel-300">Modulo en construcción...</p>
      </div>
    </div>
  );
};

export default PFMEAPage;
