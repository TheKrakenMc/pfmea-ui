import {useState} from 'react';
import axiosClient from '../api/axiosClient';
import {clearSessionState} from '../api/sessionState';
import {getErrorMessage} from '../utils/errors';
export function ChangePasswordPage(){
 const [password,setPassword]=useState('');const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 return <main className="min-h-screen flex items-center justify-center p-6"><form className="rounded-xl border border-steel-700 bg-steel-900 p-6 space-y-4 max-w-md w-full" onSubmit={async e=>{
  e.preventDefault();setSaving(true);setError('');try{await axiosClient.post('/auth/change-password',{new_password:password});clearSessionState();window.location.assign('/login');}catch(err){setError(getErrorMessage(err,'No se pudo cambiar la contraseña'));}finally{setSaving(false);}
 }}><h1 className="text-xl font-semibold">Actualiza tu contraseña</h1><p>Debes cambiar tu contraseña temporal antes de continuar. Después inicia sesión con la nueva contraseña.</p>
 <label className="block">Nueva contraseña<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} className="block w-full bg-steel-950 rounded p-3"/></label>
 {error&&<p role="alert" className="text-red-400">{error}</p>}<button disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white">{saving?'Guardando…':'Cambiar contraseña'}</button></form></main>;
}
