import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const api='../pfmea-api';
const db=await PGlite.create();
try {
 await db.exec('CREATE SCHEMA pfmea; SET search_path TO pfmea,public;');
 await db.exec(await fs.readFile(api+'/tests/fixtures/current_schema.sql','utf8'));
 await db.exec(`
 INSERT INTO regions(id,name,code) VALUES(1,'Test Region','TEST');
 INSERT INTO plants(id,region_id,name,code) VALUES(1,1,'Plant One','ONE'),(2,1,'Plant Two','TWO');
 INSERT INTO roles(id,name) VALUES(1,'PFMEA Owner'),(2,'Administrator');
 INSERT INTO users(id,role_id,plant_id,email,full_name,is_verified,must_change_password) VALUES(1,1,1,'owner@example.com','Owner',true,false),(2,1,2,'other@example.com','Other',true,false);
 INSERT INTO customers(id,plant_id,customer_code,company_name) VALUES(1,1,'C1','Customer One'),(2,2,'C2','Customer Two');
 INSERT INTO products(id,plant_id,customer_id,part_number) VALUES(1,1,1,'PART-1'),(2,2,2,'PART-2');
 INSERT INTO flowcharts(id,plant_id,product_id,owner_id,created_by,title,status) VALUES(1,1,1,1,1,'Flow One','Approved'),(2,2,2,2,2,'Flow Two','Approved');
 INSERT INTO pfmea_headers(id,flowchart_id,plant_id,owner_id,pfmea_id_number,project_name,moc_status,status) VALUES(1,1,1,1,'PFMEA-1','Project One','Approved','Approved'),(2,2,2,2,'PFMEA-2','Project Two','Approved','Approved');
 INSERT INTO pfmea_team_members(pfmea_id,user_id,role_in_team,department) VALUES(1,1,'PFMEA Owner','Quality'),(2,2,'PFMEA Owner','Quality');
 INSERT INTO pfmea_worksheet_rows(id,pfmea_id,station_operation,failure_mode,severity,occurrence,detection,action_priority) VALUES(1,1,'Step','Failure',9,1,7,'H'),(2,2,'Step','Failure',9,1,7,'H');
 INSERT INTO control_plans(id,pfmea_project_id,flowchart_id,control_plan_code,title,owner_id,created_by,start_date) VALUES(1,1,1,'CP-1','Plan One',1,1,current_date),(2,2,2,'CP-2','Plan Two',2,2,current_date);
 INSERT INTO control_plan_items(id,control_plan_id,item_sequence,item_name) VALUES(1,1,10,'Mode: Failure (Step: Step)'),(2,2,10,'Mode: Failure (Step: Step)');
 `);
 // Simulate the old schema while preserving synthetic pre-upgrade documents.
 await db.exec('DROP TABLE auth_sessions; DROP TABLE user_plants; DROP TABLE used_verification_tokens;');
 for(const table of ['pfmea_headers','flowcharts','control_plans','products']) await db.exec('ALTER TABLE '+table+' DROP COLUMN lock_version, DROP COLUMN needs_review;');
 await db.exec('ALTER TABLE pfmea_worksheet_rows DROP COLUMN validated_by, DROP COLUMN validated_at; ALTER TABLE user_otps DROP COLUMN attempts; ALTER TABLE user_otps ALTER COLUMN otp_code TYPE varchar(10);');
 for(const column of ['pfmea_worksheet_row_id','source_row_id','needs_review','characteristic','classification','specification','unit_id','measurement_method','sample_size','sample_frequency','responsible_person_id','reaction_plan','is_active','source_reviewed','source_review_reason']) await db.exec('ALTER TABLE control_plan_items DROP COLUMN '+column);
 const oldCounts=(await db.query('SELECT (SELECT count(*) FROM pfmea_headers)::int AS documents,(SELECT count(*) FROM pfmea_worksheet_rows)::int AS rows')).rows[0];
 const backup=await db.dumpDataDir();
 await fs.mkdir('audit-artifacts',{recursive:true});
 await fs.writeFile('audit-artifacts/synthetic-preupgrade-backup.tar',Buffer.from(await backup.arrayBuffer()));
 for(const name of (await fs.readdir(api+'/migrations')).filter(n=>/^V4_03[0-7]_/.test(n)).sort()){
  await db.exec('BEGIN; '+await fs.readFile(api+'/migrations/'+name,'utf8')+' COMMIT;');
 }
 await db.exec("INSERT INTO user_otps(user_id,otp_code,expires_at) VALUES(1,repeat('a',64),now()+interval '5 minutes')");
 const newCounts=(await db.query('SELECT (SELECT count(*) FROM pfmea_headers)::int AS documents,(SELECT count(*) FROM pfmea_worksheet_rows)::int AS rows')).rows[0];
 assert.deepEqual(newCounts,oldCounts);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM user_plants')).rows[0].n,2);
 assert.equal((await db.query('SELECT pfmea_worksheet_row_id FROM control_plan_items WHERE id=1')).rows[0].pfmea_worksheet_row_id,1);
 const restored=await PGlite.create({loadDataDir:backup});
 assert.deepEqual((await restored.query('SELECT (SELECT count(*) FROM pfmea.pfmea_headers)::int AS documents,(SELECT count(*) FROM pfmea.pfmea_worksheet_rows)::int AS rows')).rows[0],oldCounts);
 await restored.close();
 await db.exec(`CREATE ROLE pfmea_runtime NOSUPERUSER NOBYPASSRLS; GRANT USAGE ON SCHEMA pfmea TO pfmea_runtime; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA pfmea TO pfmea_runtime; GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA pfmea TO pfmea_runtime; SET ROLE pfmea_runtime;`);
 await db.exec(`SELECT set_config('app.current_user_id','1',false),set_config('app.current_plant_id','1',false),set_config('app.is_admin','false',false);`);
 assert.deepEqual((await db.query('SELECT id FROM pfmea_headers ORDER BY id')).rows.map(r=>r.id),[1]);
 assert.deepEqual((await db.query('SELECT id FROM control_plans ORDER BY id')).rows.map(r=>r.id),[1]);
 assert.deepEqual((await db.query('SELECT id FROM control_plan_items ORDER BY id')).rows.map(r=>r.id),[1]);
 await db.exec(`SELECT set_config('app.current_plant_id','2',false);`);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM pfmea_headers')).rows[0].n,0);
 await db.exec(`SELECT set_config('app.current_plant_id','1',false);`);
 assert.equal((await db.query('UPDATE pfmea_headers SET lock_version=lock_version+1 WHERE id=1 AND lock_version=1 RETURNING id')).rows.length,1);
 assert.equal((await db.query('UPDATE pfmea_headers SET lock_version=lock_version+1 WHERE id=1 AND lock_version=1 RETURNING id')).rows.length,0);
 const report={engine:(await db.query('SELECT version()')).rows[0].version,syntheticBackupRestored:true,additiveMigrationsPassed:true,restrictedRoleRlsPassed:true,staleRevisionRejected:true,countsPreserved:newCounts};
 await fs.writeFile('audit-artifacts/postgres-rehearsal.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
} finally {await db.close();}
