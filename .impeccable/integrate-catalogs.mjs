import fs from 'node:fs';
let path = 'src/pages/products/ProductListPage.tsx';
let s = fs.readFileSync(path, 'utf8');
s = s.replace('useCallback, useMemo', 'useCallback, useMemo, useRef').replace('Plus, Users, Edit, Copy, Archive, History', 'Plus, Users');
s = "import { Link } from 'react-router-dom';\nimport { DocumentStatus } from '../../components/ui/DocumentStatus';\n" + s;
s = s.replace('  const [isLoading, setIsLoading]', '  const requestVersion = useRef(0);\n  const [error, setError] = useState<string | null>(null);\n  const [isLoading, setIsLoading]');
s = s.replace('const fetchProducts = useCallback(async () => {', 'const fetchProducts = useCallback(async () => {\n    const request = ++requestVersion.current;');
s = s.replace('      setIsLoading(true);', '      setIsLoading(true);\n      setError(null);');
s = s.replace('const data = await listProducts({ q: search });\n      setProducts(data);', 'const data = await loadCatalog((skip, limit) => listProducts({ q: search, skip, limit }), () => request !== requestVersion.current);\n      if (request === requestVersion.current) setProducts(data);');
s = s.replace("console.error('Error fetching products:', error);", "console.error('Error fetching products:', error);\n      if (request === requestVersion.current) setError(t('workspace:error'));" );
s = s.replace('      setIsLoading(false);', '      if (request === requestVersion.current) setIsLoading(false);').replace('  }, [search]);','  }, [search, t]);');
s = s.replace('return () => clearTimeout(timer);', 'return () => { clearTimeout(timer); requestVersion.current += 1; };');
const start = s.indexOf('        tableContent={');
const end = s.indexOf('        pagination={', start);
s = s.slice(0, start) + `        tableContent={
          <table className="workspace-table"><thead><tr>
            {['part', 'customer', 'description', 'status'].map(key => <th scope="col" key={key}>{t(\x60workspace:\x24{key}\x60)}</th>)}
          </tr></thead><tbody>{paginatedProducts.map(product => <tr key={product.id}>
            <td><Link className="workspace-table-title" to={\x60/products/\x24{product.id}\x60}>{product.part_number || \x60#\x24{product.id}\x60}</Link></td>
            <td>{product.customer?.company_name || '—'}</td><td>{product.description || '—'}</td>
            <td><DocumentStatus status={product.status} /></td>
          </tr>)}</tbody></table>
        }
` + s.slice(end);
fs.writeFileSync(path,s);
for (const [path, roles] of [['src/pages/flowcharts/FlowchartDashboard.tsx', ['Administrator','PFMEA Owner','Process Engineer']],['src/pages/pfmea/PFMEADashboard.tsx',['Administrator','PFMEA Owner']]]) {
  let s = fs.readFileSync(path, 'utf8');
  s = "import { useAuth } from '../../hooks/useAuth';\n" + s;
  s = s.replace('  const navigate = useNavigate();', `  const navigate = useNavigate();\n  const { user } = useAuth();\n  const canCreate = ${JSON.stringify(roles)}.includes(user?.role_name || '');\n  const canArchive = ['Administrator', 'PFMEA Owner'].includes(user?.role_name || '');`);
  s = s.replace('actionButton={actionButton}', 'actionButton={canCreate ? actionButton : undefined}');
  s = s.replaceAll('onArchive={handleArchiveClick}', 'onArchive={canArchive ? handleArchiveClick : undefined}');
  fs.writeFileSync(path,s);
}
