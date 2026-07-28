import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface DetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (detection: number) => void;
  currentValue?: number;
}

export const DetectionModal: React.FC<DetectionModalProps> = ({ isOpen, onClose, onSelect, currentValue }) => {
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
    { d: 10, level: 'veryLow' },
    { d: 9, level: 'veryLow' },
    { d: 8, level: 'low' },
    { d: 7, level: 'low' },
    { d: 6, level: 'moderate' },
    { d: 5, level: 'moderate' },
    { d: 4, level: 'high' },
    { d: 3, level: 'high' },
    { d: 2, level: 'high' },
    { d: 1, level: 'veryHigh' },
  ].map(r => ({ ...r, colorClass: getTrafficLightColor(r.d) }));

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
                {t('pfmea.worksheet.detectionCriteria.title', 'Detection Potential (D) for the Validation of the Process Design')}
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
                <div className="grid grid-cols-[60px_140px_1fr_2fr] bg-slate-800 text-white text-sm font-bold border-b border-slate-300 text-center">
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.detectionCriteria.headers.d', '"D"')}
                  </div>
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.detectionCriteria.headers.ability', 'Ability to Detect')}
                  </div>
                  <div className="p-3 border-r border-slate-700 flex items-center justify-center">
                    {t('pfmea.worksheet.detectionCriteria.headers.maturity', 'Detection Method maturity')}
                  </div>
                  <div className="p-3 flex items-center justify-center">
                    {t('pfmea.worksheet.detectionCriteria.headers.opportunity', 'Opportunity for Detection')}
                  </div>
                </div>

                {/* Body Rows */}
                <div className="flex flex-col text-[13px] leading-relaxed">
                  {rows.map((row) => {
                    const isSelected = currentValue === row.d;
                    return (
                      <button
                        key={row.d}
                        onClick={() => {
                          onSelect(row.d);
                          onClose();
                        }}
                        className={`group grid grid-cols-[60px_140px_1fr_2fr] border-b border-slate-300 text-left transition-all ${
                          isSelected ? 'ring-2 ring-inset ring-blue-500 z-10 shadow-lg bg-blue-50' : 'bg-slate-50'
                        } hover:bg-slate-100`}
                      >
                        {/* Score (D) */}
                        <div className={`p-3 border-r border-slate-300 flex flex-col items-center justify-center relative font-black text-xl transition-colors ${row.colorClass}`}>
                          {isSelected && <Check size={16} className={`absolute top-1 right-1 opacity-90 ${row.d >= 7 || row.d <= 3 ? 'text-white' : 'text-slate-900'} drop-shadow-md`} />}
                          {row.d}
                        </div>

                        {/* Ability */}
                        <div className={`p-3 border-r border-slate-300 font-bold flex items-center justify-center text-center transition-colors ${row.colorClass}`}>
                          {t(`pfmea.worksheet.detectionCriteria.levels.${row.level}`)}
                        </div>

                        {/* Maturity */}
                        <div className="p-3 border-r border-slate-300 text-slate-900 flex items-center justify-center text-center font-medium">
                          {t(`pfmea.worksheet.detectionCriteria.descriptions.${row.d}.maturity`)}
                        </div>

                        {/* Opportunity */}
                        <div className={`p-3 text-slate-900 flex items-center font-medium ${row.d >= 2 && row.d <= 4 ? 'text-alert-red font-semibold' : ''}`}>
                          {t(`pfmea.worksheet.detectionCriteria.descriptions.${row.d}.opportunity`)}
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
