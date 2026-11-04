import type { FlowchartRead } from '../../services/flowchartService';
import { DocumentCard } from '../ui/DocumentCard';
interface Props { project: FlowchartRead; onEdit: (id: number) => void; onArchive?: (id: number) => void; onViewHistory?: (id: number) => void }
export function FlowchartProjectCard({ project, onEdit, onArchive, onViewHistory }: Props) {
  return <DocumentCard id={project.id} title={project.title} subtitle={project.type} status={project.status}
    version={project.version} createdAt={project.created_at} updatedAt={project.updated_at}
    onOpen={() => onEdit(project.id)} onArchive={onArchive ? () => onArchive(project.id) : undefined}
    onHistory={onViewHistory ? () => onViewHistory(project.id) : undefined} />;
}
