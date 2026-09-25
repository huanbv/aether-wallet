import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatAddress } from '../utils/wallet';
import { X, User, Plus, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReceive: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onOpenReceive,
}) => {
  const {
    t,
    accounts,
    currentAccountIndex,
    switchAccount,
    createNextAccount,
    mnemonic,
    currentNetwork,
  } = useApp();

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (address: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCreateAccount = async () => {
    try {
      setIsCreating(true);
      await createNextAccount();
    } catch (e: any) {
      alert(e?.message || 'Error creating account');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 text-slate-800 dark:text-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-base">{t('switchAccount')}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Accounts List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {accounts.map((acc, idx) => {
            const isSelected = idx === currentAccountIndex;

            return (
              <div
                key={acc.address + idx}
                onClick={() => {
                  switchAccount(idx);
                  onClose();
                }}
                className={`group flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {acc.index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {acc.name}
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {formatAddress(acc.address)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleCopy(acc.address, idx, e)}
                    title={copiedIdx === idx ? t('copied') : t('copy')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    {copiedIdx === idx ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {mnemonic && (
            <button
              onClick={handleCreateAccount}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? t('loading') : t('createAccount')}
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenReceive();
            }}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {t('receiveSubtitle')}
          </button>
        </div>
      </div>
    </div>
  );
};
