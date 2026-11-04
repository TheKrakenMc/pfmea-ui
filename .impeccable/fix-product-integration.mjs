import fs from 'node:fs';
const path='src/pages/products/ProductListPage.tsx';
let s=fs.readFileSync(path,'utf8').replaceAll('\r\n','\n');
s=s.replace('const data = await listProducts({ q: search });\n      setProducts(data);', 'const data = await loadCatalog((skip, limit) => listProducts({ q: search, skip, limit }), () => request !== requestVersion.current);\n      if (request === requestVersion.current) setProducts(data);');
s=s.replace('<DataLayout\n', '<DataLayout\n        resultCount={filteredProducts.length}\n        error={error}\n        onRetry={fetchProducts}\n        hasActiveFilters={hasActiveFilters}\n        onReset={handleResetFilters}\n');
fs.writeFileSync(path,s);
