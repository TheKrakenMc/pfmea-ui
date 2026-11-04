import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Database, GitBranch, Package, ShieldCheck } from 'lucide-react';
import './entry-pages.css';

export const WelcomePage = () => {
  const { t } = useTranslation();
  const { t: copy } = useTranslation('entry');
  const modules = [
    { id: 'flowchart', icon: GitBranch, title: t('welcome.flowchart.title'), description: t('welcome.flowchart.description'), path: '/flowcharts' },
    { id: 'products', icon: Package, title: t('navbar.products'), description: t('products.subtitle'), path: '/products' },
    { id: 'auxiliaries', icon: Database, title: t('welcome.auxiliaries.title'), description: t('welcome.auxiliaries.description'), path: '/auxiliaries/customers' },
  ];

  return (
    <div className="entry-page welcome-page">
      <div className="welcome-content">
        <header className="welcome-heading"><h1>{copy('workspace')}</h1><p>{copy('workspaceDescription')}</p></header>
        <nav className="workspace-modules" aria-label={copy('modules')}>
          <Link to="/pfmea" className="pfmea-feature">
            <div className="feature-copy"><h2><ShieldCheck size={25} aria-hidden="true" />{t('welcome.pfmea.title')}</h2><p>{t('welcome.pfmea.description')}</p></div>
            <div className="analysis-structure" aria-hidden="true"><div>{copy('failureMode')}<span>{copy('effect')}</span></div><ArrowRight size={18} /><div>{copy('cause')}<span>{copy('controls')}</span></div></div>
            <span className="feature-caption">{copy('riskCaption')}</span>
            <span className="feature-action">{copy('openPfmea')}<ArrowRight size={17} aria-hidden="true" /></span>
          </Link>
          <div className="module-directory">
            {modules.map(({ id, icon: Icon, title, description, path }) => (
              <Link key={id} to={path} className="module-link"><Icon className="module-icon" size={22} aria-hidden="true" /><div><h2>{title}</h2><p>{description}</p></div><ArrowRight className="module-arrow" size={19} aria-hidden="true" /></Link>
            ))}
          </div>
        </nav>
        <footer className="welcome-footer"><div className="workspace-signature">APG <span>DMS</span></div><p>{t('welcome.vision')}</p></footer>
      </div>
    </div>
  );
};
