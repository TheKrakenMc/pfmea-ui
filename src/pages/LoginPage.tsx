import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginPhase1, verifyOtpPhase2, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();

  // Navigation guard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // OTP resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handlePhase1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('login.incompleteFields'), { description: t('login.incompleteFieldsDesc') });
      return;
    }

    setIsSubmitting(true);
    try {
      const { otpRequired } = await loginPhase1(email, password);
      if (otpRequired) {
        setPhase(2);
        setCooldown(60);
        toast.info(t('login.otpSent'), { 
          description: t('login.otpSentDesc') 
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhase2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error(t('login.invalidOtp'), { description: t('login.invalidOtpDesc') });
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyOtpPhase2(email, otpCode);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    
    setIsSubmitting(true);
    try {
      await loginPhase1(email, password);
      setCooldown(60);
      toast.info(t('login.otpSent'), { 
        description: t('login.otpSentDesc') 
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhase3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error(t('login.incompleteFields'), { description: t('login.incompleteFieldsDesc') });
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(resetEmail);
      setPhase(4);
      toast.info(t('login.otpSent'), { description: t('login.otpSentDesc') });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhase4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || resetOtp.length !== 6) {
      toast.error(t('login.invalidOtp'), { description: t('login.invalidOtpDesc') });
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('login.shortPassword'), { description: t('login.shortPasswordDesc') });
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(resetEmail, resetOtp, newPassword);
      setPhase(1);
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('es') ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-grid-pattern bg-transparent">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-forge-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-review-500/10 blur-3xl"></div>

      {/* Main Glassmorphic Login Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-card p-8 shadow-2xl transition-all duration-300 border border-steel-800">
        
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center w-10 h-8 rounded-lg bg-steel-800/50 border border-steel-700 text-xs font-semibold text-steel-300 hover:text-white hover:bg-steel-700 transition-colors"
          >
            {i18n.language.startsWith('es') ? 'ES' : 'EN'}
          </button>
        </div>

        {/* Plant Member Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-forge-600/20 text-forge-400 border border-forge-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-steel-50 tracking-tight">Adler Pelzer Group</h2>
          <p className="mt-1 text-sm text-steel-400">{t('login.subtitle')}</p>
        </div>

        {/* Phase 1: Email & Password Form */}
        {phase === 1 && (
          <form onSubmit={handlePhase1Submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider">{t('login.emailLabel', 'Correo Electrónico de Planta')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-steel-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.626a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  placeholder="ej. antonio.tlaque@adlerpelzer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-steel-900 border border-steel-700 py-3 pl-10 pr-4 text-steel-100 placeholder-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 focus:outline-none transition-industrial text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider">{t('login.passwordLabel')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-steel-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-steel-900 border border-steel-700 py-3 pl-10 pr-4 text-steel-100 placeholder-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 focus:outline-none transition-industrial text-sm"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setPhase(3)}
                  className="text-xs font-medium text-forge-400 hover:text-forge-300 transition-industrial"
                >
                  {t('login.forgotPasswordLink')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-forge-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-forge-600/20 hover:bg-forge-500 disabled:opacity-50 disabled:cursor-not-allowed transition-industrial focus-ring"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span>{t('login.continueButton')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-2 w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Phase 2: OTP 6-Digit Verification */}
        {phase === 2 && (
          <form onSubmit={handlePhase2Submit} className="space-y-6">
            <div className="space-y-2 text-center">
              <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider block">{t('login.otpLabel')}</label>
              <p className="text-xs text-steel-400 px-4">
                {t('login.otpSentText')}<strong className="text-forge-400">{email}</strong>.
              </p>
              
              <div className="mt-4">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[12px] font-bold text-2xl rounded-xl bg-steel-900 border border-steel-700 py-3 text-forge-400 placeholder-steel-600 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 focus:outline-none transition-industrial"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setPhase(1)}
                className="text-steel-400 hover:text-steel-200 transition-industrial flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-1 w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span>{t('login.backToLogin')}</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isSubmitting}
                className="text-forge-400 hover:text-forge-300 disabled:text-steel-500 disabled:cursor-not-allowed font-medium transition-industrial"
              >
                {cooldown > 0 ? t('login.resendOtpTimer', { seconds: cooldown }) : t('login.resendOtp')}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpCode.length !== 6}
              className="flex w-full items-center justify-center rounded-xl bg-forge-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-forge-600/20 hover:bg-forge-500 disabled:opacity-50 disabled:cursor-not-allowed transition-industrial focus-ring"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <span>{t('login.verifyAndAccess')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-2 w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Phase 3: Forgot Password (Email request) */}
        {phase === 3 && (
          <form onSubmit={handlePhase3Submit} className="space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold text-steel-100">{t('login.forgotPasswordTitle')}</h3>
              <p className="text-xs text-steel-400 px-4">
                {t('login.forgotPasswordDesc')}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider">{t('login.emailLabel')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-steel-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.626a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  placeholder="ej. antonio.tlaque@adlerpelzer.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full rounded-xl bg-steel-900 border border-steel-700 py-3 pl-10 pr-4 text-steel-100 placeholder-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 focus:outline-none transition-industrial text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setPhase(1)}
                className="text-steel-400 hover:text-steel-200 transition-industrial flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-1 w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span>{t('login.backToLogin')}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-forge-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-forge-600/20 hover:bg-forge-500 disabled:opacity-50 disabled:cursor-not-allowed transition-industrial focus-ring"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>{t('login.sendOtp')}</span>
              )}
            </button>
          </form>
        )}

        {/* Phase 4: Reset Password (OTP + New Password) */}
        {phase === 4 && (
          <form onSubmit={handlePhase4Submit} className="space-y-6">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-bold text-steel-100">{t('login.resetPasswordTitle')}</h3>
              <p className="text-xs text-steel-400 px-4">
                {t('login.resetPasswordDesc')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider">{t('login.otpLabel')}</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[12px] font-bold text-2xl rounded-xl bg-steel-900 border border-steel-700 py-3 text-forge-400 placeholder-steel-600 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 focus:outline-none transition-industrial"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-steel-300 uppercase tracking-wider">{t('login.newPasswordLabel')}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-steel-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl bg-steel-900 border border-steel-700 py-3 pl-10 pr-4 text-steel-100 placeholder-steel-500 focus:border-forge-500 focus:ring-1 focus:ring-forge-500 focus:outline-none transition-industrial text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setPhase(1)}
                className="text-steel-400 hover:text-steel-200 transition-industrial flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-1 w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span>{t('login.backToLogin')}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || resetOtp.length !== 6 || newPassword.length < 8}
              className="flex w-full items-center justify-center rounded-xl bg-forge-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-forge-600/20 hover:bg-forge-500 disabled:opacity-50 disabled:cursor-not-allowed transition-industrial focus-ring"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <span>{t('login.verifyAndReset')}</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
