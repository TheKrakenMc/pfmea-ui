import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Machinery } from '../../types/machinery.types';
import type { Plant } from '../../services/plantService';
import type { ManufacturingLocation } from '../../services/locationService';
import { motion, AnimatePresence } from 'framer-motion';

interface MachineryTableProps {
  machinery: Machinery[];
  plants?: Plant[];
  locations?: ManufacturingLocation[];
  onEdit: (machinery: Machinery) => void;
  onDelete: (machinery: Machinery) => void;
}

export const MachineryTable: React.FC<MachineryTableProps> = ({
  machinery,
  plants = [],
  locations = [],
  onEdit,
  onDelete,
}) => {
  const getPlantName = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return `ID: ${plantId}`;
    if (plant.name && plant.code) {
      return `${plant.name} (${plant.code})`;
    }
    return plant.name || plant.code || `ID: ${plantId}`;
  };

  const getLocationName = (locationId?: number) => {
    if (!locationId) return '-';
    const loc = locations.find((l) => l.id === locationId);
    if (!loc) return `ID: ${locationId}`;
    return `${loc.location_name} (${loc.location_code})`;
  };



  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-medium">Código</th>
            <th className="px-6 py-4 font-medium">Nombre de Maquinaria</th>
            <th className="px-6 py-4 font-medium">Planta</th>
            <th className="px-6 py-4 font-medium">Ubicación</th>
            <th className="px-6 py-4 font-medium">Estatus</th>
            <th className="px-6 py-4 font-medium text-right w-24">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800">
          <AnimatePresence>
            {machinery.map((item) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-steel-800/30 transition-colors group"
              >
                <td className="px-6 py-4 text-steel-200 font-medium">{item.machinery_code}</td>
                <td className="px-6 py-4 text-steel-200">{item.machinery_name}</td>
                <td className="px-6 py-4 text-steel-300">{getPlantName(item.plant_id)}</td>
                <td className="px-6 py-4 text-steel-300">{getLocationName(item.location_id)}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors inline-flex focus-ring"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors inline-flex focus-ring"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};
