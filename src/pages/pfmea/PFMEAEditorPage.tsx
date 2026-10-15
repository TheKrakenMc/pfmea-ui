import { ActionConfirmationTray } from '../../components/pfmea/ActionConfirmationTray';
import {useAuth} from '../../hooks/useAuth';
import { draftKey, loadDraft, saveDraft, discardDraft } from '../../services/drafts';
import { getErrorMessage } from '../../utils/errors';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertTriangle, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import { pfmeaService, type PfmeaHeaderUpdate, type WorksheetRow } from '../../api/pfmeaService';
import { getFlowchartById } from '../../services/flowchartService';
import { PFMEAMasterHeader } from '../../components/pfmea/PFMEAMasterHeader';
import { PFMEAWorksheetTable } from '../../components/pfmea/PFMEAWorksheetTable';
import { CorporateWorksheetTable } from '../../components/pfmea/CorporateWorksheetTable';
import { FormatSelectorToolbar, type FmeaLayoutType } from '../../components/pfmea/FormatSelectorToolbar';
import { MOCView } from '../../components/pfmea/MOCView';
import { MyTasksTray } from '../../components/pfmea/MyTasksTray';
import { toast } from 'sonner';

const normalizeVal = (val: unknown) => (val === undefined || val === null ? '' : String(val).trim());
const normalizeNum = (val: unknown) => (val === undefined || val === null || val === '' ? null : Number(val));

const areRowsEqual = (rowA: WorksheetRow, rowB: WorksheetRow): boolean => {
  if (normalizeNum(rowA.sequence_order) !== normalizeNum(rowB.sequence_order)) return false;
  if (normalizeVal(rowA.product_characteristic) !== normalizeVal(rowB.product_characteristic)) return false;
  if (normalizeVal(rowA.process_characteristic) !== normalizeVal(rowB.process_characteristic)) return false;
  if (normalizeVal(rowA.station_operation) !== normalizeVal(rowB.station_operation)) return false;
  if (normalizeNum(rowA.flowchart_step_id) !== normalizeNum(rowB.flowchart_step_id)) return false;
  if (normalizeVal(rowA.function_process_step) !== normalizeVal(rowB.function_process_step)) return false;
  if (normalizeVal(rowA.function_process_item_plant) !== normalizeVal(rowB.function_process_item_plant)) return false;
  if (normalizeVal(rowA.function_process_item_customer) !== normalizeVal(rowB.function_process_item_customer)) return false;
  if (normalizeVal(rowA.function_process_item_end_user) !== normalizeVal(rowB.function_process_item_end_user)) return false;
  if (normalizeVal(rowA.function_work_element) !== normalizeVal(rowB.function_work_element)) return false;
  if (normalizeVal(rowA.work_element_process) !== normalizeVal(rowB.work_element_process)) return false;
  if (normalizeVal(rowA.failure_mode) !== normalizeVal(rowB.failure_mode)) return false;
  if (normalizeVal(rowA.failure_effect_plant) !== normalizeVal(rowB.failure_effect_plant)) return false;
  if (normalizeVal(rowA.failure_effect_customer) !== normalizeVal(rowB.failure_effect_customer)) return false;
  if (normalizeVal(rowA.failure_effect_end_user) !== normalizeVal(rowB.failure_effect_end_user)) return false;
  if (normalizeNum(rowA.severity) !== normalizeNum(rowB.severity)) return false;
  if (normalizeVal(rowA.failure_cause) !== normalizeVal(rowB.failure_cause)) return false;
  if (normalizeNum(rowA.occurrence) !== normalizeNum(rowB.occurrence)) return false;
  if (normalizeVal(rowA.prevention_controls) !== normalizeVal(rowB.prevention_controls)) return false;
  if (normalizeVal(rowA.detection_controls) !== normalizeVal(rowB.detection_controls)) return false;
  if (normalizeNum(rowA.detection) !== normalizeNum(rowB.detection)) return false;
  if (normalizeVal(rowA.action_priority) !== normalizeVal(rowB.action_priority)) return false;
  if (normalizeVal(rowA.special_characteristics) !== normalizeVal(rowB.special_characteristics)) return false;
  if (normalizeVal(rowA.optimization_prevention_action) !== normalizeVal(rowB.optimization_prevention_action)) return false;
  if (normalizeVal(rowA.optimization_detection_action) !== normalizeVal(rowB.optimization_detection_action)) return false;
  if (normalizeNum(rowA.responsible_person_id) !== normalizeNum(rowB.responsible_person_id)) return false;
  if (normalizeVal(rowA.responsible_person_name) !== normalizeVal(rowB.responsible_person_name)) return false;
  if (normalizeVal(rowA.target_completion_date) !== normalizeVal(rowB.target_completion_date)) return false;
  if (normalizeVal(rowA.action_status) !== normalizeVal(rowB.action_status)) return false;
  if (normalizeVal(rowA.actions_taken) !== normalizeVal(rowB.actions_taken)) return false;
  if (normalizeVal(rowA.completion_date) !== normalizeVal(rowB.completion_date)) return false;
  if (normalizeNum(rowA.new_severity) !== normalizeNum(rowB.new_severity)) return false;
  if (normalizeNum(rowA.new_occurrence) !== normalizeNum(rowB.new_occurrence)) return false;
  if (normalizeNum(rowA.new_detection) !== normalizeNum(rowB.new_detection)) return false;
  if (normalizeVal(rowA.new_action_priority) !== normalizeVal(rowB.new_action_priority)) return false;
  return true;
};

