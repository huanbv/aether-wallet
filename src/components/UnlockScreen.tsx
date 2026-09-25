import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, AlertOctagon, RotateCcw, Sparkles } from 'lucide-react';

export const UnlockScreen: React.FC = () => {
  const { t, unlockWallet, resetWallet } = useApp();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setErrorMsg('');
    setIsUnlocking(true);

    const success = await unlockWallet(password);
    if (!success) {
      setErrorMsg(t('incorrectPassword'));
      setIsUnlocking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto w-full animate-fade-in">
      <div className="relative mb-5">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 flex items-center justify-center">
          <div className="h-full w-full rounded-[22px] bg-slate-950 flex items-center justify-center text-white text-3xl font-extrabold tracking-tighter">
            Æ
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-slate-900 text-white">
          <Lock className="h-3 w-3" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {t('unlockTitle')}
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
        {t('unlockDesc')}
      </p>

      {errorMsg && (
        <div className="mt-4 w-full p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
          <AlertOctagon className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleUnlock} className="mt-5 w-full space-y-3">
        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={isUnlocking}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          {isUnlocking ? t('loading') : t('unlockBtn')}
        </button>
      </form>

      {/* Forgot Password / Reset */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
        {!showResetConfirm ? (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
          >
            {t('forgotPasswordReset')}
          </button>
        ) : (
          <div className="space-y-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-left">
            <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
              {t('resetWalletWarning')}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetWallet}
                className="py-1 px-2.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 transition"
              >
                {t('confirmResetWallet')}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px]"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
