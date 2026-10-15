import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const cwd = process.cwd();
const config = ts.getParsedCommandLineOfConfigFile(path.join(cwd, 'tsconfig.app.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const host = { getScriptFileNames: () => config.fileNames, getScriptVersion: () => '0',
 getScriptSnapshot: p => fs.existsSync(p) ? ts.ScriptSnapshot.fromString(fs.readFileSync(p, 'utf8')) : undefined,
 getCurrentDirectory: () => cwd, getCompilationSettings: () => config.options,
 getDefaultLibFileName: o => ts.getDefaultLibFilePath(o), fileExists: ts.sys.fileExists,
 readFile: ts.sys.readFile, readDirectory: ts.sys.readDirectory };
const service = ts.createLanguageService(host);
let count = 0;
for (const file of config.fileNames) {
 const diagnostics = service.getSemanticDiagnostics(file);
 const edits = [];
 for (const diagnostic of diagnostics.filter(d => [6133, 6192, 1484].includes(d.code))) {
  const fixes = service.getCodeFixesAtPosition(file, diagnostic.start, diagnostic.start + diagnostic.length, [diagnostic.code], {}, {});
  const fix = diagnostic.code === 1484 ? fixes[0] : fixes.find(f => f.fixName === 'unusedIdentifier');
  if (fix) for (const change of fix.changes) if (change.fileName === file) edits.push(...change.textChanges);
 }
 const unique = [...new Map(edits.map(e => [e.span.start + ':' + e.span.length, e])).values()].sort((a,b) => b.span.start - a.span.start);
 let source = fs.readFileSync(file, 'utf8'), last = Infinity;
 for (const edit of unique) {
  if (edit.span.start + edit.span.length > last) continue;
  source = source.slice(0,edit.span.start) + edit.newText + source.slice(edit.span.start+edit.span.length);
  last = edit.span.start; count++;
 }
 if (unique.length) fs.writeFileSync(file,source);
}
console.log('Applied semantic code fixes:', count);
