import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = await PGlite.create();
try {
  await db.exec(`CREATE SCHEMA pfmea;
    CREATE TABLE pfmea.control_plans(id bigint PRIMARY KEY, pfmea_project_id bigint NOT NULL,
      status text, version integer, deleted_at timestamptz);
    CREATE TABLE pfmea.control_plan_items(id bigint PRIMARY KEY, control_plan_id bigint REFERENCES pfmea.control_plans,
      item_name text, sample_size_text text);
    CREATE TABLE pfmea.document_versions(id bigint PRIMARY KEY, snapshot_data jsonb);
    INSERT INTO pfmea.control_plans VALUES(1,10,'Approved',4,NULL),(2,20,'Draft',1,NULL);
    INSERT INTO pfmea.control_plan_items VALUES(1,1,'Manual 109','100%');
    INSERT INTO pfmea.document_versions VALUES(1,'{"status":"Approved","version":4,"items":[{"sample_size_text":"100%"}]}');`);
  const beforePlans = (await db.query('SELECT id,pfmea_project_id,status,version,deleted_at FROM pfmea.control_plans ORDER BY id')).rows;
  const beforeItems = (await db.query('SELECT * FROM pfmea.control_plan_items')).rows;
  const beforeSnapshots = (await db.query('SELECT * FROM pfmea.document_versions')).rows;
  const sql = await fs.readFile('../pfmea-api/migrations/V4_039_control_plan_phases_revisions.sql','utf8');
  await db.exec('BEGIN;'); await db.exec(sql); await db.exec('ROLLBACK;');
  assert.equal((await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='pfmea' AND table_name='control_plans' AND column_name='phase'")).rows.length,0);
  await db.exec(sql); await db.exec(sql);
  assert.deepEqual((await db.query('SELECT id,pfmea_project_id,status,version,deleted_at FROM pfmea.control_plans ORDER BY id')).rows,beforePlans);
  assert.deepEqual((await db.query('SELECT * FROM pfmea.control_plan_items')).rows,beforeItems);
  assert.deepEqual((await db.query('SELECT * FROM pfmea.document_versions')).rows,beforeSnapshots);
  assert.equal((await db.query('SELECT phase FROM pfmea.control_plans WHERE id=1')).rows[0].phase,null);
  await db.exec(`INSERT INTO pfmea.control_plans(id,pfmea_project_id,status,version,phase,root_plan_id)
    VALUES(10,10,'Approved',1,'Production',10),(20,10,'Draft',1,'Prototype',20),(30,10,'Draft',1,'Pre-launch',30);
    INSERT INTO pfmea.control_plans(id,pfmea_project_id,status,version,phase,root_plan_id,previous_revision_id)
    VALUES(11,10,'Draft',2,'Production',10,10),(3,10,'Draft',5,NULL,1,1);`);
  for (const [statement, code] of [
    ["INSERT INTO pfmea.control_plans(id,pfmea_project_id,phase,version) VALUES(12,10,'Production',1)",'23505'],
    ["INSERT INTO pfmea.control_plans(id,pfmea_project_id,phase,version,root_plan_id,previous_revision_id) VALUES(13,10,'Production',2,10,10)",'23505'],
    ["INSERT INTO pfmea.control_plans(id,pfmea_project_id,phase,version,root_plan_id,previous_revision_id) VALUES(14,20,'Production',3,10,11)",'23514'],
    ["INSERT INTO pfmea.control_plans(id,pfmea_project_id,phase,version,root_plan_id,previous_revision_id) VALUES(15,10,'Prototype',3,10,11)",'23514'],
    ["INSERT INTO pfmea.control_plans(id,pfmea_project_id,phase,version,root_plan_id,previous_revision_id) VALUES(16,10,'Production',5,10,11)",'23514'],
    ["INSERT INTO pfmea.control_plans(id,pfmea_project_id,phase,version) VALUES(17,10,'Unknown',1)",'23514'],
  ]) await assert.rejects(db.exec(statement),error => error.code === code);
  const report = {migration:'V4_039',isolated:true,replay:true,rollback:true,historicalRowsUnchanged:true,
    phases:3,duplicateRootsRejected:true,duplicateSuccessorsRejected:true,crossProjectOrPhaseRejected:true,
    revisionSequenceEnforced:true,snapshotsPreserved:true,legacyPhaseRemainsUnknown:true,
    engine:(await db.query('SELECT version()')).rows[0].version};
  await fs.mkdir('../docs/implementation/evidence',{recursive:true});
  await fs.writeFile('../docs/implementation/evidence/control-plan-revisions.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
} finally { await db.close(); }
