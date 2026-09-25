import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatAddress } from '../utils/wallet';
import {
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onOpenNetworkModal: () => void;
  onOpenAccountModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNetworkModal,
  onOpenAccountModal,
}) => {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    currentNetwork,
    currentAccount,
    isUnlocked,
    lockWallet,
    aiGuardEnabled,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentAccount) return;
    navigator.clipboard.writeText(currentAccount.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative z-30 flex items-center justify-between border-b px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Brand & Network Selector */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20 text-white font-bold text-sm">
            <span className="tracking-tighter">Æ</span>
            {aiGuardEnabled && (
              <span
                title="Gemini AI Guard Active"
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white ring-2 ring-white dark:ring-slate-900"
              >
                <Sparkles className="h-2 w-2" />
              </span>
            )}
          </div>
        </div>

        {/* Network Button */}
        <button
          onClick={onOpenNetworkModal}
          type="button"
          className="group flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all cursor-pointer shadow-xs"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              currentNetwork.isTestnet ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
          />
          <span className="max-w-[95px] truncate">{currentNetwork.name}</span>
          <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        </button>
      </div>

      {/* Right Controls: Account badge, Language, Theme, Lock */}
      <div className="flex items-center gap-1.5">
        {/* Account Pill (if unlocked) */}
        {isUnlocked && currentAccount && (
          <button
            onClick={onOpenAccountModal}
            type="button"
            className="group flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            <span className="font-mono text-[11px]">
              {formatAddress(currentAccount.address)}
            </span>
            <span
              onClick={handleCopyAddress}
              title={copied ? t('copied') : t('copy')}
              className="ml-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </span>
          </button>
        )}

        {/* Language Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu((p) => !p)}
            type="button"
            title={t('languageSetting')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-xs font-semibold"
          >
            {language.toUpperCase()}
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-xl z-50 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  setShowLangMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                  language === 'en'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="h-3 w-3" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('vi');
                  setShowLangMenu(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition ${
                  language === 'vi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Tiếng Việt</span>
                {language === 'vi' && <Check className="h-3 w-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          type="button"
          title={theme === 'dark' ? t('themeLight') : t('themeDark')}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-indigo-600" />
          )}
        </button>

        {/* Lock Wallet Button (if unlocked) */}
        {isUnlocked && (
          <button
            onClick={lockWallet}
            type="button"
            title={t('lockWallet')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
