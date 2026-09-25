import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  generateSeedPhrase,
  validateSeedPhrase,
  validatePrivateKey,
} from '../utils/wallet';
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  FileText,
  AlertOctagon,
  Github,
  Globe,
} from 'lucide-react';

export const Welcome: React.FC = () => {
  const { t, createWallet, importPrivateKey } = useApp();

  type Step =
    | 'CHOOSE'
    | 'CREATE_SET_PASSWORD'
    | 'SHOW_SEED'
    | 'VERIFY_SEED'
    | 'IMPORT_SET_PASSWORD';

  const [step, setStep] = useState<Step>('CHOOSE');
  const [importType, setImportType] = useState<'SEED' | 'PK'>('SEED');

  // Form states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generated seed phrase state
  const [generatedSeed, setGeneratedSeed] = useState<string>('');
  const [revealedSeed, setRevealedSeed] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  // Import input states
  const [importInput, setImportInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Start Create Flow
  const handleStartCreate = () => {
    setErrorMsg('');
    setPassword('');
    setConfirmPassword('');
    const newSeed = generateSeedPhrase(12);
    setGeneratedSeed(newSeed);
    setStep('CREATE_SET_PASSWORD');
  };

  // Start Import Flow
  const handleStartImport = () => {
    setErrorMsg('');
    setPassword('');
    setConfirmPassword('');
    setImportInput('');
    setStep('IMPORT_SET_PASSWORD');
  };

  // Validate Password
  const validatePasswords = (): boolean => {
    if (password.length < 8) {
      setErrorMsg(t('passwordTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t('passwordMismatch'));
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Submit Password for New Wallet -> Show Seed
  const handlePasswordSubmitForCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setStep('SHOW_SEED');
  };

  // Copy Seed Phrase to Clipboard
  const handleCopySeed = () => {
    navigator.clipboard.writeText(generatedSeed);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  // Finalize Creation after user confirms saving seed phrase
  const handleFinalizeCreate = async () => {
    try {
      setIsProcessing(true);
      await createWallet(password, generatedSeed);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error creating wallet');
      setIsProcessing(false);
    }
  };

  // Submit Import Form
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    try {
      setIsProcessing(true);
      setErrorMsg('');

      if (importType === 'SEED') {
        const clean = importInput.trim().toLowerCase();
        if (!validateSeedPhrase(clean)) {
          setErrorMsg(t('invalidSeedPhrase'));
          setIsProcessing(false);
          return;
        }
        await createWallet(password, clean);
      } else {
        const clean = importInput.trim();
        if (!validatePrivateKey(clean)) {
          setErrorMsg(t('invalidPrivateKey'));
          setIsProcessing(false);
          return;
        }
        await importPrivateKey(password, clean);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Import error');
      setIsProcessing(false);
    }
  };

  const seedWords = generatedSeed.split(' ');

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full">
      {/* Step 1: Initial Choice (Create or Import) */}
      {step === 'CHOOSE' && (
        <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
          {/* Logo Badge */}
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
              <div className="h-full w-full rounded-[22px] bg-slate-950 flex items-center justify-center text-white text-3xl font-extrabold tracking-tighter">
                Æ
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-900 text-white">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('welcomeTitle')}
            </h1>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {t('welcomeSubtitle')}
            </p>
          </div>

          {/* Action Cards */}
          <div className="w-full space-y-3 pt-2">
            <button
              onClick={handleStartCreate}
              type="button"
              className="group w-full flex items-center justify-between p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/30 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {t('createNewWallet')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {t('createWalletDesc')}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
            </button>

            <button
              onClick={handleStartImport}
              type="button"
              className="group w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-400 dark:hover:border-slate-700 text-left transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition">
                    {t('importExistingWallet')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {t('importWalletDesc')}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition" />
            </button>
          </div>

          {/* Open source guarantee */}
          <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              AES-256-GCM
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Gemini AI Guard
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Github className="h-3 w-3 text-indigo-400" />
              MIT Open Source
            </span>
          </div>
        </div>
      )}

      {/* Step 2: Set Master Password for New Wallet */}
      {step === 'CREATE_SET_PASSWORD' && (
        <div className="space-y-5 animate-fade-in">
          <button
            onClick={() => setStep('CHOOSE')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('back')}
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('setMasterPassword')}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('setMasterPasswordDesc')}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmitForCreate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t('passwordPlaceholder')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 pr-10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t('confirmPasswordPlaceholder')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
              ⚠️ {t('passwordHelp')}
            </p>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              {t('continueBtn')}
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Show Generated 12-word Seed Phrase */}
      {step === 'SHOW_SEED' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('secretPhraseTitle')}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('secretPhraseDesc')}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{t('secretPhraseWarning')}</span>
          </div>

          {/* Seed Word Grid */}
          <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 p-4">
            <div
              className={`grid grid-cols-3 gap-2 transition-all duration-300 ${
                !revealedSeed ? 'blur-xs select-none' : ''
              }`}
            >
              {seedWords.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs"
                >
                  <span className="text-[10px] font-mono text-slate-400 w-4 text-right">
                    {index + 1}.
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {word}
                  </span>
                </div>
              ))}
            </div>

            {/* Click to Reveal overlay */}
            {!revealedSeed && (
              <div
                onClick={() => setRevealedSeed(true)}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl cursor-pointer backdrop-blur-2xs"
              >
                <Eye className="h-6 w-6 text-white mb-1.5" />
                <span className="text-xs font-semibold text-white drop-shadow-md">
                  {t('clickToRevealSeed')}
                </span>
              </div>
            )}
          </div>

          {/* Controls: Copy and Toggle reveal */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setRevealedSeed((p) => !p)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              {revealedSeed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {revealedSeed ? t('hideSeed') : t('clickToRevealSeed')}
            </button>

            <button
              type="button"
              onClick={handleCopySeed}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              {copiedSeed ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedSeed ? t('seedPhraseCopied') : t('copySeedPhrase')}
            </button>
          </div>

          {/* Finish Button */}
          <button
            onClick={handleFinalizeCreate}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            {isProcessing ? t('loading') : t('iSavedSeedPhrase')}
          </button>
        </div>
      )}

      {/* Step 4: Import Existing Wallet (Seed Phrase or Private Key) */}
      {step === 'IMPORT_SET_PASSWORD' && (
        <div className="space-y-4 animate-fade-in">
          <button
            onClick={() => setStep('CHOOSE')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('back')}
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('importExistingWallet')}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {importType === 'SEED' ? t('importSeedDesc') : t('orImportPrivateKey')}
            </p>
          </div>

          {/* Tab selector for Seed vs Private Key */}
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setImportType('SEED');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                importType === 'SEED'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              12/24 Secret Words
            </button>
            <button
              type="button"
              onClick={() => {
                setImportType('PK');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                importType === 'PK'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Raw Private Key
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {importType === 'SEED' ? t('secretPhraseTitle') : t('yourPrivateKey')}
              </label>
              {importType === 'SEED' ? (
                <textarea
                  rows={3}
                  required
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder={t('enterSeedPlaceholder')}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <input
                  type="password"
                  required
                  value={importInput}
                  onChange={(e) => setImportInput(e.target.value)}
                  placeholder="0x..."
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  {t('setMasterPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  {t('confirm')}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              {isProcessing ? t('loading') : t('importExistingWallet')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
