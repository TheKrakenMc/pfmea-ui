// A disposable PostgreSQL-compatible database; never reads connection settings.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = await PGlite.create();
try {
  await db.exec(`
    CREATE SCHEMA pfmea;
    CREATE TABLE pfmea.control_plans(id bigint PRIMARY KEY, status text);
    CREATE TABLE pfmea.control_plan_items(
      id bigint PRIMARY KEY, control_plan_id bigint REFERENCES pfmea.control_plans,
      sample_size integer);
    CREATE TABLE pfmea.document_versions(id bigint PRIMARY KEY, snapshot_data jsonb);
    INSERT INTO pfmea.control_plans VALUES (1,'Draft'),(2,'Approved'),(3,'Archived'),(4,'In Review');
    INSERT INTO pfmea.control_plan_items VALUES (1,1,5),(2,2,10),(3,3,20),(4,4,NULL);
    INSERT INTO pfmea.document_versions VALUES (1,'{"sample_size":10,"status":"Approved"}');
  `);
  const sql = await fs.readFile('../pfmea-api/migrations/V4_038_control_plan_operational_text.sql', 'utf8');
  const before = await db.query('SELECT * FROM pfmea.document_versions');
  await db.exec('BEGIN;');
  await db.exec(sql);
  await db.exec('ROLLBACK;');
  const rolledBack = await db.query("SELECT column_name FROM information_schema.columns WHERE table_schema='pfmea' AND table_name='control_plan_items' AND column_name='sample_size_text'");
  assert.equal(rolledBack.rows.length, 0);
  await db.exec(sql);
  const items = (await db.query('SELECT * FROM pfmea.control_plan_items ORDER BY id')).rows;
  assert.equal(items[0].sample_size_text, '5');
  assert.equal(items[0].sample_size, 5);
  assert.equal(items[1].sample_size_text, null);
  assert.equal(items[2].sample_size_text, null);
  assert.equal(items[3].sample_size_text, null);
  await db.exec("UPDATE pfmea.control_plan_items SET sample_size_text='100%', control_method='SPC' WHERE id=1");
  const first = await db.query('SELECT * FROM pfmea.control_plan_items ORDER BY id');
  await db.exec(sql);
  assert.deepEqual((await db.query('SELECT * FROM pfmea.control_plan_items ORDER BY id')).rows, first.rows);
  assert.deepEqual((await db.query('SELECT * FROM pfmea.document_versions')).rows, before.rows);
  const report = { migration: 'V4_038', isolated: true, rollback: true, replay: true,
    preservesLegacyNumeric: true, preservesApprovedAndArchived: true, preservesSnapshots: true,
    engine: (await db.query('SELECT version()')).rows[0].version };
  await fs.mkdir('../docs/implementation/evidence', { recursive: true });
  await fs.writeFile('../docs/implementation/evidence/operational-text-migration.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await db.close();
}
