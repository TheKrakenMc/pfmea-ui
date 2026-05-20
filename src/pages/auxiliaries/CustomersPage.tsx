import React from 'react';
import { useTranslation } from 'react-i18next';

const CustomersPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col p-8 bg-steel-950">
      <div className="glass-card p-8 rounded-xl border border-steel-700 w-full h-full">
        <h1 className="text-2xl font-bold text-steel-100 mb-2">{t('navbar.auxiliaries.customers')}</h1>
        <p className="text-steel-400">CRUD de clientes a los cuales los números de parte pertenecen.</p>
        <div className="mt-8 text-center text-steel-500">
          En construcción...
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
