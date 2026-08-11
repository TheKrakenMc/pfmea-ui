import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('app.documentTitle');
    document.documentElement.lang = i18n.language;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('app.documentDescription'));
    }
  }, [i18n.language, t]);

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
