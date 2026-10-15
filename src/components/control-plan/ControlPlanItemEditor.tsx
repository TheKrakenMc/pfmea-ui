import { useQuery } from '@tanstack/react-query';
import { userService } from '../../api/userService';
import { getMeasurementUnits } from '../../services/measurementUnits';
import { useState } from 'react';
import { controlPlanService, type ControlPlanItem, type ControlPlanItemUpdate } from '../../api/controlPlanService';
import { toast } from 'sonner';

export function ControlPlanItemEditor({ item, version, readOnly, canReview, allowedResponsibleIds, onSaved }: { item: ControlPlanItem; version: number; readOnly: boolean; canReview: boolean; allowedResponsibleIds:number[]; onSaved: () => void }) {
  const [values, setValues] = useState<ControlPlanItemUpdate>({ characteristic: item.characteristic, classification: item.classification,
    specification: item.specification, measurement_method: item.measurement_method, sample_size: item.sample_size,
    sample_frequency: item.sample_frequency, responsible_person_id: item.responsible_person_id, reaction_plan: item.reaction_plan, unit_id: item.unit_id });
  const [reviewReason,setReviewReason]=useState('');
  const [saving, setSaving] = useState(false);
  const { data: users = [] } = useQuery({queryKey:['users','lookup'],queryFn:userService.lookup});
  const { data: units = [] } = useQuery({queryKey:['measurement-units'],queryFn:getMeasurementUnits});
  const fields = [{ key: 'characteristic', label: 'Característica' }, { key: 'specification', label: 'Especificación' },
    { key: 'measurement_method', label: 'Método de medición' }, { key: 'sample_frequency', label: 'Frecuencia de muestra' },
    { key: 'reaction_plan', label: 'Plan de reacción' }] as const;
  return <form className="space-y-3 p-4 border border-steel-700 rounded-xl" onSubmit={async e => {
    e.preventDefault(); setSaving(true);
    try { await controlPlanService.updateItem(item.id, values, version); toast.success('Control guardado'); onSaved(); }
    catch { toast.error('No se guardó el control. Revisa permisos, datos y revisión del documento.'); }
    finally { setSaving(false); }
  }}>
    <h3 className="font-semibold">{item.item_name}</h3>
    {item.needs_review && <p role="status" className="text-amber-400">El vínculo de origen requiere revisión.</p>}
    <div className="grid sm:grid-cols-2 gap-3">
      {fields.map(f => <label key={f.key} className="text-xs">{f.label}<input disabled={readOnly} value={values[f.key] || ''} onChange={e => setValues({ ...values, [f.key]: e.target.value })} className="block w-full rounded bg-steel-950 border border-steel-700 p-2" /></label>)}
      <label className="text-xs">Clasificación<select disabled={readOnly} value={values.classification || ''} onChange={e => setValues({ ...values, classification: e.target.value === 'CC' ? 'CC' : e.target.value === 'SC' ? 'SC' : null })} className="block w-full rounded bg-steel-950 p-2"><option value="">Seleccionar</option><option>CC</option><option>SC</option></select></label>
      {([{ key: 'sample_size', label: 'Tamaño de muestra' }] as const).map(f => <label key={f.key} className="text-xs">{f.label}<input type="number" min={1} disabled={readOnly} value={values[f.key] || ''} onChange={e => setValues({ ...values, [f.key]: e.target.value ? Number(e.target.value) : null })} className="block w-full rounded bg-steel-950 p-2" /></label>)}
      <label className="text-xs">Responsable<select disabled={readOnly} value={values.responsible_person_id || ''} onChange={e=>setValues({...values,responsible_person_id:e.target.value?Number(e.target.value):null})} className="block w-full rounded bg-steel-950 p-2"><option value="">Seleccionar</option>{users.filter(u=>allowedResponsibleIds.includes(Number(u.id))).map(u=><option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}</select></label>
      <label className="text-xs">Unidad<select disabled={readOnly} value={values.unit_id || ''} onChange={e=>setValues({...values,unit_id:e.target.value?Number(e.target.value):null})} className="block w-full rounded bg-steel-950 p-2"><option value="">Sin unidad</option>{units.map(u=><option key={u.id} value={u.id}>{u.symbology} — {u.description}</option>)}</select></label>
    </div>
    {item.needs_review && !readOnly && canReview && <div className="space-y-2"><label className="block text-sm">Justificación de revisión del origen<input value={reviewReason} onChange={e=>setReviewReason(e.target.value)} className="block w-full bg-steel-950 p-2 rounded" /></label>
      {[true,false].map(keep=><button key={String(keep)} type="button" disabled={reviewReason.trim().length<5||saving} className="mr-2 underline" onClick={async()=>{setSaving(true);try{await controlPlanService.reviewSource(item.id,keep,reviewReason,version);onSaved();}catch{toast.error('No se pudo revisar el origen del control');}finally{setSaving(false);}}}>{keep?'Conservar control histórico':'Retirar control'}</button>)}
    </div>}
    {item.is_active===false&&<p className="text-sm text-steel-400">Control retirado; se conserva en el historial.</p>}
    {!readOnly && <button disabled={saving} className="rounded bg-emerald-600 px-4 py-2 text-white">{saving ? 'Guardando…' : 'Guardar control'}</button>}
  </form>;
}
