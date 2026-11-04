import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Eye, EyeOff, GitBranch, Languages, LoaderCircle, LockKeyhole, Moon, ShieldCheck, SlidersHorizontal, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { getErrorMessage } from '../utils/errors';
import './entry-pages.css';

type Phase = 'login' | 'recover' | 'reset';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginPhase1, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { t: copy } = useTranslation('entry');
  const [phase, setPhase] = useState<Phase>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousPhase = useRef(phase);

  useEffect(() => { if (isAuthenticated) navigate('/', { replace: true }); }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (previousPhase.current !== phase) { headingRef.current?.focus(); previousPhase.current = phase; }
  }, [phase]);

  const changePhase = (next: Phase) => {
    setFormError(''); setShowPassword(false); setSuccess(false);
    if (next === 'recover') setResetEmail(email);
    setPhase(next);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setFormError('');
    try {
      if (phase === 'login') {
        await loginPhase1(email, password); navigate('/', { replace: true });
      } else if (phase === 'recover') {
        await forgotPassword(resetEmail); changePhase('reset');
      } else {
        await resetPassword(resetEmail, resetOtp, newPassword);
        setEmail(resetEmail); setPassword(''); setResetEmail(''); setResetOtp(''); setNewPassword(''); changePhase('login'); setSuccess(true);
      }
    } catch (error) { setFormError(getErrorMessage(error, copy('error'))); }
    finally { setIsSubmitting(false); }
  };

  const title = phase === 'login' ? copy('loginTitle') : t(phase === 'recover' ? 'login.forgotPasswordTitle' : 'login.resetPasswordTitle');
  const description = phase === 'login' ? copy('loginDescription') : phase === 'recover' ? t('login.forgotPasswordDesc') : copy('resetSent', { email: resetEmail });
  const buttonLabel = phase === 'login' ? copy('signIn') : t(phase === 'recover' ? 'login.sendOtp' : 'login.verifyAndReset');
  const steps = [{ title: 'process', detail: 'processDetail', icon: GitBranch }, { title: 'analyze', detail: 'analyzeDetail', icon: ShieldCheck }, { title: 'control', detail: 'controlDetail', icon: SlidersHorizontal }];

  return (
    <main className="entry-page login-page">
      <section className="login-story" aria-label="APG DMS">
        <div className="login-brand"><span className="brand-monogram">APG</span><span>Adler Pelzer Group</span></div>
        <div className="story-content"><h2>{copy('brandTitle')}</h2><p>{copy('brandDescription')}</p>
          <ol className="process-path">{steps.map(({ title: stepTitle, detail, icon: Icon }) => <li key={stepTitle}><Icon size={21} aria-hidden="true" /><div><strong>{copy(stepTitle)}</strong><span>{copy(detail)}</span></div></li>)}</ol>
        </div>
        <div className="story-footer"><span>APG DMS</span><span>{copy('platform')}</span></div>
      </section>
      <section className="login-workspace" aria-labelledby="login-heading">
        <div className="login-tools">
          <button type="button" onClick={toggleTheme} aria-label={copy('toggleTheme')} title={copy('toggleTheme')}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
          <button type="button" onClick={() => void i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es')} aria-label={copy('changeLanguage')}><Languages size={17} aria-hidden="true" /><span>{i18n.language.startsWith('es') ? 'ES' : 'EN'}</span></button>
        </div>
        <div className="login-form-area">
          <div className="mobile-brand">APG <span>DMS</span></div>
          <header className="login-heading"><h1 id="login-heading" ref={headingRef} tabIndex={-1}>{title}</h1><p id="login-description">{description}</p></header>
          {success && <p className="entry-success" role="status">{copy('recoverySuccess')}</p>}
          {formError && <p id="login-error" className="entry-error" role="alert">{formError}</p>}
          <form onSubmit={handleSubmit} aria-describedby="login-description" aria-busy={isSubmitting}>
            <fieldset disabled={isSubmitting} className="login-fields">
              {phase !== 'reset' && <div className="entry-field"><label htmlFor="login-email">{t('login.emailLabel')}</label><input id="login-email" name="email" type="email" autoComplete="username" required placeholder="nombre@adlerpelzer.com" value={phase === 'login' ? email : resetEmail} onChange={event => phase === 'login' ? setEmail(event.target.value) : setResetEmail(event.target.value)} aria-describedby={formError ? 'login-error' : undefined} /></div>}
              {phase === 'reset' && <div className="entry-field"><label htmlFor="reset-otp">{t('login.otpLabel')}</label><input id="reset-otp" className="entry-otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required placeholder="000000" value={resetOtp} onChange={event => setResetOtp(event.target.value.replace(/\D/g, ''))} /></div>}
              {phase !== 'recover' && <div className="entry-field"><label htmlFor="login-password">{t(phase === 'login' ? 'login.passwordLabel' : 'login.newPasswordLabel')}</label>
                <div className="password-input"><input id="login-password" name={phase === 'login' ? 'password' : 'new-password'} type={showPassword ? 'text' : 'password'} autoComplete={phase === 'login' ? 'current-password' : 'new-password'} required minLength={phase === 'reset' ? 8 : undefined} placeholder="••••••••" value={phase === 'login' ? password : newPassword} onChange={event => phase === 'login' ? setPassword(event.target.value) : setNewPassword(event.target.value)} aria-describedby={phase === 'reset' ? 'password-hint' : undefined} /><button type="button" aria-label={copy(showPassword ? 'hidePassword' : 'showPassword')} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                {phase === 'reset' && <p id="password-hint" className="field-hint">{copy('passwordHint')}</p>}
              </div>}
              {phase === 'login' && <button type="button" className="forgot-password" onClick={() => changePhase('recover')}>{t('login.forgotPasswordLink')}</button>}
              <button type="submit" className="entry-submit" disabled={isSubmitting || (phase === 'reset' && (resetOtp.length !== 6 || newPassword.length < 8))}>{isSubmitting ? <><LoaderCircle className="entry-spinner" size={18} aria-hidden="true" /><span role="status">{copy('submitting')}</span></> : <>{buttonLabel}<ArrowRight size={18} aria-hidden="true" /></>}</button>
              {phase !== 'login' && <button type="button" className="back-to-login" onClick={() => changePhase('login')}><ArrowLeft size={16} aria-hidden="true" />{copy('back')}</button>}
            </fieldset>
          </form>
          <p className="employee-note"><LockKeyhole size={15} aria-hidden="true" />{copy('employeeAccess')}</p>
        </div>
        <footer className="login-footer">Adler Pelzer Group <span>·</span> APG DMS</footer>
      </section>
    </main>
  );
};
