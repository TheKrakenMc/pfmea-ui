/** Deterministic IDs stay unique after restoring a local draft. */
export function nextDraftRowId(rows: readonly {id:number}[]) { return rows.reduce((minimum,row)=>Math.min(minimum,row.id),0)-1; }
