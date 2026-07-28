// ─────────────────────────────────────────────────────────────
//  DocumentHistoryDrawer — Sliding side panel with document
//  lifecycle timeline, immutable metadata, and retention policy.
//  AIAG-VDA compliant audit trail visualization.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  X,
  Clock,
  Archive,
  CheckCircle2,
  PlusCircle,
  GitBranch,
  Eye,
  Shield,
  Calendar,
  User,
  Hash,
  FileText,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { getFlowchartHistory } from '../../services/flowchartService';
import type { FlowchartHistoryRead } from '../../services/flowchartService';
import { formatDate } from '../../utils/dateUtils';

interface DocumentHistoryDrawerProps {
  flowchartId: number;
  flowchartTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'timeline' | 'metadata' | 'retention';

// ─── Event icon/color resolver ────────────────────────────────

function getEventStyle(action: string): { icon: React.ElementType; color: string; bg: string; label: string } {
  const lower = action.toLowerCase();
  if (lower.includes('archived') || lower === 'archived') {
    return { icon: Archive, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/40', label: 'archived' };
  }
  if (lower.includes('approved')) {
    return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/40', label: 'approved' };
  }
  if (lower.includes('review')) {
    return { icon: Eye, color: 'text-review-500', bg: 'bg-review-500/15 border-review-500/30', label: 'inReview' };
  }
  if (lower.includes('created') || lower.includes('initial')) {
    return { icon: PlusCircle, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30', label: 'created' };
  }
  return { icon: GitBranch, color: 'text-steel-400', bg: 'bg-steel-800 border-steel-700', label: 'revised' };
}

// ─── Retention calculator ─────────────────────────────────────

function calcRetentionDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setFullYear(d.getFullYear() + 1); // minimum: creation + 1 extra year
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// ═════════════════════════════════════════════════════════════
//  DocumentHistoryDrawer
// ═════════════════════════════════════════════════════════════

export const DocumentHistoryDrawer: React.FC<DocumentHistoryDrawerProps> = ({
  flowchartId,
  flowchartTitle,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  const [history, setHistory] = useState<FlowchartHistoryRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    getFlowchartHistory(flowchartId)
      .then(setHistory)
      .catch(() => setError(t('archive.errors.historyLoadFailed')))
      .finally(() => setLoading(false));
  }, [isOpen, flowchartId, t]);

  // Build unified chronological timeline from versions + audit_logs
  const timelineEvents = React.useMemo(() => {
    if (!history) return [];
    type TimelineEvent = {
      id: string;
      action: string;
      date: string;
      performer?: string;
      reason?: string;
      eco?: string;
      revision?: number;
      snapshotSteps?: number;
    };

    const events: TimelineEvent[] = [];

    // Add version records
    history.versions.forEach((v) => {
      events.push({
        id: `v-${v.id}`,
        action: v.is_initial_revision ? 'CREATED' : 'REVISED',
        date: v.created_at,
        performer: v.creator?.full_name,
        reason: v.change_reason,
        eco: v.snapshot_data?.eco_number,
        revision: v.revision_number,
        snapshotSteps: v.snapshot_data?.steps_count,
      });
    });

    // Add audit log entries
    history.audit_logs.forEach((log) => {
      let reasonText = log.action_details || '';
      
      // Convert technical endpoints to user-friendly messages
      if (reasonText.includes('PUT /api/v1/flowcharts/') && reasonText.includes('/steps')) {
        reasonText = 'Actualización masiva de pasos del diagrama de flujo.';
      } else if (reasonText.includes('PUT /api/v1/flowcharts/')) {
        reasonText = 'Actualización de propiedades generales del diagrama de flujo.';
      } else if (reasonText.includes('POST /api/v1/flowcharts')) {
        reasonText = 'Creación inicial del diagrama de flujo.';
      } else if (reasonText.includes('PATCH /api/v1/flowcharts/') && reasonText.includes('/archive')) {
        reasonText = 'El diagrama de flujo ha sido archivado.';
      }

      if (log.new_values && typeof log.new_values === 'object') {
        const keys = Object.keys(log.new_values).filter(k => k !== 'steps');
        if (keys.length > 0) {
          reasonText += ` Campos actualizados: ${keys.join(', ')}.`;
        }
      }

      events.push({
        id: `a-${log.id}`,
        action: log.action === 'UPDATE' ? 'REVISED' : log.action,
        date: log.performed_at,
        performer: log.performer?.full_name,
        reason: reasonText,
      });
    });

    // Sort chronologically
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  // Find archive metadata from the latest archived version
  const archiveVersion = React.useMemo(() => {
    if (!history) return null;
    return history.versions.find((v) =>
      v.snapshot_data?.status?.toLowerCase() === 'archived' ||
      v.change_reason?.toLowerCase().includes('archiv')
    ) || history.versions[history.versions.length - 1] || null;
  }, [history]);

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: 'timeline', label: t('archive.history.timeline'), icon: Clock },
    { key: 'metadata', label: t('archive.history.metadata'), icon: Shield },
    { key: 'retention', label: t('archive.history.retention'), icon: Calendar },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-steel-900/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-steel-900 border-l border-steel-800 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-steel-800/80 bg-steel-950/40 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                  <Clock size={18} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-steel-100">{t('archive.history.title')}</h2>
                  <p className="text-xs text-steel-400 truncate max-w-[220px] mt-0.5" title={flowchartTitle}>
                    {flowchartTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-steel-400 hover:text-steel-200 hover:bg-steel-800 rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-steel-800/60 shrink-0 bg-steel-950/20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all cursor-pointer border-b-2 ${
                      activeTab === tab.key
                        ? 'text-amber-400 border-amber-400 bg-amber-500/5'
                        : 'text-steel-400 border-transparent hover:text-steel-300 hover:bg-steel-800/30'
                    }`}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center gap-2 p-10 text-steel-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Cargando historial...</span>
                </div>
              )}

              {error && (
                <div className="m-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && (
                <>
                  {/* ── Timeline Tab ─────────────────────────── */}
                  {activeTab === 'timeline' && (
                    <div className="p-5">
                      {timelineEvents.length === 0 ? (
                        <div className="text-center text-steel-500 text-sm py-10">
                          {t('archive.history.noHistory')}
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Vertical line */}
                          <div className="absolute left-5 top-0 bottom-0 w-px bg-steel-700/50" />

                          <div className="space-y-6">
                            {timelineEvents.map((event, index) => {
                              const { icon: EventIcon, color, bg, label } = getEventStyle(event.action);
                              const isLast = index === timelineEvents.length - 1;

                              return (
                                <div key={event.id} className="flex gap-4 relative">
                                  {/* Icon */}
                                  <div
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 relative z-10 ${bg}`}
                                  >
                                    <EventIcon size={16} className={color} />
                                  </div>

                                  {/* Content */}
                                  <div className={`flex-1 pb-1 ${!isLast ? 'border-b border-steel-800/40' : ''}`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className={`text-sm font-semibold ${color}`}>
                                          {t(`archive.history.events.${label}`, event.action)}
                                        </p>
                                        {event.performer && (
                                          <p className="text-xs text-steel-400 flex items-center gap-1 mt-0.5">
                                            <User size={10} />
                                            {t('archive.history.by')} <span className="text-steel-300 font-medium">{event.performer}</span>
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-xs text-steel-400 font-mono">
                                          {formatDate(event.date)}
                                        </p>
                                        {event.revision && (
                                          <span className="text-[10px] text-steel-600 font-mono">
                                            Rev. {event.revision}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {event.reason && (
                                      <div className="mt-2 bg-steel-950/60 border border-steel-800/60 rounded-lg px-3 py-2">
                                        <p className="text-xs text-steel-400 leading-relaxed">{event.reason}</p>
                                      </div>
                                    )}

                                    {event.eco && (
                                      <div className="mt-1.5 flex items-center gap-1.5">
                                        <Hash size={11} className="text-indigo-400" />
                                        <span className="text-xs font-mono text-indigo-400">{event.eco}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Metadata Tab ──────────────────────────── */}
                  {activeTab === 'metadata' && (
                    <div className="p-5 space-y-4">
                      {/* Amber header card */}
                      <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield size={14} className="text-amber-400" />
                          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                            {t('archive.history.metadataFields.documentType')}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-steel-200">
                          Diagrama de Flujo de Proceso (FC)
                        </p>
                        <p className="text-xs text-steel-400 mt-0.5 font-mono">
                          #{flowchartId}
                        </p>
                      </div>

                      {archiveVersion && (
                        <div className="space-y-2">
                          {[
                            {
                              label: t('archive.history.metadataFields.docId'),
                              value: `#${archiveVersion.document_id}`,
                              mono: true,
                              icon: Hash,
                            },
                            {
                              label: t('archive.history.metadataFields.revision'),
                              value: `Rev. ${archiveVersion.revision_number}`,
                              mono: true,
                              icon: GitBranch,
                            },
                            {
                              label: t('archive.history.metadataFields.validFrom'),
                              value: formatDate(archiveVersion.original_creation_date),
                              mono: false,
                              icon: Calendar,
                            },
                            {
                              label: t('archive.history.metadataFields.archivedOn'),
                              value: formatDate(archiveVersion.created_at),
                              mono: false,
                              icon: Archive,
                            },
                            {
                              label: t('archive.history.metadataFields.approver'),
                              value: archiveVersion.creator?.full_name || `User #${archiveVersion.created_by}`,
                              mono: false,
                              icon: User,
                            },
                            ...(archiveVersion.snapshot_data?.eco_number
                              ? [{
                                  label: t('archive.history.metadataFields.ecoRef'),
                                  value: archiveVersion.snapshot_data.eco_number,
                                  mono: true,
                                  icon: FileText,
                                }]
                              : []),
                          ].map(({ label, value, mono, icon: Icon }) => (
                            <div
                              key={label}
                              className="flex items-center gap-3 py-2.5 px-3.5 bg-steel-950/50 rounded-lg border border-steel-800/60"
                            >
                              <Icon size={13} className="text-steel-500 shrink-0" />
                              <span className="text-xs text-steel-400 shrink-0">{label}</span>
                              <span className={`ml-auto text-xs font-medium text-steel-200 ${mono ? 'font-mono' : ''}`}>
                                {value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {archiveVersion?.change_reason && (
                        <div className="bg-steel-950/60 border border-steel-800 rounded-xl p-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-steel-500 mb-2 flex items-center gap-1">
                            <FileText size={10} />
                            {t('archive.history.reason')}
                          </p>
                          <p className="text-sm text-steel-300 leading-relaxed">
                            {archiveVersion.change_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Retention Tab ─────────────────────────── */}
                  {activeTab === 'retention' && (
                    <div className="p-5 space-y-4">
                      <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield size={14} className="text-indigo-400" />
                          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                            {t('archive.history.retentionFields.title')}
                          </p>
                        </div>
                        <p className="text-xs text-steel-400 leading-relaxed mt-2">
                          {t('archive.history.retentionFields.policy')}
                        </p>
                      </div>

                      {/* Retention Type Cards */}
                      {[
                        {
                          type: t('archive.history.retentionFields.productionDoc'),
                          policy: 'IATF 16949 — Vigencia en producción + 1 año',
                          color: 'amber',
                          minDate: archiveVersion?.original_creation_date
                            ? calcRetentionDate(archiveVersion.original_creation_date)
                            : '—',
                        },
                        {
                          type: t('archive.history.retentionFields.workInstruction'),
                          policy: 'Año en curso + 3 años fiscales',
                          color: 'indigo',
                          minDate: calcRetentionDate(new Date().toISOString()),
                        },
                      ].map(({ type, policy, color, minDate }) => (
                        <div
                          key={type}
                          className={`bg-${color}-500/8 border border-${color}-500/20 rounded-xl p-4 space-y-2`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-semibold text-${color}-400`}>{type}</p>
                            <ChevronRight size={13} className={`text-${color}-400/50`} />
                          </div>
                          <p className="text-xs text-steel-400">{policy}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <Calendar size={11} className="text-steel-500" />
                            <span className="text-[10px] text-steel-500">{t('archive.history.retentionFields.minimumUntil')}</span>
                            <span className={`text-xs font-mono font-semibold text-${color}-300 ml-auto`}>{minDate}</span>
                          </div>
                        </div>
                      ))}

                      {/* CSR Note */}
                      <div className="bg-steel-950/60 border border-steel-800 rounded-xl p-3 flex items-start gap-2">
                        <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-steel-400 leading-relaxed">
                          {t('archive.history.retentionFields.csr')}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
