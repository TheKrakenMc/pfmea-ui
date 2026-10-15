import { useState } from 'react';
import {useAuth} from '../../hooks/useAuth';
import { pfmeaService, type WorksheetRow } from '../../api/pfmeaService';
import { getErrorMessage } from '../../utils/errors';
import { toast } from 'sonner';
export function ActionConfirmationTray({ id, version, rows, dirty, onConfirmed }: {id:number;version:number;rows:WorksheetRow[];dirty:boolean;onConfirmed:()=>void}) {
  const {user}=useAuth();
  const [pending,setPending]=useState<number|null>(null);
  if(!['Administrator','PFMEA Owner'].includes(user?.role_name || ''))return null;
  const actions=rows.filter(r=>(r.action_priority==='H'||(r.severity||0)>=9)&&r.action_status!=='Completed');
  if(!actions.length)return null;
  return <section className="rounded-xl border border-amber-400 p-4 space-y-2" aria-label="Validación de acciones">
    <h3 className="font-semibold">Validar acciones de riesgo alto</h3>
    {dirty&&<p className="text-sm">Guarda el borrador antes de validar las acciones.</p>}
    {actions.map(row=><div key={row.id} className="flex items-center justify-between gap-3">
      <span className="text-sm">{row.station_operation} — {row.failure_mode}</span>
      <button disabled={dirty||row.id<1||pending!==null} className="rounded bg-emerald-600 px-3 py-2 text-white disabled:opacity-40" onClick={async()=>{
        setPending(row.id);
        try{await pfmeaService.confirmAction(id,row.id,version);toast.success('Acción validada');onConfirmed();}
        catch(error){toast.error(getErrorMessage(error,'La acción requiere evidencia, responsable, fecha y nuevas S/O/D.'));}
        finally{setPending(null);}
      }}>Validar cierre</button>
    </div>)}
  </section>;
}
