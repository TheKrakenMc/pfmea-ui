import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit2, Trash2, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Customer } from '../../types/customer.types';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onEdit(customer)}
      className="glass-card p-5 hover:border-indigo-500/50 transition-industrial flex flex-col h-full rounded-xl group relative cursor-pointer"
    >
      {/* Header: Icon + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
              customer.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}
          >
            {t(`admin.status.${customer.status?.toLowerCase() || 'inactive'}`, customer.status)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(customer); }}
            className="p-1.5 text-steel-400 hover:text-red-400 bg-steel-950/50 hover:bg-steel-800 rounded-md transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-steel-100 font-semibold text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2" title={customer.company_name}>
          {customer.company_name}
        </h3>
        <p className="text-sm text-steel-400 font-mono mt-1.5 flex items-center gap-2 truncate" title={customer.customer_code}>
          {customer.customer_code}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        {customer.contact_email && (
          <div className="flex items-center gap-2 text-steel-400 text-xs mb-3">
            <Mail className="w-4 h-4 shrink-0 text-steel-500" />
            <span className="truncate">{customer.contact_email}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-steel-800/50">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-steel-800 border border-steel-700 text-steel-400 text-[10px] font-medium font-mono">
            ID: {customer.id}
          </span>
          {customer.safety_characteristic && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
              {customer.safety_characteristic}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
