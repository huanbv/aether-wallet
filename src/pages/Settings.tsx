import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BlacklistService,
  LOCAL_BLACKLIST,
  type BlacklistEntry,
} from '../services/blacklist';
import { isAddress, formatAddress } from '../utils/wallet';
import { type Language } from '../i18n/locales';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  Shield,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Ban,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Clock,
  KeyRound,
  Save,
} from 'lucide-react';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
];

interface SettingsProps {
  onBack: () => void;
  onOpenNetworkModal: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack, onOpenNetworkModal }) => {
  const {
    t,
    theme,
    toggleTheme,
    language,
    setLanguage,
    aiGuardEnabled,
    setAiGuardEnabled,
    currentAccount,
    mnemonic,
    rawMasterPassword,
    resetWallet,
    geminiModel,
    hasGeminiKey,
    saveGeminiCredentials,
    removeGeminiCredentials,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'BLACKLIST' | 'SECURITY' | 'ABOUT'>('GENERAL');

  // Blacklist Management State
  const [customBlacklist, setCustomBlacklist] = useState<BlacklistEntry[]>([]);
  const [newBlockedAddress, setNewBlockedAddress] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [blacklistError, setBlacklistError] = useState('');
  const [isSyncingBlacklist, setIsSyncingBlacklist] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Reveal Credentials Modal State
  const [revealType, setRevealType] = useState<'NONE' | 'SEED' | 'PK'>('NONE');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revealedContent, setRevealedContent] = useState<string | null>(null);
  const [revealError, setRevealError] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset Wallet Confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // BYOK — Gemini API key form
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState(geminiModel);
  const [savingKey, setSavingKey] = useState(false);
  const [keySavedMsg, setKeySavedMsg] = useState(false);

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    try {
      setSavingKey(true);
      await saveGeminiCredentials(apiKeyInput.trim(), modelInput.trim());
      setApiKeyInput('');
      setKeySavedMsg(true);
      setTimeout(() => setKeySavedMsg(false), 3000);
    } catch (err) {
      console.warn('Save Gemini key failed:', err);
    } finally {
      setSavingKey(false);
    }
  };

  const handleRemoveGeminiKey = async () => {
    await removeGeminiCredentials();
  };

  // Load custom blacklist
  useEffect(() => {
    async function loadList() {
      const list = await BlacklistService.getCustomBlacklist();
      setCustomBlacklist(list);
    }
    loadList();
  }, []);

  const handleAddBlocked = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlacklistError('');

    if (!isAddress(newBlockedAddress.trim())) {
      setBlacklistError(t('invalidRecipient'));
      return;
    }

    await BlacklistService.addCustomBlacklist({
      address: newBlockedAddress.trim(),
      name: 'Custom Blocked Entity',
      category: 'USER_BLOCKED',
      severity: 'CRITICAL',
      reasonEN: newBlockedReason.trim() || 'Blocked by user manually',
      reasonVI: newBlockedReason.trim() || 'Người dùng tự chặn thủ công',
    });

    const updated = await BlacklistService.getCustomBlacklist();
    setCustomBlacklist(updated);
    setNewBlockedAddress('');
    setNewBlockedReason('');
  };

  const handleRemoveBlocked = async (address: string) => {
    await BlacklistService.removeCustomBlacklist(address);
    const updated = await BlacklistService.getCustomBlacklist();
    setCustomBlacklist(updated);
  };

  const handleSyncRemoteBlacklist = async () => {
    try {
      setIsSyncingBlacklist(true);
      await BlacklistService.syncRemoteBlacklist();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncingBlacklist(false);
    }
  };

  const handleRevealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPassword !== rawMasterPassword) {
      setRevealError(t('incorrectPassword'));
      return;
    }

    setRevealError('');
    if (revealType === 'SEED') {
      setRevealedContent(mnemonic || 'Imported via raw private key (no seed phrase)');
    } else if (revealType === 'PK') {
      setRevealedContent(currentAccount?.privateKey || '');
    }
  };

  const handleCopyRevealed = () => {
    if (!revealedContent) return;
    navigator.clipboard.writeText(revealedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeRevealModal = () => {
    setRevealType('NONE');
    setConfirmPassword('');
    setRevealedContent(null);
    setRevealError('');
  };

  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in max-w-md mx-auto w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-indigo-500" />
          <span>{t('settingsTitle')}</span>
        </h2>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          {t('close')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('GENERAL')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeTab === 'GENERAL'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {t('generalTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('BLACKLIST')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeTab === 'BLACKLIST'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {t('blacklistTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeTab === 'SECURITY'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {t('securityTab')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ABOUT')}
          className={`flex-1 py-1.5 rounded-lg transition ${
            activeTab === 'ABOUT'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {t('aboutTab')}
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'GENERAL' && (
        <div className="space-y-3 animate-fade-in text-xs">
          {/* Theme Setting */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {t('themeSetting')}
              </div>
              <div className="text-[11px] text-slate-400">
                {theme === 'dark' ? t('themeDark') : t('themeLight')}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t('themeLight')}</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{t('themeDark')}</span>
                </>
              )}
            </button>
          </div>

          {/* Language Setting */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {t('languageSetting')}
              </div>
              <div className="text-[11px] text-slate-400">
                {LANGUAGES.find((l) => l.code === language)?.label || 'English'}
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* AI Security Guard Toggle */}
          <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/40 dark:to-purple-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {t('aiSecuritySetting')}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Google Gemini 3.8 Flash Engine
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setAiGuardEnabled(!aiGuardEnabled)}
                type="button"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  aiGuardEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    aiGuardEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('aiSecurityDescription')}
            </p>
          </div>

          {/* BYOK — Gemini API Key (encrypted locally, called directly from client) */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <div className="font-bold text-slate-900 dark:text-white">
                {t('geminiApiKeyLabel')}
              </div>
            </div>

            {/* Status badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                hasGeminiKey
                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>{hasGeminiKey ? t('geminiKeyActive') : t('geminiKeyLocalMode')}</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('geminiApiKeyDesc')}
            </p>

            <form onSubmit={handleSaveGeminiKey} className="space-y-2">
              <input
                type="password"
                autoComplete="off"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={t('geminiApiKeyPlaceholder')}
                className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">{t('geminiModelLabel')}</label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder={t('geminiModelPlaceholder')}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={savingKey || !apiKeyInput.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition cursor-pointer"
                >
                  {keySavedMsg ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                  <span>{keySavedMsg ? t('copied') : t('saveGeminiKey')}</span>
                </button>
                {hasGeminiKey && (
                  <button
                    type="button"
                    onClick={handleRemoveGeminiKey}
                    className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    {t('removeGeminiKey')}
                  </button>
                )}
              </div>
            </form>

            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              <span>{t('getGeminiKeyHint')}</span>
            </a>
          </div>

          {/* Manage RPC Networks Button */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {t('manageNetworks')}
              </div>
              <div className="text-[11px] text-slate-400">
                Custom RPC Nodes, Chain IDs & Explorers
              </div>
            </div>

            <button
              onClick={onOpenNetworkModal}
              className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t('manageNetworks')}
            </button>
          </div>
        </div>
      )}

      {/* Blacklist Management Tab */}
      {activeTab === 'BLACKLIST' && (
        <div className="space-y-3.5 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Ban className="h-4 w-4 text-rose-500" />
              <span>{t('blacklistTitle')}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t('blacklistDesc')}
            </p>
          </div>

          {/* Sync Button */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                MetaMask Phishing DB Sync
              </div>
              <div className="text-[10px] text-slate-400">
                Auto-refreshed every 6 hours
              </div>
            </div>

            <button
              onClick={handleSyncRemoteBlacklist}
              disabled={isSyncingBlacklist}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncingBlacklist ? 'animate-spin' : ''}`} />
              <span>{syncSuccess ? 'Synced!' : 'Sync'}</span>
            </button>
          </div>

          {/* Add Custom Blacklist Address Form */}
          <form onSubmit={handleAddBlocked} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              {t('addBlacklistAddress')}
            </span>

            {blacklistError && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[11px]">
                {blacklistError}
              </div>
            )}

            <input
              type="text"
              required
              value={newBlockedAddress}
              onChange={(e) => setNewBlockedAddress(e.target.value)}
              placeholder={t('addressPlaceholder')}
              className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />

            <input
              type="text"
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('addBlacklistAddress')}</span>
            </button>
          </form>

          {/* User Blocked List */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
              Custom Blocked Addresses ({customBlacklist.length})
            </span>

            {customBlacklist.length === 0 ? (
              <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                {t('blacklistEmpty')}
              </div>
            ) : (
              customBlacklist.map((item) => (
                <div
                  key={item.address}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20"
                >
                  <div>
                    <div className="font-mono font-semibold text-rose-700 dark:text-rose-300">
                      {formatAddress(item.address)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {language === 'vi' ? item.reasonVI : item.reasonEN}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveBlocked(item.address)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title={t('delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Preloaded Known Drainer Threats */}
          <div className="space-y-1.5 pt-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px] block">
              Global Built-in Threat DB ({LOCAL_BLACKLIST.length} Verified Entries)
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {LOCAL_BLACKLIST.map((b) => (
                <div
                  key={b.address}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{b.name}</span>
                      <span className="text-[9px] px-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 font-mono">
                        {b.category}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {formatAddress(b.address)}
                    </div>
                  </div>
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security & Credentials */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-3 animate-fade-in text-xs">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{t('securityCaution')}</span>
          </div>

          {/* Export Seed Phrase */}
          {mnemonic && (
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('exportSeedPhrase')}
                </div>
                <div className="text-[11px] text-slate-400">
                  12 Secret Recovery Words
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRevealType('SEED')}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t('viewRecoveryPhrase')}
              </button>
            </div>
          )}

          {/* Export Private Key */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {t('exportPrivateKey')}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Active EVM Private Key
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRevealType('PK')}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t('viewPrivateKey')}
            </button>
          </div>

          {/* Reset Entire Wallet */}
          <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
            <div>
              <div className="font-bold text-rose-600 dark:text-rose-400">
                {t('resetWalletData')}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {t('resetWalletWarning')}
              </p>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer"
              >
                {t('resetWalletData')}
              </button>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetWallet}
                  className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer"
                >
                  {t('confirmResetWallet')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'ABOUT' && (
        <div className="space-y-3 animate-fade-in text-xs">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-md">
              Æ
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              AetherWallet
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('version')}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {t('openSourceDesc')}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>License</span>
              <span className="font-semibold text-emerald-500">MIT (Open Source)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>PBKDF2 Hardening</span>
              <span className="font-mono text-indigo-500">310,000 Iterations</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Phishing Shield</span>
              <span className="font-mono text-rose-500">MetaMask DB + Poisoning Guard</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>AI Engine</span>
              <span className="font-mono text-cyan-500">Google Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      )}

      {/* Password verification / Credential Reveal Modal */}
      {revealType !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 text-slate-800 dark:text-slate-100 space-y-3">
            <h3 className="font-bold text-sm">
              {revealType === 'SEED' ? t('secretPhraseTitle') : t('yourPrivateKey')}
            </h3>

            {!revealedContent ? (
              <form onSubmit={handleRevealSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('enterPasswordToConfirm')}
                </p>

                {revealError && (
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-xs">
                    {revealError}
                  </div>
                )}

                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={closeRevealModal}
                    className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    {t('confirm')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-xs text-slate-900 dark:text-white break-all select-all">
                    {revealedContent}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRevealed}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? t('copied') : t('copy')}</span>
                  </button>
                  <button
                    onClick={closeRevealModal}
                    className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
