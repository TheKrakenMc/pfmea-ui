import React from 'react';
import { useTranslation } from 'react-i18next';

const MachineryPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col p-8 bg-steel-950">
      <div className="glass-card p-8 rounded-xl border border-steel-700 w-full h-full">
        <h1 className="text-2xl font-bold text-steel-100 mb-2">{t('navbar.auxiliaries.machinery')}</h1>
        <p className="text-steel-400">CRUD de la maquinaria y/o herramentales utilizadas en las operaciones/tecnologías.</p>
        <div className="mt-8 text-center text-steel-500">
          En construcción...
        </div>
      </div>
    </div>
  );
};

export default MachineryPage;
