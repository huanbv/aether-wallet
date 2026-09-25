import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatAddress } from '../utils/wallet';
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Coins,
  History,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface DashboardProps {
  onNavigateToSend: () => void;
  onOpenReceive: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToSend,
  onOpenReceive,
}) => {
  const {
    t,
    currentAccount,
    currentNetwork,
    balance,
    isRefreshingBalance,
    refreshBalance,
    transactions,
    aiGuardEnabled,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TOKENS' | 'ACTIVITY'>('TOKENS');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!currentAccount) return;
    navigator.clipboard.writeText(currentAccount.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Approximate USD value for UI feel
  const estimatedPriceUsd =
    currentNetwork.symbol === 'ETH' || currentNetwork.symbol === 'SepoliaETH'
      ? 2650
      : currentNetwork.symbol === 'BNB'
      ? 580
      : currentNetwork.symbol === 'POL'
      ? 0.45
      : 1.0;

  const totalUsd = (parseFloat(balance || '0') * estimatedPriceUsd).toFixed(2);

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 animate-fade-in max-w-md mx-auto w-full">
      {/* Account Info Pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            {(currentAccount?.index || 0) + 1}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {currentAccount?.name || 'Account 1'}
            </div>
            <button
              onClick={handleCopy}
              className="group flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <span>{formatAddress(currentAccount?.address)}</span>
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        {/* AI Guard Status indicator */}
        {aiGuardEnabled && (
          <div
            title="Gemini AI Security Guard Active"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[10px] text-indigo-700 dark:text-indigo-300 font-medium"
          >
            <Sparkles className="h-2.5 w-2.5 text-indigo-500 animate-pulse" />
            <span>AI Guard</span>
          </div>
        )}
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/20 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-indigo-200 text-xs">
            <span>{t('totalBalance')}</span>
            <button
              onClick={refreshBalance}
              disabled={isRefreshingBalance}
              title={t('refresh')}
              className="rounded-lg p-1 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshingBalance ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight font-mono">
              {balance}
            </span>
            <span className="text-sm font-semibold text-indigo-200">
              {currentNetwork.symbol}
            </span>
          </div>

          <div className="mt-1 text-xs text-indigo-200/90 font-mono">
            ≈ ${totalUsd} USD
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onNavigateToSend}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs shadow-md transition cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4 text-indigo-600" />
            {t('send')}
          </button>

          <button
            onClick={onOpenReceive}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-md border border-white/20 transition cursor-pointer"
          >
            <ArrowDownLeft className="h-4 w-4 text-white" />
            {t('receive')}
          </button>
        </div>
      </div>

      {/* Tabs: Tokens / Activity */}
      <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('TOKENS')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
            activeTab === 'TOKENS'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Coins className="h-3.5 w-3.5" />
          {t('tokensTab')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACTIVITY')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
            activeTab === 'ACTIVITY'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          {t('activityTab')}
          {transactions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px]">
              {transactions.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content: Tokens */}
      {activeTab === 'TOKENS' && (
        <div className="space-y-2">
          {/* Native Token Item */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentNetwork.symbol.slice(0, 3)}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {currentNetwork.symbol}
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal">
                    {t('nativeToken')}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {currentNetwork.name}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {balance}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                ≈ ${totalUsd}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Activity History */}
      {activeTab === 'ACTIVITY' && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <History className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">{t('noActivityYet')}</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{t('send')}</span>
                      <span className="font-mono text-slate-400">
                        {formatAddress(tx.to)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-medium">Confirmed</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    -{tx.amount} {tx.symbol}
                  </div>
                  {currentNetwork.explorerUrl && (
                    <a
                      href={`${currentNetwork.explorerUrl}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
