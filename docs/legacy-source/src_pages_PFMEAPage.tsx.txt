import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pfmeaService, type PfmeaHeaderUpdate, type WorksheetRowUpdate } from '../api/pfmeaService';
import { GlobalHeader } from '../components/pfmea/GlobalHeader';
import { PFMEAWorksheetTable } from '../components/pfmea/PFMEAWorksheetTable';
import { MOCView } from '../components/pfmea/MOCView';
import { MyTasksTray } from '../components/pfmea/MyTasksTray';
import { toast } from 'sonner';
import { FileText, CheckSquare, History, Plus } from 'lucide-react';

const PFMEAPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tasks' | 'worksheet' | 'moc'>('worksheet');
  const [selectedPfmeaId, setSelectedPfmeaId] = useState<number | null>(null);

  // Queries
  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery({
    queryKey: ['pfmea', 'analyses'],
    queryFn: () => pfmeaService.listAnalyses(),
  });

  const { data: pfmeaDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['pfmea', selectedPfmeaId],
    queryFn: () => pfmeaService.getAnalysis(selectedPfmeaId!),
    enabled: !!selectedPfmeaId,
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['pfmea', 'tasks'],
    queryFn: () => pfmeaService.getMyTasks(),
  });

  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['pfmea', selectedPfmeaId, 'audit'],
    queryFn: () => pfmeaService.getAuditLog(selectedPfmeaId!),
    enabled: !!selectedPfmeaId && activeTab === 'moc',
  });

  // Select first analysis by default if none selected
  useEffect(() => {
    if (analyses && analyses.length > 0 && !selectedPfmeaId) {
      setSelectedPfmeaId(analyses[0].id);
    }
  }, [analyses, selectedPfmeaId]);

  // Mutations
  const updateHeaderMutation = useMutation({
    mutationFn: (data: PfmeaHeaderUpdate) => pfmeaService.updateAnalysis(selectedPfmeaId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pfmea', selectedPfmeaId] });
      toast.success('Cabecera actualizada correctamente');
    },
    onError: () => toast.error('Error al actualizar la cabecera'),
  });

  const updateRowMutation = useMutation({
    mutationFn: ({ rowId, data }: { rowId: number; data: WorksheetRowUpdate }) =>
      pfmeaService.updateWorksheetRow(selectedPfmeaId!, rowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pfmea', selectedPfmeaId] });
      toast.success('Fila actualizada correctamente');
    },
    onError: () => toast.error('Error al actualizar la fila'),
  });

  const createAnalysisMutation = useMutation({
    mutationFn: () => pfmeaService.createAnalysis({
      flowchart_id: 1, // Mock flowchart ID
      project_name: 'Nuevo Proyecto PFMEA',
      customer: 'Cliente por Defecto'
    }),
    onSuccess: (newPfmea) => {
      queryClient.invalidateQueries({ queryKey: ['pfmea', 'analyses'] });
      setSelectedPfmeaId(newPfmea.id);
      toast.success('Proyecto PFMEA creado');
    }
  });

  const handleUpdateHeader = (data: PfmeaHeaderUpdate) => {
    updateHeaderMutation.mutate(data);
  };

  const handleUpdateRow = (rowId: number, data: WorksheetRowUpdate) => {
    updateRowMutation.mutate({ rowId, data });
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-6 max-h-screen overflow-hidden">
      
      {/* Top Bar with Project Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-steel-100 flex items-center gap-2">
          {t('navbar.pfmea')}
          <span className="text-sm font-normal text-steel-400 bg-steel-800/50 px-2 py-0.5 rounded border border-steel-700/50">
            VDA & AIAG (2019)
          </span>
        </h1>

        <div className="flex items-center gap-4">
          <select
            className="bg-steel-900/80 border border-steel-700/50 rounded-lg px-4 py-2 text-sm text-steel-200 focus:outline-none focus:border-forge-500"
            value={selectedPfmeaId || ''}
            onChange={(e) => setSelectedPfmeaId(Number(e.target.value))}
            disabled={isLoadingAnalyses}
          >
            <option value="" disabled>Seleccione un proyecto...</option>
            {analyses?.map(a => (
              <option key={a.id} value={a.id}>{a.project_name} ({a.pfmea_id_number || `ID: ${a.id}`})</option>
            ))}
          </select>

          <button 
            onClick={() => createAnalysisMutation.mutate()}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus size={16} />
            Nuevo Análisis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-steel-700/50 pb-px">
        <button
          onClick={() => setActiveTab('worksheet')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'worksheet' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          <FileText size={16} />
          Hoja de Trabajo
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'tasks' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          <CheckSquare size={16} />
          Mis Tareas
          {tasks && tasks.length > 0 && (
            <span className="bg-forge-500/20 text-forge-400 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {tasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('moc')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'moc' ? 'border-forge-500 text-forge-400' : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          <History size={16} />
          MOC (Control de Cambios)
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {activeTab === 'worksheet' && pfmeaDetail && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <GlobalHeader 
              header={pfmeaDetail} 
              onUpdate={handleUpdateHeader} 
              isLoading={updateHeaderMutation.isPending} 
            />
            <PFMEAWorksheetTable 
              rows={pfmeaDetail.worksheet_rows || []} 
              onRowUpdate={handleUpdateRow} 
              isReadOnly={pfmeaDetail.moc_status === 'Approved' || pfmeaDetail.moc_status === 'Archived'} 
            />
          </div>
        )}

        {activeTab === 'worksheet' && isLoadingDetail && (
          <div className="flex items-center justify-center h-64 text-steel-400">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-forge-500/20 border-t-forge-500 rounded-full animate-spin"></div>
              <span>{t('pfmea.loading.analysis', 'Cargando análisis PFMEA...')}</span>
            </div>
          </div>
        )}

        {activeTab === 'worksheet' && !pfmeaDetail && !isLoadingDetail && (
          <div className="flex items-center justify-center h-64 text-steel-400">
            Selecciona o crea un proyecto PFMEA para comenzar.
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="animate-fade-in">
            {isLoadingTasks ? (
               <div className="flex items-center justify-center h-64 text-steel-400">{t('pfmea.loading.tasks', 'Cargando tareas...')}</div>
            ) : (
              <MyTasksTray tasks={tasks || []} />
            )}
          </div>
        )}

        {activeTab === 'moc' && selectedPfmeaId && (
          <div className="animate-fade-in">
            {isLoadingLogs ? (
               <div className="flex items-center justify-center h-64 text-steel-400">{t('pfmea.loading.history', 'Cargando historial...')}</div>
            ) : (
              <MOCView logs={auditLogs || []} />
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default PFMEAPage;
