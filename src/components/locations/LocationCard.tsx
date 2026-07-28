import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Edit2, Trash2, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ManufacturingLocation } from '../../services/locationService';

interface LocationCardProps {
  location: ManufacturingLocation;
  onEdit: (loc: ManufacturingLocation) => void;
  onDelete: (loc: ManufacturingLocation) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onEdit(location)}
      className="glass-card p-5 hover:border-indigo-500/50 transition-industrial flex flex-col h-full rounded-xl group relative cursor-pointer"
    >
      {/* Header: Icon + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
          <Building className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
              location.location_type
                ? 'bg-steel-800 text-steel-300 border-steel-700'
                : 'text-steel-600'
            }`}
          >
            {location.location_type || t('locations.noType', 'SIN TIPO')}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(location); }}
            className="p-1.5 text-steel-400 hover:text-red-400 bg-steel-950/50 hover:bg-steel-800 rounded-md transition-colors cursor-pointer"
            title={t('locations.actions.delete', 'Eliminar')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-steel-100 font-semibold text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2" title={location.location_name}>
          {location.location_name}
        </h3>
        <p className="text-sm text-steel-400 font-mono mt-1.5 flex items-center gap-2 truncate" title={location.location_code}>
          {location.location_code}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        {location.description && (
          <div className="flex items-start gap-2 text-steel-400 text-xs mb-3">
            <p className="line-clamp-2 leading-relaxed" title={location.description}>
              {location.description}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-steel-800/50">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-steel-800 border border-steel-700 text-steel-400 text-[10px] font-medium font-mono">
            ID: {location.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
