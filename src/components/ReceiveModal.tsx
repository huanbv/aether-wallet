import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Check, QrCode, AlertTriangle, ExternalLink } from 'lucide-react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose }) => {
  const { t, currentAccount, currentNetwork } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentAccount) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAccount.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate SVG-based QR visual representation
  // We can render a high-contrast QR matrix pattern or standard QR image
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentAccount.address}&bgcolor=ffffff&color=0f172a&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 text-slate-800 dark:text-slate-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="text-center mb-4">
          <div className="inline-flex p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-2">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-lg">{t('receiveTitle')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-0.5">
            {t('scanQrToPay')}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 mb-4">
          <img
            src={qrDataUrl}
            alt="Wallet QR Code"
            className="w-48 h-48 rounded-xl object-contain"
            loading="eager"
          />
        </div>

        {/* Network reminder badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 text-[11px] mb-4 text-center font-medium">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>
            {currentNetwork.name} ({currentNetwork.symbol})
          </span>
        </div>

        {/* Address Display Box */}
        <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-between gap-2">
          <span className="font-mono text-xs break-all text-slate-700 dark:text-slate-300 select-all">
            {currentAccount.address}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {t('copyWalletAddress')}
            </>
          )}
        </button>

        {currentNetwork.explorerUrl && (
          <a
            href={`${currentNetwork.explorerUrl}/address/${currentAccount.address}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <span>{t('viewOnExplorer')}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};
