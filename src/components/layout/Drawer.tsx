import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { X, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { documentLinks, auxiliaryLinks } from './navigation';

export function Drawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { t: w } = useTranslation('workspace');
  const { user } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isAdmin = ['administrator', 'admin'].includes(user?.role_name?.toLowerCase() || '');
  useEffect(() => {
    if (isOpen && !dialog.current?.open) dialog.current?.showModal();
    else if (!isOpen && dialog.current?.open) dialog.current.close();
  }, [isOpen]);
  return createPortal(<dialog ref={dialog} className="app-drawer" aria-labelledby={titleId}
    onCancel={onClose} onClose={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="app-drawer-panel">
      <div className="app-drawer-heading"><Link to="/" className="app-brand" onClick={onClose}><strong>APG</strong><span>DMS</span></Link>
        <button type="button" className="ui-icon-button" onClick={onClose} aria-label={w('close')} autoFocus><X size={22} /></button>
      </div>
      <nav aria-labelledby={titleId} className="app-drawer-navigation">
        <h2 id={titleId}>{w('documents')}</h2>
        {documentLinks.map(item => <NavLink key={item.path} to={item.path} className="app-nav-link" onClick={onClose}><item.icon size={20} />{t(item.key)}</NavLink>)}
        <h2>{t('navbar.auxiliaries.title')}</h2>
        {auxiliaryLinks.map(item => <NavLink key={item.path} to={item.path} className="app-nav-link" onClick={onClose}><item.icon size={19} />{t(item.key)}</NavLink>)}
        {isAdmin && <NavLink to="/admin/users" className="app-nav-link" onClick={onClose}><Users size={20} />{t('navbar.users')}</NavLink>}
      </nav>
      <div className="app-account-identity"><strong>{user?.full_name}</strong><p>{user?.role_name}</p></div>
    </div>
  </dialog>, document.body);
}
export default Drawer;
