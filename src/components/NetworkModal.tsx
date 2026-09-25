import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NetworkConfig } from '../utils/wallet';
import { X, Plus, Check, Trash2, RotateCcw, Globe, ExternalLink } from 'lucide-react';

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({ isOpen, onClose }) => {
  const {
    t,
    networks,
    currentNetwork,
    selectNetwork,
    addCustomNetwork,
    removeNetwork,
    resetNetworksToDefault,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const [chainIdStr, setChainIdStr] = useState('');
  const [symbol, setSymbol] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleAddNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const chainIdNum = parseInt(chainIdStr.trim(), 10);
    if (!name.trim() || !rpcUrl.trim() || isNaN(chainIdNum) || !symbol.trim()) {
      setFormError('Please fill in Name, valid RPC URL, Chain ID, and Symbol.');
      return;
    }

    if (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://')) {
      setFormError('RPC URL must begin with http:// or https://');
      return;
    }

    const newNet: NetworkConfig = {
      id: `custom-${Date.now()}`,
      chainId: chainIdNum,
      name: name.trim(),
      rpcUrl: rpcUrl.trim(),
      symbol: symbol.trim().toUpperCase(),
      decimals: 18,
      explorerUrl: explorerUrl.trim(),
      isTestnet: name.toLowerCase().includes('test') || chainIdNum > 100000,
    };

    await addCustomNetwork(newNet);
    setName('');
    setRpcUrl('');
    setChainIdStr('');
    setSymbol('');
    setExplorerUrl('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-base">{t('selectNetwork')}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!isAdding ? (
          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {networks.map((net) => {
              const isSelected = net.id === currentNetwork.id;
              const isCustom = net.id.startsWith('custom-');

              return (
                <div
                  key={net.id}
                  onClick={() => {
                    selectNetwork(net.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        net.isTestnet ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        {net.name}
                        {net.isTestnet && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-mono">
                            TESTNET
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Chain ID: {net.chainId} • {net.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNetwork(net.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded transition cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('addNetwork')}
              </button>

              <button
                type="button"
                onClick={resetNetworksToDefault}
                title={t('resetNetworksToDefault')}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddNetwork} className="py-3 space-y-3 overflow-y-auto">
            {formError && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                {t('network')} Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('networkNamePlaceholder')}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                RPC URL
              </label>
              <input
                type="url"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder={t('rpcUrlPlaceholder')}
                className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Chain ID
                </label>
                <input
                  type="number"
                  value={chainIdStr}
                  onChange={(e) => setChainIdStr(e.target.value)}
                  placeholder={t('chainIdPlaceholder')}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder={t('symbolPlaceholder')}
                  className="w-full text-xs uppercase font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Block Explorer URL ({t('optional')})
              </label>
              <input
                type="url"
                value={explorerUrl}
                onChange={(e) => setExplorerUrl(e.target.value)}
                placeholder={t('explorerUrlPlaceholder')}
                className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                {t('save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
