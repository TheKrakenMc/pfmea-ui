import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Building } from 'lucide-react';
import type { ManufacturingLocation } from '../../services/locationService';

interface LocationTableProps {
  locations: ManufacturingLocation[];
  onEdit: (loc: ManufacturingLocation) => void;
  onDelete: (loc: ManufacturingLocation) => void;
}

export const LocationTable: React.FC<LocationTableProps> = ({
  locations,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-sm text-steel-300">
        <thead className="bg-steel-900/50 text-xs uppercase text-steel-400 border-b border-steel-800">
          <tr>
            <th className="px-6 py-4 font-medium">{t('locations.table.code')}</th>
            <th className="px-6 py-4 font-medium">{t('locations.table.name')}</th>
            <th className="px-6 py-4 font-medium">{t('locations.table.type')}</th>
            <th className="px-6 py-4 font-medium">{t('locations.table.description')}</th>
            <th className="px-6 py-4 font-medium text-right w-24">{t('locations.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-800">
          {locations.map((loc) => (
            <tr key={loc.id} className="hover:bg-steel-800/30 transition-colors group">
              <td className="px-6 py-4 text-steel-200 font-medium">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-steel-800 text-steel-400 group-hover:text-forge-400 transition-colors">
                    <Building size={16} />
                  </div>
                  <span>{loc.location_code}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-steel-100">{loc.location_name}</td>
              <td className="px-6 py-4">
                {loc.location_type ? (
                  <span className="px-2.5 py-1 text-xs font-medium bg-steel-800 text-steel-300 rounded-md border border-steel-700">
                    {loc.location_type}
                  </span>
                ) : (
                  <span className="text-steel-600">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-steel-400 text-sm max-w-xs truncate">{loc.description || '-'}</td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(loc)}
                    className="p-1.5 text-steel-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                    title={t('locations.actions.edit')}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(loc)}
                    className="p-1.5 text-steel-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer focus-ring"
                    title={t('locations.actions.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
