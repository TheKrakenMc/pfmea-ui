import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {getErrorMessage} from '../utils/errors';

export function VerifyEmailPage(){
 const [params]=useSearchParams();
 const [token]=useState(()=>params.get('token') || '');
 const [busy,setBusy]=useState(false);
 const [success,setSuccess]=useState(false);
 const [error,setError]=useState('');
 return <main className="min-h-screen flex items-center justify-center bg-steel-950 text-steel-100 p-6"><div className="max-w-lg rounded-2xl bg-steel-900 border border-steel-700 p-8 space-y-5">
 <h1 className="text-xl font-semibold">Verificación de correo</h1>
 {success?<p role="status">Cuenta verificada. Ya puedes iniciar sesión con tu contraseña.</p>:<><p>Confirma tu correo para activar el acceso a PFMEA.</p>{!token&&<p role="alert">El enlace no contiene un token válido.</p>}{error&&<p role="alert">{error}</p>}
 <button disabled={busy||!token} className="bg-blue-600 p-3 rounded-lg disabled:opacity-50" onClick={async()=>{setBusy(true);setError('');window.history.replaceState(null,'','/verify-email');try{await axiosClient.post('/auth/verify-email',{token});setSuccess(true);}catch(err){setError(getErrorMessage(err,'El enlace caducó o ya fue utilizado. Solicita al administrador un nuevo enlace.'));}finally{setBusy(false);}}}>{busy?'Verificando…':'Verificar cuenta'}</button></>}
 <Link to="/login" className="block underline">Ir al inicio de sesión</Link></div></main>;
}
