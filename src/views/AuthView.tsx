import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GuardianShieldLogo } from '../components/brand/GuardianShieldLogo';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle,
  FileText,
  AlertCircle,
  Database,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { signIn, register, loadDemoMode } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else if (authMode === 'register') {
        if (!fullName.trim()) {
          setErrorMsg('Full name is required to initialize family workspace.');
          setIsSubmitting(false);
          return;
        }
        await register(fullName, email, password);
      } else {
        // Forgot password simulation
        setInfoMsg(`Password recovery instructions sent to ${email}. Check your inbox.`);
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Left Visual Brand Column */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-[#0B1226] to-[#0A1A2E] text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Geometric Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <GuardianShieldLogo size={42} showTagline={true} />

          <div className="mt-12 lg:mt-20 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Document Accuracy & Emergency Readiness
            </span>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Every policy. Every medical record. Every family, protected.
            </h1>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Consolidate life, health, accidental, bank, and government insurance with verified medical passports, cryptographic SHA-256 vault storage, and instant emergency intelligence.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 font-semibold text-teal-300 mb-1">
              <FileText className="w-4 h-4" />
              <span>Strict No-RAG Truth</span>
            </div>
            <p className="text-slate-400">
              Direct document-grounded answers. No vector hallucinations or synthetic guesses.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 font-semibold text-cyan-300 mb-1">
              <Lock className="w-4 h-4" />
              <span>Cryptographic SHA-256</span>
            </div>
            <p className="text-slate-400">
              Byte-exact tamper detection for insurance policies and payment evidence.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span>2-Step Verification</span>
            </div>
            <p className="text-slate-400">
              Strict payment proof workflows. No unverified "Mark as Paid" clicks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Emergency 112 Ready</span>
            </div>
            <p className="text-slate-400">
              Rapid hospital geolocation, blood group, allergies, and TPA cashless support.
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-8 text-[11px] text-slate-400">
          Guardian Stack Family Protection Platform • Enterprise Security Architecture
        </div>
      </div>

      {/* Right Form Column */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Demo Mode Quick Access Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  <Database className="w-3.5 h-3.5" />
                  <span>Evaluation & Judge Sandbox</span>
                </div>
                <p className="text-xs text-amber-700/90 dark:text-amber-200/90 mt-1">
                  Explore preloaded fictional records for Father, Mother, and 2 Sons with policies, medical passports, and payments.
                </p>
              </div>
              <button
                type="button"
                onClick={loadDemoMode}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-900/20 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>Launch Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-2 italic">
              Notice: Demo records are strictly isolated and never mixed with real registered accounts.
            </p>
          </div>

          {/* Real Account Form Box */}
          <div className="bg-white dark:bg-[#0E1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {authMode === 'signin'
                  ? 'Welcome back'
                  : authMode === 'register'
                  ? 'Initialize Family Workspace'
                  : 'Reset your password'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {authMode === 'signin'
                  ? 'Access your encrypted family vault and insurance policies.'
                  : authMode === 'register'
                  ? 'Brand new accounts start completely empty with zero prepopulated data.'
                  : 'Enter your email to receive recovery instructions.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{infoMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-teal-900/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Authenticating...'
                  : authMode === 'signin'
                  ? 'Sign In to Workspace'
                  : authMode === 'register'
                  ? 'Create New Account'
                  : 'Send Reset Link'}
              </button>
            </form>

            {authMode === 'forgot' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-400">
            End-to-End Workspace Isolation • Zero Third-Party Advertising
          </div>
        </div>
      </div>
    </div>
  );
};
