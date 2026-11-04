import { useTranslation } from 'react-i18next';
import type { Product } from '../../types/product.types';
import { DocumentCard } from '../ui/DocumentCard';
export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const details = [
    [t('products.form.customerPartNumber', 'Parte del cliente'), product.customer_part_number],
    [t('products.form.dimensions', 'Dimensiones'), product.dimensions],
    [t('products.form.weight', 'Peso'), product.weight != null ? `${product.weight} kg` : null],
    [t('products.form.cycleTime', 'Tiempo de ciclo'), product.cycle_time != null ? `${product.cycle_time} s` : null],
    [t('products.form.ratePerHour', 'Piezas por hora'), product.rate_per_hour],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '');
  return <DocumentCard id={product.id} title={product.part_number || `#${product.id}`}
    subtitle={product.customer?.company_name} status={product.status} version={product.version}
    createdAt={product.created_at} updatedAt={product.updated_at} href={`/products/${product.id}`}
    openLabel={t('workspace:openProduct')}>
    {product.description && <p className="document-card-description">{product.description}</p>}
    {details.length > 0 && <dl className="document-card-details">{details.map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    {product.technologies.length > 0 && <p className="document-card-technologies">{product.technologies.map(technology => technology.name).join(' · ')}</p>}
  </DocumentCard>;
}
