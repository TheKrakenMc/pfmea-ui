import type { PfmeaHeader, WorksheetRow } from '../../api/pfmeaService';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layers, FileSpreadsheet, Sparkles, FileDown, Loader2, ArrowLeft } from 'lucide-react';
import { ExportPfmeaButton } from './ExportPfmeaButton';

export type FmeaLayoutType = 'AIAG_VDA' | 'AIAG_APG';

interface FormatSelectorToolbarProps {
  currentLayout: FmeaLayoutType;
  onChangeLayout: (layout: FmeaLayoutType) => void;
  flowchartId?: number;
  pfmeaId?: number;
  onExportPdf?: (layout: FmeaLayoutType) => void;
  isExporting?: boolean;
  docId?: string;
  projectName?: string;
  isReadOnly?: boolean;
  isHeaderDirty?: boolean;
  onBack?: () => void;
  header?: PfmeaHeader;
  rows?: WorksheetRow[];
  productData?: {description?: string | null};
  exportButton?: React.ReactNode;
}

export const FormatSelectorToolbar: React.FC<FormatSelectorToolbarProps> = ({
  currentLayout,
  onChangeLayout,
  onExportPdf,
  isExporting = false,
  docId,
  projectName,
  isReadOnly = false,
  isHeaderDirty = false,
  onBack,
  header,
  rows,
  productData,
  exportButton,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/pfmea');
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-steel-900/90 border border-slate-200 dark:border-steel-700/60 rounded-xl px-4 py-2.5 backdrop-blur-md shadow-md">
      {/* Left: Document Metadata & Navigation */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="p-1.5 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-steel-800 rounded-lg transition-colors group cursor-pointer"
          title={t('common.back', 'Volver')}
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {docId && (
          <>
            <div className="h-5 w-px bg-slate-200 dark:bg-steel-700/60" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 dark:text-steel-400 uppercase font-semibold tracking-wider leading-none">
                {t('pfmea.editor.docId', 'DOCUMENT ID')}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-steel-100 leading-tight mt-0.5">
                {docId}
              </span>
            </div>
          </>
        )}

        {projectName && (
          <>
            <div className="h-5 w-px bg-slate-200 dark:bg-steel-700/60" />
            <span className="text-xs font-medium text-slate-700 dark:text-steel-300 truncate max-w-[180px] lg:max-w-xs" title={projectName}>
              {projectName}
            </span>
          </>
        )}
      </div>

      {/* Center: Layout Switchers (AIAG & VDA vs AIAG APG) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-steel-300 mr-1.5 flex items-center gap-1.5">
          <Layers size={14} className="text-forge-600 dark:text-forge-400" />
          {t('pfmea.layout.view', 'Vista:')}
        </span>

        {/* AIAG & VDA button */}
        <button
          type="button"
          aria-pressed={currentLayout==='AIAG_VDA'} onClick={() => onChangeLayout('AIAG_VDA')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentLayout === 'AIAG_VDA'
              ? 'bg-forge-600 text-white shadow-md shadow-forge-600/30'
              : 'bg-slate-100 dark:bg-steel-800/80 text-slate-700 dark:text-steel-300 hover:bg-slate-200 dark:hover:bg-steel-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-steel-700/40'
          }`}
          title={t('pfmea.layout.aiagVdaTooltip', 'Vista 7 Pasos Armonizada AIAG & VDA (2019)')}
        >
          <Sparkles size={13} className={currentLayout === 'AIAG_VDA' ? 'text-white' : 'text-forge-500 dark:text-forge-400'} />
          {t('pfmea.layout.aiagVda', 'AIAG & VDA')}
        </button>

        {/* AIAG APG Traditional button */}
        <button
          type="button"
          aria-pressed={currentLayout==='AIAG_APG'} onClick={() => onChangeLayout('AIAG_APG')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            currentLayout === 'AIAG_APG'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-100 dark:bg-steel-800/80 text-slate-700 dark:text-steel-300 hover:bg-slate-200 dark:hover:bg-steel-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-steel-700/40'
          }`}
          title={t('pfmea.layout.aiagApgTooltip', 'Vista Tabular Adler Pelzer Group (AIAG 4ta Edición)')}
        >
          <FileSpreadsheet size={13} className={currentLayout === 'AIAG_APG' ? 'text-white' : 'text-blue-500 dark:text-blue-400'} />
          {t('pfmea.layout.aiagApg', 'AIAG (APG)')}
        </button>
      </div>

      {/* Right: PDF Export Action & Status Badges */}
      <div className="flex items-center gap-2.5">
        {exportButton ? (
          exportButton
        ) : header && rows ? (
          <ExportPfmeaButton
            header={header}
            rows={rows}
            productData={productData}
            layout={currentLayout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-steel-800 text-slate-800 dark:text-steel-100 hover:bg-slate-200 dark:hover:bg-steel-700 border border-slate-200 dark:border-steel-700/60 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : onExportPdf ? (
          <button
            type="button"
            onClick={() => onExportPdf(currentLayout)}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-steel-800 text-slate-800 dark:text-steel-100 hover:bg-slate-200 dark:hover:bg-steel-700 border border-slate-200 dark:border-steel-700/60 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span>
              {currentLayout === 'AIAG_APG'
                ? t('pfmea.layout.exportApg', 'Exportar PDF (APG AIAG)')
                : t('pfmea.layout.exportVda', 'Exportar PDF (AIAG & VDA)')}
            </span>
          </button>
        ) : null}

        {!isReadOnly && isHeaderDirty && (
          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-2 py-1 rounded-md shadow-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
              {t('common.localDraft', 'Borrador Local')}
            </span>
          </div>
        )}

        <span className="px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-500 text-amber-950 border-amber-600 shadow-xs">
          {t('pfmea.editor.inEdition', 'En Edición')}
        </span>
      </div>
    </div>
  );
};
