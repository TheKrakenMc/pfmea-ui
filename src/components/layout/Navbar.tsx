import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Factory, Menu, Moon, Sun, Languages, LogOut, UserCircle, Users } from 'lucide-react';
import { listPlants } from '../../services/plantService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Disclosure } from '../ui/Disclosure';
import { documentLinks, auxiliaryLinks } from './navigation';
import Drawer from './Drawer';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { t: w } = useTranslation('workspace');
  const { user, logout, selectPlant } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: plants = [] } = useQuery({ queryKey: ['plants', 'authorized'], queryFn: listPlants, enabled: !!user });
  const isAdmin = ['administrator', 'admin'].includes(user?.role_name?.toLowerCase() || '');
  return <header className="app-header">
    <div className="app-header-inner">
      <button className="ui-icon-button app-menu-toggle" onClick={() => setDrawerOpen(true)}
        aria-label={w('menu')} aria-expanded={drawerOpen} aria-haspopup="dialog"><Menu size={21} /></button>
      <Link className="app-brand" to="/" aria-label="APG DMS"><strong>APG</strong><span>DMS</span></Link>
      <nav className="app-desktop-nav" aria-label={w('navigation')}>
        {documentLinks.map(item => <NavLink key={item.path} to={item.path} className="app-nav-link">{t(item.key)}</NavLink>)}
        <Disclosure key={location.pathname} className="app-auxiliary" active={location.pathname.startsWith('/auxiliaries')}
          label={t('navbar.auxiliaries.title')}>
          {auxiliaryLinks.map(item => <NavLink key={item.path} to={item.path} className="app-nav-link"><item.icon size={17} />{t(item.key)}</NavLink>)}
          {isAdmin && <NavLink to="/admin/users" className="app-nav-link"><Users size={17} />{t('navbar.users')}</NavLink>}
        </Disclosure>
      </nav>
      <div className="app-utilities">
        {user && user.plant_ids.length > 0 && <label className="app-plant">
          <Factory size={17} aria-hidden="true" /><span className="sr-only">{w('plant')}</span>
          <select value={user.plant_id || ''} onChange={event => selectPlant(Number(event.target.value))}>
            {user.plant_ids.map(id => <option key={id} value={id}>{plants.find(plant => plant.id === id)?.name || w('plantName', { id })}</option>)}
          </select>
        </label>}
        <Disclosure className="app-account" label={<><UserCircle size={22} /><span className="sr-only">{w('account')}</span></>}>
          <div className="app-account-identity"><strong>{user?.full_name}</strong><p>{[user?.department, user?.role_name].filter(Boolean).join(' · ')}</p></div>
          <button type="button" className="app-nav-link" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}{w(theme === 'dark' ? 'light' : 'dark')}</button>
          <button type="button" className="app-nav-link" onClick={() => i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es')}><Languages size={18} />{w('language')}</button>
          <button type="button" className="app-nav-link" onClick={logout}><LogOut size={18} />{w('logout')}</button>
        </Disclosure>
      </div>
    </div>
    <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
  </header>;
}
