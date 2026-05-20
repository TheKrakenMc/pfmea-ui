// ─────────────────────────────────────────────────────────────
//  FlowchartHeader — Collapsible project metadata panel
//  Displays plant, region, customer, part number, and status.
//  These fields feed directly into the PFMEA analysis module.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Factory,
  Globe2,
  Users,
  Hash,
  Clock,
  User,
} from 'lucide-react';
import { useFlowchart } from '../../hooks/useFlowchart';
import type { DiagramStatus } from '../../types/flowchart.types';

const STATUS_STYLES: Record<DiagramStatus, { bg: string; text: string; dot: string }> = {
  draft: {
    bg: 'bg-alert-amber/15 border-alert-amber/30',
    text: 'text-alert-amber',
    dot: 'bg-alert-amber',
  },
  in_review: {
    bg: 'bg-review-500/15 border-review-500/30',
    text: 'text-review-500',
    dot: 'bg-review-500',
  },
  approved: {
    bg: 'bg-success-500/15 border-success-500/30',
    text: 'text-success-500',
    dot: 'bg-success-500',
  },
};

export function FlowchartHeader() {
  const { t } = useTranslation();
  const { state } = useFlowchart();
  const { header } = state;
  const [isExpanded, setIsExpanded] = useState(true);

  const statusStyle = STATUS_STYLES[header.diagramStatus];

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-industrial hover:bg-steel-800/50 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forge-glow">
            <Factory size={18} className="text-forge-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-steel-100">
              {t('header.title')}
            </h2>
            <p className="text-xs text-steel-400">
              {header.plantCode} — {header.partNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {t(`status.${header.diagramStatus}`)}
          </span>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-steel-400" />
          </motion.div>
        </div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-steel-700/50 px-6 pt-4 pb-5">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {/* Plant Code */}
                <MetadataField
                  icon={<Factory size={14} />}
                  label={t('header.plantCode')}
                  value={header.plantCode}
                />

                {/* Plant Name */}
                <MetadataField
                  icon={<Factory size={14} />}
                  label={t('header.plantName')}
                  value={header.plantName}
                />

                {/* Region */}
                <MetadataField
                  icon={<Globe2 size={14} />}
                  label={t('header.region')}
                  value={header.region}
                />

                {/* Customer */}
                <MetadataField
                  icon={<Users size={14} />}
                  label={t('header.customer')}
                  value={header.customer}
                  highlight
                />

                {/* Part Number */}
                <MetadataField
                  icon={<Hash size={14} />}
                  label={t('header.partNumber')}
                  value={header.partNumber}
                  mono
                />

                {/* Part Name */}
                <MetadataField
                  icon={<Hash size={14} />}
                  label={t('header.partName')}
                  value={header.partName}
                />

                {/* Last Modified */}
                <MetadataField
                  icon={<Clock size={14} />}
                  label={t('header.lastModified')}
                  value={formatDate(header.lastModified)}
                />

                {/* Modified By */}
                <MetadataField
                  icon={<User size={14} />}
                  label={t('header.modifiedBy')}
                  value={header.modifiedBy}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Metadata Field Sub-component ────────────────────────────

interface MetadataFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}

function MetadataField({ icon, label, value, mono, highlight }: MetadataFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-steel-500">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm ${
          highlight
            ? 'font-semibold text-forge-400'
            : mono
              ? 'font-mono text-steel-100'
              : 'text-steel-200'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
