import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface SeverityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (severity: number) => void;
  currentValue?: number;
}

export const SeverityModal: React.FC<SeverityModalProps> = ({ isOpen, onClose, onSelect, currentValue }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getTrafficLightColor = (value: number) => {
    if (value >= 7) {
      return 'bg-alert-red text-white hover:bg-red-600 border-red-800'; // Red
    } else if (value >= 4) {
      return 'bg-[#FBBF24] text-slate-900 hover:bg-[#F59E0B] border-[#D97706]'; // Yellow
    } else {
      return 'bg-[#22C55E] text-white hover:bg-[#16A34A] border-[#15803D]'; // Green
    }
  };

  const rows = [
    { s: 10, level: 'high' },
    { s: 9, level: 'high' },
    { s: 8, level: 'modHigh' },
    { s: 7, level: 'modHigh' },
    { s: 6, level: 'modLow' },
    { s: 5, level: 'modLow' },
    { s: 4, level: 'modLow' },
    { s: 3, level: 'low' },
    { s: 2, level: 'low' },
    { s: 1, level: 'veryLow' },
  ].map(r => ({ ...r, colorClass: getTrafficLightColor(r.s) }));

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-steel-900/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-slate-50 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-slate-900">
              <h2 className="text-xl font-bold text-white">
                {t('pfmea.worksheet.severityCriteria.title', 'Process General Evaluation Severity (S) Criteria')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Content */}
            <div className="overflow-y-auto p-4 flex-1 bg-slate-50">
              <div className="min-w-[800px] w-full border-collapse border border-slate-300 rounded-lg overflow-hidden shadow-sm bg-slate-50">
                
                {/* Headers */}
                <div className="grid grid-cols-[60px_140px_1fr_1fr_1fr] bg-slate-800 text-white text-sm font-bold border-b border-slate-300 text-center">
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.severityCriteria.headers.s', '"S"')}
                  </div>
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.severityCriteria.headers.effect', 'Effect')}
                  </div>
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.severityCriteria.headers.impactPlant', 'Impact to your plant')}
                  </div>
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.severityCriteria.headers.impactShip', 'Impact to ship-to-plant')}
                  </div>
                  <div className="p-3 flex items-center justify-center">
                    {t('pfmea.worksheet.severityCriteria.headers.impactEndUser', 'Impact to End User')}
                  </div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col text-[13px] leading-relaxed">
                  {rows.map((row) => {
                    const isSelected = currentValue === row.s;
                    return (
                      <button
                        key={row.s}
                        onClick={() => {
                          onSelect(row.s);
                          onClose();
                        }}
                        className={`group grid grid-cols-[60px_140px_1fr_1fr_1fr] border-b border-slate-300 text-left transition-all ${
                          isSelected ? 'ring-2 ring-inset ring-blue-500 z-10 shadow-lg bg-blue-50' : 'bg-slate-50'
                        } hover:bg-slate-100`}
                      >
                        {/* Score (S) */}
                        <div className={`p-3 border-r border-slate-300 flex flex-col items-center justify-center relative font-black text-xl transition-colors ${row.colorClass}`}>
                          {isSelected && <Check size={16} className={`absolute top-1 right-1 opacity-90 ${row.s >= 7 || row.s <= 3 ? 'text-white' : 'text-slate-900'} drop-shadow-md`} />}
                          {row.s}
                        </div>

                        {/* Effect */}
                        <div className={`p-3 border-r border-slate-300 font-bold flex items-center justify-center text-center transition-colors ${row.colorClass}`}>
                          {t(`pfmea.worksheet.severityCriteria.levels.${row.level}`)}
                        </div>

                        {/* Plant Impact */}
                        <div className="p-3 border-r border-slate-300 text-slate-900 flex items-center font-medium">
                          {t(`pfmea.worksheet.severityCriteria.descriptions.${row.s}.plant`)}
                        </div>

                        {/* Ship-to-plant Impact */}
                        <div className="p-3 border-r border-slate-300 text-slate-900 flex items-center font-medium">
                          {t(`pfmea.worksheet.severityCriteria.descriptions.${row.s}.ship`)}
                        </div>

                        {/* End User Impact */}
                        <div className="p-3 text-slate-900 flex items-center font-medium">
                          {t(`pfmea.worksheet.severityCriteria.descriptions.${row.s}.endUser`)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-900 text-right">
              <span className="text-xs text-slate-400 font-medium">
                AIAG & VDA FMEA Handbook (1st Edition)
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
