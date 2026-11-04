import { useTranslation } from 'react-i18next';
import type { PfmeaHeader } from '../../api/pfmeaService';
import { DocumentCard } from '../ui/DocumentCard';
interface Props { project: PfmeaHeader; onEdit: (id: number) => void; onArchive?: (id: number) => void }
export function PFMEAProjectCard({ project, onEdit, onArchive }: Props) {
  const { t } = useTranslation('workspace');
  return <DocumentCard id={project.id} title={project.project_name} subtitle={project.customer}
    status={project.moc_status || project.status} version={project.version}
    createdAt={project.created_at} updatedAt={project.updated_at}
    onOpen={() => onEdit(project.id)} onArchive={onArchive ? () => onArchive(project.id) : undefined}>
    {project.part_number && <dl className="document-card-details"><div><dt>{t('part')}</dt><dd>{project.part_number}</dd></div></dl>}
  </DocumentCard>;
}
