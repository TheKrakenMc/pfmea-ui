import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertTriangle, FileText, CheckSquare, History } from 'lucide-react';
import { pfmeaService, type PfmeaHeaderUpdate, type WorksheetRowUpdate } from '../../api/pfmeaService';
import { getFlowchartById } from '../../services/flowchartService';
import { GlobalHeader } from '../../components/pfmea/GlobalHeader';
import { PFMEAWorksheetTable } from '../../components/pfmea/PFMEAWorksheetTable';
import { MOCView } from '../../components/pfmea/MOCView';
import { MyTasksTray } from '../../components/pfmea/MyTasksTray';
import { ExportPfmeaButton } from '../../components/pfmea/ExportPfmeaButton';
import { toast } from 'sonner';

export const PFMEAEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'tasks' | 'worksheet' | 'moc'>('worksheet');
  const [localHeader, setLocalHeader] = useState<PfmeaHeaderUpdate | null>(null);
  const [isHeaderDirty, setIsHeaderDirty] = useState(false);

  const pfmeaId = id ? Number(id) : null;

  // Queries
  const { data: pfmeaDetail, isLoading: isLoadingDetail, error } = useQuery({
    queryKey: ['pfmea', pfmeaId],
    queryFn: () => pfmeaService.getAnalysis(pfmeaId!),
    enabled: !!pfmeaId,
  });

  const { data: flowchartDetail } = useQuery({
    queryKey: ['flowchart', pfmeaDetail?.flowchart_id],
    queryFn: () => getFlowchartById(pfmeaDetail!.flowchart_id!),
    enabled: !!pfmeaDetail?.flowchart_id,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['pfmea', 'tasks'],
    queryFn: () => pfmeaService.getMyTasks(),
  });

  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['pfmea', pfmeaId, 'audit'],
    queryFn: () => pfmeaService.getAuditLog(pfmeaId!),
    enabled: !!pfmeaId && activeTab === 'moc',
  });

  // Mutations
  const updateHeaderMutation = useMutation({
    mutationFn: (data: PfmeaHeaderUpdate) => pfmeaService.updateAnalysis(pfmeaId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pfmea', pfmeaId] });
      toast.success(t('pfmea.editor.success.headerUpdated'));
    },
    onError: () => toast.error(t('pfmea.editor.error.headerUpdate')),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: WorksheetRowUpdate[]) => pfmeaService.bulkUpdateWorksheet(pfmeaId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pfmea', pfmeaId] });
      toast.success(t('pfmea.editor.success.worksheetSaved'));
    },
    onError: () => toast.error(t('pfmea.editor.error.worksheetSave')),
  });

  const transitionStatusMutation = useMutation({
    mutationFn: (newStatus: string) => pfmeaService.transitionStatus(pfmeaId!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pfmea', pfmeaId] });
      toast.success(t('pfmea.editor.success.statusChanged', 'Estado actualizado'));
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || t('pfmea.editor.error.statusChange', 'Error al cambiar el estado')),
  });

  const handleUpdateHeader = (data: PfmeaHeaderUpdate) => {
    updateHeaderMutation.mutate(data);
  };

  const handleHeaderLocalChange = React.useCallback((data: PfmeaHeaderUpdate, dirty: boolean) => {
    setLocalHeader(data);
    setIsHeaderDirty(dirty);
  }, []);

  const isReadOnly = pfmeaDetail ? (pfmeaDetail.moc_status === 'Approved' || pfmeaDetail.moc_status === 'Archived') : false;

  if (!pfmeaId || isNaN(pfmeaId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('pfmea.editor.invalidId')}</h2>
        <button
          onClick={() => navigate('/pfmea')}
          className="mt-8 flex items-center gap-2 bg-steel-800 hover:bg-steel-700 text-white px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('pfmea.editor.backToInventory')}
        </button>
      </div>
    );
  }

  if (isLoadingDetail) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-steel-400 text-sm">{t('pfmea.editor.loadingProject')}</p>
      </motion.div>
    );
  }

  if (error || !pfmeaDetail) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('pfmea.editor.docNotFound')}</h2>
        <p className="text-steel-400 max-w-md mb-8">{t('pfmea.editor.docNotFoundDesc')}</p>
        <button
          onClick={() => navigate('/pfmea')}
          className="flex items-center gap-2 bg-steel-800 hover:bg-steel-700 text-white px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('pfmea.editor.backToInventory')}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full min-h-0 overflow-hidden"
    >
      {/* Top Bar Navigation */}
      <div className="bg-steel-950/80 backdrop-blur-md border-b border-steel-800 px-6 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/pfmea')}
            className="p-2 text-steel-400 hover:text-white hover:bg-steel-800 rounded-lg transition-colors group cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="h-6 w-px bg-steel-800"></div>
          <div className="flex flex-col">
            <span className="text-xs text-steel-400 uppercase font-semibold tracking-wider">{t('pfmea.editor.docId')}</span>
            <span className="font-mono font-medium">{pfmeaDetail.pfmea_id_number || `#${pfmeaId}`}</span>
          </div>
          <div className="h-6 w-px bg-steel-800"></div>
          <span className="text-steel-300 text-sm font-medium truncate max-w-xs">{pfmeaDetail.project_name}</span>
          {!isReadOnly && isHeaderDirty && (
            <>
              <div className="h-6 w-px bg-steel-800"></div>
              <div className="flex items-center gap-2 bg-amber-500 text-amber-950 border border-amber-600 px-2 py-0.5 rounded shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-950 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-900"></span>
                </span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-950 leading-none">
                    {t('common.localDraft', 'Borrador Local')}
                  </span>
                  <span className="text-[7px] text-amber-900/80 leading-none mt-0.5 font-medium">
                    {t('common.localDraftDescShort', 'Guardado en navegador')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
           <span className="px-3 py-1 rounded-full text-xs font-bold border bg-amber-500 text-amber-950 border-amber-600 shadow-sm">
             {t('pfmea.editor.inEdition')}
           </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-steel-700/50 pb-px shrink-0">
          <button
            onClick={() => setActiveTab('worksheet')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 cursor-pointer ${
              activeTab === 'worksheet' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
            }`}
          >
            <FileText size={16} />
            {t('pfmea.editor.tabs.worksheet')}
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 cursor-pointer ${
              activeTab === 'tasks' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
            }`}
          >
            <CheckSquare size={16} />
            {t('pfmea.editor.tabs.myTasks')}
            {tasks && tasks.length > 0 && (
              <span className="bg-forge-500/20 text-forge-400 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {tasks.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('moc')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 cursor-pointer ${
              activeTab === 'moc' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
            }`}
          >
            <History size={16} />
            {t('pfmea.editor.tabs.moc')}
          </button>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 ${activeTab === 'worksheet' ? 'flex flex-col min-h-0 pr-2' : 'overflow-y-auto custom-scrollbar pr-2 pb-10'}`}>
          {activeTab === 'worksheet' && pfmeaDetail && (
            <div className="flex flex-col gap-4 flex-1 min-h-0 animate-fade-in pb-2">
              <div className="shrink-0">
                <GlobalHeader 
                  header={pfmeaDetail} 
                  onUpdate={handleUpdateHeader}
                  onLocalChange={handleHeaderLocalChange}
                  isLoading={updateHeaderMutation.isPending} 
                />
              </div>
              <PFMEAWorksheetTable 
                pfmeaId={pfmeaId!}
                partNumber={pfmeaDetail?.part_number || ''}
                flowchartSteps={flowchartDetail?.steps || []}
                rows={pfmeaDetail.worksheet_rows || []} 
                header={{ ...pfmeaDetail, ...(localHeader || {}) } as any}
                productData={flowchartDetail?.product}
                isHeaderDirty={isHeaderDirty}
                onSaveAll={(rows) => {
                  if (isHeaderDirty && localHeader) {
                    if (localHeader.moc_status && localHeader.moc_status !== pfmeaDetail.moc_status) {
                      transitionStatusMutation.mutate(localHeader.moc_status);
                    }
                    handleUpdateHeader(localHeader);
                    setIsHeaderDirty(false);
                  }
                  if (JSON.stringify(rows) !== JSON.stringify(pfmeaDetail.worksheet_rows)) {
                    bulkUpdateMutation.mutate(rows);
                  }
                }} 
                isReadOnly={isReadOnly} 
                isSaving={bulkUpdateMutation.isPending || updateHeaderMutation.isPending || transitionStatusMutation.isPending}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="animate-fade-in">
              {isLoadingTasks ? (
                <div className="flex items-center justify-center h-64 text-steel-400">{t('pfmea.editor.loadingTasks')}</div>
              ) : (
                <MyTasksTray tasks={tasks || []} />
              )}
            </div>
          )}

          {activeTab === 'moc' && pfmeaId && (
            <div className="animate-fade-in">
              {isLoadingLogs ? (
                <div className="flex items-center justify-center h-64 text-steel-400">{t('pfmea.editor.loadingHistory')}</div>
              ) : (
                <MOCView logs={auditLogs || []} />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
