import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import {toast} from 'sonner';

export function PlantAssignmentModal({userId,onClose}:{userId:string;onClose:()=>void}) {
 const {data,isLoading,error}=useQuery({queryKey:['user-plants',userId],queryFn:async()=>{const [plants,assigned]=await Promise.all([axiosClient.get<{id:number;name:string;is_active:boolean}[]>('/plants/'),axiosClient.get<{plant_ids:number[];primary_plant_id:number}>('/users/'+userId+'/plants')]);return {plants:plants.data.filter(p=>p.is_active),assigned:assigned.data};}});
 const [edited,setEdited]=useState<{plant_ids:number[];primary_plant_id:number}|null>(null);
 const [saving,setSaving]=useState(false);
 const values=edited ?? data?.assigned;
 return <div role="dialog" aria-modal="true" aria-label="Asignación de plantas" className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"><form className="bg-steel-900 text-steel-100 rounded-xl p-6 space-y-4 max-w-lg w-full" onSubmit={async e=>{e.preventDefault();if(!values)return;setSaving(true);try{await axiosClient.put('/users/'+userId+'/plants',values);toast.success('Asignaciones actualizadas; las sesiones del usuario fueron revocadas');onClose();}catch{toast.error('No se pudieron guardar las asignaciones');}finally{setSaving(false);}}}>
 <h2 className="font-semibold">Plantas autorizadas</h2>{isLoading&&<p>Cargando…</p>}{error&&<p role="alert">No se pudieron cargar las plantas</p>}
 {values&&data?.plants.map(p=><label key={p.id} className="block"><input type="checkbox" checked={values.plant_ids.includes(p.id)} onChange={e=>setEdited({...values,plant_ids:e.target.checked?[...values.plant_ids,p.id]:values.plant_ids.filter(id=>id!==p.id)})}/> {p.name}</label>)}
 {values&&<label className="block">Planta principal<select aria-label="Planta principal" value={values.primary_plant_id} onChange={e=>setEdited({...values,primary_plant_id:Number(e.target.value)})} className="block bg-steel-800 p-2">{data?.plants.filter(p=>values.plant_ids.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
 <div className="flex gap-4"><button type="button" onClick={onClose}>Cancelar</button><button disabled={saving||!values||!values.plant_ids.includes(values.primary_plant_id)} type="submit">Guardar asignaciones</button></div></form></div>;
}
