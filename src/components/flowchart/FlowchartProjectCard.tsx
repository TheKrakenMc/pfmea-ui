import type { FlowchartRead } from '../../services/flowchartService';
import { DocumentCard } from '../ui/DocumentCard';
interface Props {
  project: FlowchartRead;
  onEdit: (id: number) => void;
  onArchive?: (id: number) => void;
  onViewHistory?: (id: number) => void;
  onClone?: (project: FlowchartRead) => void;
}
export function FlowchartProjectCard({ project, onEdit, onArchive, onViewHistory, onClone }: Props) {
  return (
    <DocumentCard
      id={project.id}
      title={project.title}
      subtitle={project.product ? `${project.product.customer_name || ''} · ${project.product.part_number || ''}` : project.type}
      status={project.status}
      version={project.version}
      createdAt={project.created_at}
      updatedAt={project.updated_at}
      onOpen={() => onEdit(project.id)}
      onArchive={onArchive ? () => onArchive(project.id) : undefined}
      onHistory={onViewHistory ? () => onViewHistory(project.id) : undefined}
      onClone={onClone ? () => onClone(project) : undefined}
    />
  );
}
