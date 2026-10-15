import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
const db=await PGlite.create();let stage='baseline';
try{
 await db.exec('CREATE SCHEMA pfmea; SET search_path=pfmea,public;');
 const base=(await fs.readFile('../pfmea-api/PFMEA_v2.sql','utf8')).replace(/\btimestampz\b/gi,'timestamptz');
 await db.exec(base);
 for(const name of (await fs.readdir('../pfmea-api/migrations')).filter(n=>n.endsWith('.sql')).sort()){
  stage=name;
  const source=(await fs.readFile('../pfmea-api/migrations/'+name,'utf8')).replace(/^\s*(BEGIN|COMMIT|ROLLBACK)\s*;\s*$/gim,'');
  await db.exec('BEGIN;'+source+';COMMIT;');
 }
 const codeColumn=(await db.query("SELECT data_type,character_maximum_length FROM information_schema.columns WHERE table_schema='pfmea' AND table_name='user_otps' AND column_name='otp_code'")).rows[0];if(codeColumn.data_type!=='text')throw new Error('Recovery hash storage too short');
 const report={recoveryHashStorage:'text',freshSqlMigrationChainPassed:true,engine:(await db.query('SELECT version()')).rows[0].version,lastMigration:stage};await fs.mkdir('audit-artifacts',{recursive:true});await fs.writeFile('audit-artifacts/fresh-migration-chain.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}catch(error){console.error(JSON.stringify({stage,message:error.message,detail:error.detail},null,2));process.exitCode=1;}finally{await db.close();}