const hasWorksheetChanges = (currentRows: WorksheetRow[], originalRows: WorksheetRow[]): boolean => {
  if (currentRows.length !== originalRows.length) return true;
  for (let i = 0; i < currentRows.length; i++) {
    const cur = currentRows[i];
    if (cur.id < 0) return true;
    const orig = originalRows[i];
    if (!orig || !areRowsEqual(cur, orig)) return true;
  }
  return false;
};

export const PFMEAEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [activeTab] = useState<'tasks' | 'worksheet' | 'moc'>('worksheet');
  const [currentLayout, setCurrentLayout] = useState<FmeaLayoutType>('AIAG_APG');
  const [localHeader, setLocalHeader] = useState<PfmeaHeaderUpdate | null>(null);
  const [isHeaderDirty, setIsHeaderDirty] = useState(false);
  const [editedRows, setLocalRows] = useState<WorksheetRow[] | null>(null);
  const [isWorksheetDirty, setIsWorksheetDirty] = useState(false);

  const pfmeaId = id ? Number(id) : null;
  const { user } = useAuth();
  const draftStorageKey = user && pfmeaId ? draftKey(user.id,user.plant_id,"pfmea",pfmeaId) : null;
  const [pendingDraft, setPendingDraft] = useState(() => !!(draftStorageKey && loadDraft(draftStorageKey)));
  const [draftRevision, setDraftRevision] = useState<number | null>(null);
  const [savingAtomic, setSavingAtomic] = useState(false);

  // Queries
  const { data: pfmeaDetail, isLoading: isLoadingDetail, error } = useQuery({
    queryKey: ['pfmea', pfmeaId],
    queryFn: () => pfmeaService.getAnalysis(pfmeaId!),
    enabled: !!pfmeaId,
    refetchOnWindowFocus: false,
  });

  const localRows = React.useMemo(() => editedRows ?? pfmeaDetail?.worksheet_rows ?? [], [editedRows,pfmeaDetail?.worksheet_rows]);

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

  const handleHeaderLocalChange = React.useCallback((data: PfmeaHeaderUpdate, dirty: boolean) => {
    setLocalHeader(data);
    setIsHeaderDirty(dirty);
    if (dirty) setDraftRevision(previous => previous || pfmeaDetail?.lock_version || null);
  }, [pfmeaDetail?.lock_version]);

  const isReadOnly = !['Administrator','PFMEA Owner','Team Member'].includes(user?.role_name || '') || !!pfmeaDetail?.team_members.some(m=>m.user_id===Number(user?.id)&&m.role_in_team==='Viewer'&&user?.role_name!=='Administrator') || !!pfmeaDetail && ['Approved','Archived'].includes(pfmeaDetail.moc_status);

  const canManage=user?.role_name==='Administrator' || user?.role_name==='PFMEA Owner' && (pfmeaDetail?.owner_id===Number(user.id) || !!pfmeaDetail?.team_members.some(m=>m.user_id===Number(user.id)&&m.role_in_team==='PFMEA Owner'));

  const mergedHeader = React.useMemo(() => {
    if (!pfmeaDetail) return null;
    return { ...pfmeaDetail, ...(localHeader || {}) };
  }, [pfmeaDetail, localHeader]);

  useEffect(() => {
    if (!draftStorageKey || !pfmeaDetail || (!isWorksheetDirty && !isHeaderDirty)) return;
    const timer = setTimeout(() => { if (!saveDraft(draftStorageKey, draftRevision || pfmeaDetail.lock_version, { rows: localRows, header: isHeaderDirty ? localHeader : null })) toast.error('No se pudo guardar el borrador local. Guarda el documento en el servidor.'); }, 1000);
    return () => clearTimeout(timer);
  }, [draftStorageKey, pfmeaDetail, isWorksheetDirty, isHeaderDirty, localRows, localHeader, draftRevision]);

  const handleRowsChange = useCallback((rows: WorksheetRow[]) => {
    setLocalRows(rows);
    setIsWorksheetDirty(true);
    setDraftRevision(previous => previous || pfmeaDetail?.lock_version || null);
  }, [pfmeaDetail?.lock_version]);


  const worksheetHasChanges = isWorksheetDirty || hasWorksheetChanges(localRows, pfmeaDetail?.worksheet_rows || []);
  const hasUnsavedChanges = isHeaderDirty || worksheetHasChanges;

  const handleSaveAllGlobal = useCallback(async (rowsToSave = localRows) => {
    try {
      if (!pfmeaDetail || !pfmeaId) return;
      setSavingAtomic(true);
      const retained = new Set(rowsToSave.filter(r => r.id > 0).map(r => r.id));
      const deleted = pfmeaDetail.worksheet_rows.filter(r => !retained.has(r.id)).map(r => r.id);
      const originals=new Map(pfmeaDetail.worksheet_rows.map(row=>[row.id,row]));
      const changedRows=rowsToSave.filter(row=>row.id<0 || !originals.has(row.id) || !areRowsEqual(row,originals.get(row.id)!));
      const saved = await pfmeaService.saveDocument(pfmeaId, {
        expected_version: draftRevision || pfmeaDetail.lock_version,
        header: isHeaderDirty && localHeader ? localHeader : undefined,
        rows: changedRows,
        deleted_row_ids: deleted,
        new_status: isHeaderDirty && localHeader?.moc_status !== pfmeaDetail.moc_status ? localHeader?.moc_status : undefined,
      });
      setIsHeaderDirty(false);
      setIsWorksheetDirty(false);
      setLocalHeader(null);
      setLocalRows(null);
      queryClient.setQueryData(['pfmea', pfmeaId], saved);
      if (draftStorageKey) discardDraft(draftStorageKey);
      setPendingDraft(false);
      setDraftRevision(null);
      toast.success('Documento guardado en el servidor');
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se guardó el documento. Tu borrador se conserva.'));
    } finally {
      setSavingAtomic(false);
    }
  }, [localRows, isHeaderDirty, localHeader, pfmeaDetail, pfmeaId, draftRevision, draftStorageKey, queryClient]);

  const isSaving = savingAtomic;

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
      className="flex flex-col w-full min-h-full pb-36"
    >
      <div className="flex-1 flex flex-col p-6 pt-4 gap-5">
        {/* Main Content Area */}
        <div className={`flex-1 ${activeTab === 'worksheet' ? 'flex flex-col pb-16' : 'overflow-y-auto custom-scrollbar pr-2 pb-16'}`}>
          {activeTab === 'worksheet' && pfmeaDetail && (
            <div className="flex flex-col gap-5 flex-1 animate-fade-in pb-8">
              {/* Consolidated Unified Header & Multi-layout Toolbar */}
              <FormatSelectorToolbar
                currentLayout={currentLayout}
                onChangeLayout={setCurrentLayout}
                flowchartId={pfmeaDetail.flowchart_id}
                pfmeaId={pfmeaId!}
                docId={pfmeaDetail.pfmea_id_number || `#${pfmeaId}`}
                projectName={pfmeaDetail.project_name}
                isReadOnly={isReadOnly}
                isHeaderDirty={hasUnsavedChanges}
                onBack={() => navigate('/pfmea')}
                header={mergedHeader!}
                rows={localRows}
                productData={flowchartDetail?.product}
              />

              <div className="shrink-0">
          {pendingDraft && draftStorageKey && <div role="status" className="p-3 bg-amber-100 dark:bg-amber-950 rounded-lg">
            Borrador local disponible.
            <button className="mx-3 underline" onClick={() => { const draft=loadDraft<{rows:WorksheetRow[];header:PfmeaHeaderUpdate|null}>(draftStorageKey); if(draft){setLocalRows(draft.data.rows);setLocalHeader(draft.data.header);setDraftRevision(draft.expectedVersion);setIsWorksheetDirty(true);setIsHeaderDirty(!!draft.data.header);}setPendingDraft(false); }}>Recuperar</button>
            <button className="underline" onClick={() => {discardDraft(draftStorageKey);setPendingDraft(false);}}>Descartar</button>
          </div>}

          {pfmeaDetail.needs_review && <p role="status" className="rounded-lg bg-amber-100 dark:bg-amber-950 p-3">Este documento histórico requiere revisión de sus acciones y evidencias antes de una nueva aprobación.</p>}
          {!isReadOnly && canManage && <ActionConfirmationTray id={pfmeaId} version={pfmeaDetail.lock_version} rows={localRows} dirty={hasUnsavedChanges} onConfirmed={()=>queryClient.invalidateQueries({queryKey:['pfmea',pfmeaId]})} />}

                <PFMEAMasterHeader
                  header={mergedHeader!}
                  currentLayout={currentLayout}
                  onLocalChange={handleHeaderLocalChange}
                  readOnly={isReadOnly}
                  isLoading={isSaving}
                  rows={localRows}
                  flowchartSteps={flowchartDetail?.steps || []}
                />
              </div>

              {currentLayout === 'AIAG_APG' ? (
                <CorporateWorksheetTable
                  pfmeaId={pfmeaId!}
                  partNumber={pfmeaDetail?.part_number || ''}
                  flowchartSteps={flowchartDetail?.steps || []}
                  rows={localRows}
                  onRowsChange={handleRowsChange}
                  onSaveAll={handleSaveAllGlobal}
                  header={mergedHeader!}
                  productData={flowchartDetail?.product}
                  isHeaderDirty={hasUnsavedChanges}
                  isReadOnly={isReadOnly || isSaving}
                  isSaving={isSaving}
                />
              ) : (
                <PFMEAWorksheetTable
                  pfmeaId={pfmeaId!}
                  partNumber={pfmeaDetail?.part_number || ''}
                  flowchartSteps={flowchartDetail?.steps || []}
                  rows={localRows}
                  onRowsChange={handleRowsChange}
                  onSaveAll={handleSaveAllGlobal}
                  header={mergedHeader!}
                  productData={flowchartDetail?.product}
                  isHeaderDirty={hasUnsavedChanges}
                  isReadOnly={isReadOnly || isSaving}
                  isSaving={isSaving}
                />
              )}
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

      {/* Floating Action Buttons Fixed on Viewport */}
      {activeTab === 'worksheet' && !isReadOnly && (
        <motion.div
          className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {/* Unsaved Changes Indicator */}
          {hasUnsavedChanges && (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex items-center gap-2 rounded-full border border-amber-300 dark:border-amber-600/40 bg-amber-100/95 dark:bg-amber-950/90 px-4 py-1.5 text-xs backdrop-blur-md shadow-lg"
            >
              <AlertCircle size={14} className="text-amber-700 dark:text-amber-400" />
              <span className="text-amber-800 dark:text-amber-300 font-semibold">
                {t('actions.unsavedChanges', 'Cambios sin guardar en base de datos')}
              </span>
            </motion.div>
          )}

          {/* Save Changes Button */}
          <motion.button
            onClick={() => handleSaveAllGlobal(localRows)}
            disabled={isSaving || !hasUnsavedChanges}
            type="button"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/25 transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : !hasUnsavedChanges ? (
              <CheckCircle2 size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>
              {isSaving
                ? t('common.saving', 'Guardando...')
                : !hasUnsavedChanges
                ? t('common.saved', 'Guardado')
                : t('common.saveChanges', 'Guardar Cambios')}
            </span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};
