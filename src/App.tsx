/**
 * @license
 * SPDX-License-Identifier: MIT
 * AetherWallet - Open-Source Non-Custodial Web3 Extension Wallet
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StorageEngine } from './utils/crypto';
import { checkForUpdate, type UpdateInfo } from './services/updateCheck';
import { Header } from './components/Header';
import { Welcome } from './pages/Welcome';
import { Dashboard } from './pages/Dashboard';
import { Send } from './pages/Send';
import { Settings } from './pages/Settings';
import { UnlockScreen } from './components/UnlockScreen';
import { NetworkModal } from './components/NetworkModal';
import { AccountModal } from './components/AccountModal';
import { ReceiveModal } from './components/ReceiveModal';
import {
  Wallet,
  Send as SendIcon,
  Settings as SettingsIcon,
  Smartphone,
  Maximize2,
  Minimize2,
  Sparkles,
  Lock,
  Download,
  X,
} from 'lucide-react';

const UPDATE_CACHE_KEY = 'aether_update_cache';
const UPDATE_DISMISSED_KEY = 'aether_update_dismissed_version';
const UPDATE_CHECK_TTL_MS = 6 * 60 * 60 * 1000; // re-check at most every 6 hours

/**
 * Banner shown when a newer GitHub Release exists. Checks are throttled to once
 * every 6 hours (cached in storage) and a dismissed version stays hidden until
 * an even newer version is published.
 */
function UpdateBanner() {
  const { t } = useApp();
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setDismissedVersion(await StorageEngine.get<string>(UPDATE_DISMISSED_KEY));

        const cached = await StorageEngine.get<{ checkedAt: number; info: UpdateInfo }>(
          UPDATE_CACHE_KEY
        );
        if (cached && Date.now() - cached.checkedAt < UPDATE_CHECK_TTL_MS) {
          if (!cancelled) setInfo(cached.info);
          return;
        }

        const fresh = await checkForUpdate();
        if (fresh) {
          await StorageEngine.set(UPDATE_CACHE_KEY, { checkedAt: Date.now(), info: fresh });
          if (!cancelled) setInfo(fresh);
        }
      } catch {
        /* offline / not an extension — no banner */
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    if (info) {
      StorageEngine.set(UPDATE_DISMISSED_KEY, info.latestVersion);
      setDismissedVersion(info.latestVersion);
    }
  };

  if (!info || !info.available || dismissedVersion === info.latestVersion) {
    return null;
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mb-2 px-3 py-2 rounded-xl bg-indigo-600 text-white flex items-center justify-between gap-2 shadow-md shadow-indigo-600/30">
      <div className="flex items-center gap-2 text-[11px] font-semibold min-w-0">
        <Download className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {t('updateAvailableTitle')} — v{info.latestVersion}
        </span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href={info.releaseUrl}
          target="_blank"
          rel="noreferrer"
          className="px-2.5 py-1 rounded-lg bg-white text-indigo-700 text-[11px] font-bold hover:bg-indigo-50 transition"
        >
          {t('updateDownloadBtn')}
        </a>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="p-1 rounded-lg hover:bg-indigo-500 transition cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function WalletAppContent() {
  const { hasVault, isUnlocked, isLoading, t } = useApp();

  // Active view: 'DASHBOARD' | 'SEND' | 'SETTINGS'
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'SEND' | 'SETTINGS'>('DASHBOARD');

  // Modals
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  // Viewport mode: 'popup' (380x600px Chrome Extension) or 'expanded' (full responsive)
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xl animate-pulse shadow-lg shadow-indigo-500/30">
            Æ
          </div>
          <span className="text-xs font-mono text-slate-400 tracking-wider">
            AETHER WALLET...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-indigo-500 selection:text-white">
      {/* New-version notification (checks GitHub Releases) */}
      <UpdateBanner />

      {/* Extension Simulator Frame Switcher (for web preview) */}
      <div className="w-full max-w-sm sm:max-w-md mb-2 px-3 py-1 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-[11px] font-semibold text-slate-300">
            AetherWallet Extension V3
          </span>
        </div>

        <button
          onClick={() => setIsExpanded((p) => !p)}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer text-[10px]"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="h-3 w-3" />
              <span>Popup Size (380px)</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3 w-3" />
              <span>Expanded</span>
            </>
          )}
        </button>
      </div>

      {/* Main Extension Container */}
      <div
        className={`w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-none sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300 ${
          isExpanded
            ? 'max-w-2xl min-h-[640px]'
            : 'max-w-sm w-[380px] min-h-[600px] h-[600px]'
        }`}
      >
        {/* Persistent Header */}
        <Header
          onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
        />

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {!hasVault ? (
            <Welcome />
          ) : !isUnlocked ? (
            <UnlockScreen />
          ) : currentView === 'SEND' ? (
            <Send onBack={() => setCurrentView('DASHBOARD')} />
          ) : currentView === 'SETTINGS' ? (
            <Settings
              onBack={() => setCurrentView('DASHBOARD')}
              onOpenNetworkModal={() => setIsNetworkModalOpen(true)}
            />
          ) : (
            <Dashboard
              onNavigateToSend={() => setCurrentView('SEND')}
              onOpenReceive={() => setIsReceiveModalOpen(true)}
            />
          )}
        </main>

        {/* Bottom Tab Navigation Bar (When Unlocked) */}
        {hasVault && isUnlocked && (
          <nav className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 flex items-center justify-around z-20">
            <button
              onClick={() => setCurrentView('DASHBOARD')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                currentView === 'DASHBOARD'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Wallet className="h-4 w-4" />
              <span className="text-[10px]">{t('tokensTab')}</span>
            </button>

            <button
              onClick={() => setCurrentView('SEND')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                currentView === 'SEND'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <SendIcon className="h-4 w-4" />
              <span className="text-[10px]">{t('send')}</span>
            </button>

            <button
              onClick={() => setCurrentView('SETTINGS')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                currentView === 'SETTINGS'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="text-[10px]">{t('settingsTitle')}</span>
            </button>
          </nav>
        )}

        {/* Global Modals */}
        <NetworkModal
          isOpen={isNetworkModalOpen}
          onClose={() => setIsNetworkModalOpen(false)}
        />
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onOpenReceive={() => setIsReceiveModalOpen(true)}
        />
        <ReceiveModal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <WalletAppContent />
    </AppProvider>
  );
}
