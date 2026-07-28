import React from 'react';
import { motion } from 'framer-motion';
import { Factory, Edit2, Trash2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Machinery } from '../../types/machinery.types';
import type { Plant } from '../../services/plantService';
import type { ManufacturingLocation } from '../../services/locationService';

interface MachineryCardProps {
  item: Machinery;
  plants?: Plant[];
  locations?: ManufacturingLocation[];
  onEdit: (machinery: Machinery) => void;
  onDelete: (machinery: Machinery) => void;
}

export const MachineryCard: React.FC<MachineryCardProps> = ({
  item,
  plants = [],
  locations = [],
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const getPlantName = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return `ID: ${plantId}`;
    if (plant.name && plant.code) {
      return `${plant.name} (${plant.code})`;
    }
    return plant.name || plant.code || `ID: ${plantId}`;
  };

  const getLocationName = (locationId?: number) => {
    if (!locationId) return 'Sin ubicación';
    const loc = locations.find((l) => l.id === locationId);
    if (!loc) return `ID: ${locationId}`;
    return `${loc.location_name}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onEdit(item)}
      className="glass-card p-5 hover:border-indigo-500/50 transition-industrial flex flex-col h-full rounded-xl group relative cursor-pointer"
    >
      {/* Header: Icon + Actions */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
          <Factory className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
              item.is_active
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}
          >
            {item.is_active ? t('admin.status.active', 'ACTIVO') : t('admin.status.inactive', 'INACTIVO')}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            className="p-1.5 text-steel-400 hover:text-red-400 bg-steel-950/50 hover:bg-steel-800 rounded-md transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-steel-100 font-semibold text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2" title={item.machinery_name}>
          {item.machinery_name}
        </h3>
        <p className="text-sm text-steel-400 font-mono mt-1.5 flex items-center gap-2 truncate" title={item.machinery_code}>
          {item.machinery_code}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-steel-400 text-xs mb-3">
          <Factory className="w-4 h-4 shrink-0 text-steel-500" />
          <span className="truncate">{getPlantName(item.plant_id)}</span>
        </div>
        <div className="flex items-center gap-2 text-steel-400 text-xs mb-3">
          <MapPin className="w-4 h-4 shrink-0 text-steel-500" />
          <span className="truncate">{getLocationName(item.location_id)}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-steel-800/50">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-steel-800 border border-steel-700 text-steel-400 text-[10px] font-medium font-mono">
            ID: {item.id}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {item.created_at && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-steel-500 uppercase tracking-wider font-semibold w-16">Creado:</span>
              <span className="text-xs text-steel-400">
                {new Date(item.created_at).toLocaleDateString('es-MX')}
              </span>
            </div>
          )}
          {item.updated_at && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-steel-500 uppercase tracking-wider font-semibold w-16">Modificado:</span>
              <span className="text-xs text-steel-400">
                {new Date(item.updated_at).toLocaleDateString('es-MX')}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
