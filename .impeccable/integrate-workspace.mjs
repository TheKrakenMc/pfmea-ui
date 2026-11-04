import fs from 'node:fs';
const read = path => fs.readFileSync(path, 'utf8');
const write = (path, source) => fs.writeFileSync(path, source);
let path = 'src/index.css';
write(path, read(path).replace('@import "tailwindcss";', '@import "tailwindcss";\n@import "./styles/tokens.css";\n@import "./styles/workspace.css";'));
path = 'src/i18n/i18n.ts';
write(path, read(path).replace("import { entryCopy } from './entry';", "import { entryCopy } from './entry';\nimport { workspaceCopy } from './workspace';").replace('entry: entryCopy.es,', 'entry: entryCopy.es,\n        workspace: workspaceCopy.es,').replace('entry: entryCopy.en,', 'entry: entryCopy.en,\n        workspace: workspaceCopy.en,'));
path = 'src/components/layout/MainLayout.tsx';
write(path, read(path).replace('h-screen overflow-hidden flex flex-col bg-steel-950 bg-grid-pattern', 'app-shell h-dvh overflow-hidden flex flex-col'));
path = 'src/pages/entry-pages.css';
const aliases = {ground:'ground',surface:'surface',ink:'ink',muted:'muted',line:'line',blue:'accent','blue-hover':'accent',tint:'tint',focus:'focus',error:'danger','error-bg':'danger-bg',success:'success','success-bg':'success-bg'};
let css = read(path);
for (const [entry, ui] of Object.entries(aliases)) css = css.replace(new RegExp(`--entry-${entry}:\\s*#[a-fA-F0-9]+;`, 'g'), `--entry-${entry}: var(--ui-${ui});`);
css = css.replaceAll('background: #245ac0', 'background: var(--ui-primary)').replaceAll('background:#245ac0', 'background:var(--ui-primary)').replaceAll('background: #194aab', 'background: var(--ui-primary-hover)').replaceAll('background:#194aab', 'background:var(--ui-primary-hover)');
write(path, css);
for (const [path, collection] of [['src/pages/products/ProductListPage.tsx','filteredProducts'], ['src/pages/flowcharts/FlowchartDashboard.tsx','filteredProjects'], ['src/pages/pfmea/PFMEADashboard.tsx','filteredProjects']]) {
  let s = read(path);
  s = "import { useDocumentView } from '../../hooks/useDocumentView';\nimport { loadCatalog } from '../../utils/loadCatalog';\n" + s;
  s = s.replace("useState<'grid' | 'table'>('grid')", 'useDocumentView()');
  s = s.replace('const hasActiveFilters = ', "const hasActiveFilters = search.trim().length > 0 || ");
  s = s.replace('const paginated', `const safeCurrentPage = Math.min(currentPage, Math.max(1, Math.ceil(${collection}.length / itemsPerPage)));\n\n  const paginated`);
  s = s.replace('(currentPage - 1) * itemsPerPage', '(safeCurrentPage - 1) * itemsPerPage').replace(`[${collection}, currentPage, itemsPerPage]`, `[${collection}, safeCurrentPage, itemsPerPage]`).replace('currentPage={currentPage}', 'currentPage={safeCurrentPage}');
  s = s.replaceAll('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', 'workspace-grid');
  s = s.replace(/className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600[^"\n]+"/, 'className="workspace-create"');
  s = s.replace('<DataLayout\n', `<DataLayout\n        resultCount={${collection}.length}\n        error={error}\n        onRetry={${collection === 'filteredProducts' ? 'fetchProducts' : '() => setLoadAttempt(value => value + 1)'}}\n        hasActiveFilters={hasActiveFilters}\n        onReset={handleResetFilters}\n`);
  if (collection === 'filteredProjects') {
    s = s.replace('Plus, Archive, AlertCircle,', 'Plus, AlertCircle,');
    s = s.replace('  const [error, setError]', '  const [loadAttempt, setLoadAttempt] = useState(0);\n  const [error, setError]');
    s = s.replace('  }, []);', '  }, [loadAttempt]);').replace('  }, [t]);', '  }, [t, loadAttempt]);');
    s = s.replace('await getDocumentHeaders();', 'await loadCatalog((skip, limit) => getDocumentHeaders(skip, limit), () => cancelled);');
    s = s.replace('await pfmeaService.listAnalyses();', 'await loadCatalog((skip, limit) => pfmeaService.listAnalyses({ skip, limit }), () => cancelled);');
    s = s.replace("setError('No se pudieron cargar los diagramas de flujo. Verifica tu conexión.');", "setError(t('workspace:error'));").replace('  }, [loadAttempt]);', '  }, [t, loadAttempt]);');
    s = s.replace(/      \{\/\* Error State \*\/\}[\s\S]*?      \{\/\* Archive Confirm Modal \*\/\}/, '      {/* Archive Confirm Modal */}');
    s = s.replace(/            \{\/\* Show Archived Toggle \*\/\}[\s\S]*?            <div className="workspace-grid">/, '            <div className="workspace-grid">');
    s = s.replace('      <SortDropdown', `      <label className="workspace-archive"><input type="checkbox" checked={showArchived}\n        onChange={event => { setShowArchived(event.target.checked); setCurrentPage(1); }} />{t('workspace:includeArchived')}</label>\n      <SortDropdown`);
    s = s.replace('const hasActiveFilters = ', 'const hasActiveFilters = showArchived || ');
    s = s.replace('const handleResetFilters = () => {', 'const handleResetFilters = () => {\n    setShowArchived(false);');
    s = s.replace('glass-card rounded-2xl border border-steel-800 w-full flex-1 flex flex-col overflow-hidden bg-steel-900/40 backdrop-blur-md shadow-2xl', 'workspace-table-content');
  }
  write(path, s);
}
