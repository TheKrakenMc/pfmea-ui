import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ActionPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentS?: number;
  currentO?: number;
  currentD?: number;
}

const apMatrix = [
  { sLabel: '9-10', effectKey: 'veryHigh', sColor: 'bg-alert-red text-white border-red-800', sRange: [9, 10], sRowSpan: 17, groups: [
    { oLabel: '8-10', predKey: 'veryHigh', oColor: 'bg-alert-red text-white border-red-800', oRange: [8, 10], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' }
    ]},
    { oLabel: '6-7', predKey: 'high', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [6, 7], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' }
    ]},
    { oLabel: '4-5', predKey: 'moderate', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [4, 5], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' }
    ]},
    { oLabel: '2-3', predKey: 'low', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [2, 3], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '1', predKey: 'veryLow', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [1, 1], oRowSpan: 1, dRows: [
      { dLabel: '1..10', abKey: 'any', dColor: 'bg-[#F1F5F9] text-slate-500 border-slate-300', dRange: [1, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]}
  ]},
  { sLabel: '7-8', effectKey: 'high', sColor: 'bg-alert-red text-white border-red-800', sRange: [7, 8], sRowSpan: 17, groups: [
    { oLabel: '8-10', predKey: 'veryHigh', oColor: 'bg-alert-red text-white border-red-800', oRange: [8, 10], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' }
    ]},
    { oLabel: '6-7', predKey: 'high', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [6, 7], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' }
    ]},
    { oLabel: '4-5', predKey: 'moderate', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [4, 5], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' }
    ]},
    { oLabel: '2-3', predKey: 'low', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [2, 3], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '1', predKey: 'veryLow', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [1, 1], oRowSpan: 1, dRows: [
      { dLabel: '1..10', abKey: 'any', dColor: 'bg-[#F1F5F9] text-slate-500 border-slate-300', dRange: [1, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]}
  ]},
  { sLabel: '4-6', effectKey: 'moderate', sColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', sRange: [4, 6], sRowSpan: 17, groups: [
    { oLabel: '8-10', predKey: 'veryHigh', oColor: 'bg-alert-red text-white border-red-800', oRange: [8, 10], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'H', apColor: 'bg-alert-red text-white border-red-800' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' }
    ]},
    { oLabel: '6-7', predKey: 'high', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [6, 7], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '4-5', predKey: 'moderate', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [4, 5], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '2-3', predKey: 'low', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [2, 3], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '1', predKey: 'veryLow', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [1, 1], oRowSpan: 1, dRows: [
      { dLabel: '1..10', abKey: 'any', dColor: 'bg-[#F1F5F9] text-slate-500 border-slate-300', dRange: [1, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]}
  ]},
  { sLabel: '2-3', effectKey: 'low', sColor: 'bg-[#22C55E] text-white border-[#15803D]', sRange: [2, 3], sRowSpan: 17, groups: [
    { oLabel: '8-10', predKey: 'veryHigh', oColor: 'bg-alert-red text-white border-red-800', oRange: [8, 10], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'M', apColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '6-7', predKey: 'high', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [6, 7], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '4-5', predKey: 'moderate', oColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', oRange: [4, 5], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '2-3', predKey: 'low', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [2, 3], oRowSpan: 4, dRows: [
      { dLabel: '7-10', abKey: 'lowVeryLow', dColor: 'bg-alert-red text-white border-red-800', dRange: [7, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '5-6', abKey: 'moderate', dColor: 'bg-[#FBBF24] text-slate-900 border-[#D97706]', dRange: [5, 6], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '2-4', abKey: 'high', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [2, 4], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' },
      { dLabel: '1', abKey: 'veryHigh', dColor: 'bg-[#22C55E] text-white border-[#15803D]', dRange: [1, 1], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]},
    { oLabel: '1', predKey: 'veryLow', oColor: 'bg-[#22C55E] text-white border-[#15803D]', oRange: [1, 1], oRowSpan: 1, dRows: [
      { dLabel: '1..10', abKey: 'any', dColor: 'bg-[#F1F5F9] text-slate-500 border-slate-300', dRange: [1, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]}
  ]},
  { sLabel: '1', effectKey: 'none', sColor: 'bg-[#22C55E] text-white border-[#15803D]', sRange: [1, 1], sRowSpan: 1, groups: [
    { oLabel: '1..10', predKey: 'any', oColor: 'bg-[#F1F5F9] text-slate-500 border-slate-300', oRange: [1, 10], oRowSpan: 1, dRows: [
      { dLabel: '1..10', abKey: 'any', dColor: 'bg-[#F1F5F9] text-slate-500 border-slate-300', dRange: [1, 10], ap: 'L', apColor: 'bg-[#22C55E] text-white border-[#15803D]' }
    ]}
  ]}
];

export const ActionPriorityModal: React.FC<ActionPriorityModalProps> = ({ isOpen, onClose, currentS, currentO, currentD }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const inRange = (val: number | undefined, range: number[]) => {
    if (val === undefined) return false;
    return val >= range[0] && val <= range[1];
  };

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
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-slate-50 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-slate-900">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t('pfmea.worksheet.actionPriorityMatrix.title', 'Action Priority (AP)')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Table Content */}
            <div className="overflow-y-auto p-4 flex-1 bg-slate-50 relative">
              <div className="min-w-[800px] w-full border-collapse border border-slate-400 rounded-lg overflow-hidden shadow-sm bg-slate-50 relative">
                
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-800 text-white font-bold border-b border-slate-400">
                    <tr>
                      <th className="p-2 border-r border-slate-600">{t('pfmea.worksheet.actionPriorityMatrix.headers.effect', 'Effect')}</th>
                      <th className="p-2 border-r border-slate-600">{t('pfmea.worksheet.actionPriorityMatrix.headers.s', '"S"')}</th>
                      <th className="p-2 border-r border-slate-600">{t('pfmea.worksheet.actionPriorityMatrix.headers.prediction', 'Prediction of failure cause occurring')}</th>
                      <th className="p-2 border-r border-slate-600">{t('pfmea.worksheet.actionPriorityMatrix.headers.o', '"O"')}</th>
                      <th className="p-2 border-r border-slate-600">{t('pfmea.worksheet.actionPriorityMatrix.headers.ability', 'Ability to Detect')}</th>
                      <th className="p-2 border-r border-slate-600">{t('pfmea.worksheet.actionPriorityMatrix.headers.d', '"D"')}</th>
                      <th className="p-2">{t('pfmea.worksheet.actionPriorityMatrix.headers.ap', '"AP"')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apMatrix.map((sGroup, sIndex) => {
                      const isSMatch = inRange(currentS, sGroup.sRange);
                      return sGroup.groups.map((oGroup, oIndex) => {
                        const isOMatch = isSMatch && inRange(currentO, oGroup.oRange);
                        return oGroup.dRows.map((dRow, dIndex) => {
                          const isDMatch = isOMatch && inRange(currentD, dRow.dRange);
                          
                          // Style overrides for highlighted row
                          const rowHighlightClass = isDMatch ? 'relative z-10 ring-2 ring-inset ring-blue-500 bg-blue-50 shadow-lg scale-[1.01] transition-transform' : '';
                          const textHighlightClass = isDMatch ? 'font-black drop-shadow-md' : 'font-medium';
                          
                          return (
                            <tr key={`${sIndex}-${oIndex}-${dIndex}`} className={`${rowHighlightClass} hover:bg-slate-100 transition-colors`}>
                              
                              {/* S Group Cells (only render on first row of the S group) */}
                              {oIndex === 0 && dIndex === 0 && (
                                <>
                                  <td rowSpan={sGroup.sRowSpan} className={`p-2 border-r border-b border-slate-300 ${sGroup.sColor} font-bold text-sm leading-tight max-w-[150px]`}>
                                    {t(`pfmea.worksheet.actionPriorityMatrix.effects.${sGroup.effectKey}`)}
                                  </td>
                                  <td rowSpan={sGroup.sRowSpan} className={`p-2 border-r border-b border-slate-300 ${sGroup.sColor} font-black text-xl`}>
                                    {sGroup.sLabel}
                                  </td>
                                </>
                              )}

                              {/* O Group Cells (only render on first row of the O group) */}
                              {dIndex === 0 && (
                                <>
                                  <td rowSpan={oGroup.oRowSpan} className={`p-2 border-r border-b border-slate-300 ${oGroup.oColor} font-bold text-sm leading-tight max-w-[150px]`}>
                                    {t(`pfmea.worksheet.actionPriorityMatrix.predictions.${oGroup.predKey}`)}
                                  </td>
                                  <td rowSpan={oGroup.oRowSpan} className={`p-2 border-r border-b border-slate-300 ${oGroup.oColor} font-black text-lg`}>
                                    {oGroup.oLabel}
                                  </td>
                                </>
                              )}

                              {/* D Rows (render every row) */}
                              <td className={`p-2 border-r border-b border-slate-300 ${dRow.dColor} ${textHighlightClass} leading-tight max-w-[150px]`}>
                                {t(`pfmea.worksheet.actionPriorityMatrix.abilities.${dRow.abKey}`)}
                              </td>
                              <td className={`p-2 border-r border-b border-slate-300 ${dRow.dColor} font-bold text-base`}>
                                {dRow.dLabel}
                              </td>

                              {/* AP Column */}
                              <td className={`p-2 border-b border-slate-300 ${dRow.apColor} font-black text-xl w-16 text-center`}>
                                {dRow.ap}
                              </td>
                            </tr>
                          );
                        });
                      });
                    })}
                  </tbody>
                </table>
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
