import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Archive, History, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DocumentStatus } from './DocumentStatus';
import { formatDate } from '../../utils/dateUtils';

export interface DocumentCardProps {
  id: number;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  version?: number | string;
  updatedAt?: string;
  createdAt: string;
  href?: string;
  onOpen?: () => void;
  onArchive?: () => void;
  onHistory?: () => void;
  children?: ReactNode;
  openLabel?: string;
}

export function DocumentCard({
  id,
  title,
  subtitle,
  status,
  version,
  updatedAt,
  createdAt,
  href,
  onOpen,
  onArchive,
  onHistory,
  children,
  openLabel,
}: DocumentCardProps) {
  const { t } = useTranslation('workspace');
  const archived = status?.toLowerCase() === 'archived';

  return (
    <article className="document-card" data-archived={archived || undefined}>
      <div className="document-card-top">
        <span className="document-card-id">#{id} · v{version ?? 1}</span>
        <DocumentStatus status={status} />
      </div>
      <h2>
        {href ? (
          <Link className="document-card-title" to={href}>
            {title}
          </Link>
        ) : onOpen && !archived ? (
          <button type="button" className="document-card-title" onClick={onOpen}>
            {title}
          </button>
        ) : (
          title
        )}
      </h2>
      {subtitle && <p className="document-card-subtitle">{subtitle}</p>}
      {children}
      {(href || (onOpen && !archived)) && (
        <span className="document-open" aria-hidden="true">
          <span>{openLabel || t('open')}</span>
          <ArrowUpRight size={16} />
        </span>
      )}
      <div className="document-card-footer">
        <p>
          {t(updatedAt ? 'updated' : 'created')}
          <span>{formatDate(updatedAt || createdAt)}</span>
        </p>
        <div className="document-card-actions">
          {onHistory && (
            <button
              type="button"
              className="ui-icon-button"
              onClick={onHistory}
              title={t('history')}
              aria-label={`${t('history')}: ${title}`}
            >
              <History size={17} />
            </button>
          )}
          {!archived && onArchive && (
            <button
              type="button"
              className="ui-icon-button"
              onClick={onArchive}
              title={t('archive')}
              aria-label={`${t('archive')}: ${title}`}
            >
              <Archive size={17} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
