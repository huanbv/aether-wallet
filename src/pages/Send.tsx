import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  isAddress,
  estimateTransferGas,
  broadcastTransaction,
  formatAddress,
} from '../utils/wallet';
import {
  auditTransactionWithGemini,
  type SecurityAnalysisResult,
} from '../services/aiSecurity';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Send as SendIcon,
  RefreshCw,
  Ban,
  ShieldAlert,
} from 'lucide-react';

interface SendProps {
  onBack: () => void;
}

export const Send: React.FC<SendProps> = ({ onBack }) => {
  const {
    t,
    language,
    currentAccount,
    currentNetwork,
    balance,
    aiGuardEnabled,
    geminiApiKey,
    geminiModel,
    addTransactionRecord,
    refreshBalance,
  } = useApp();

  // Transaction Inputs
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [calldata, setCalldata] = useState('');

  // Gas estimation
  const [gasEstimatedEth, setGasEstimatedEth] = useState('0.00042');
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);

  // Validation
  const [inputError, setInputError] = useState('');

  // AI Security Guard & Blacklist State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<SecurityAnalysisResult | null>(null);
  const [poisoningConfirmed, setPoisoningConfirmed] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);

  // Submission State
  const [isSending, setIsSending] = useState(false);
  const [txSuccessHash, setTxSuccessHash] = useState<string | null>(null);

  // Auto-audit on debounced recipient address change
  useEffect(() => {
    if (!recipient || recipient.trim().length < 10) {
      setAuditResult(null);
      setPoisoningConfirmed(false);
      setBypassWarning(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (isAddress(recipient.trim())) {
        try {
          setIsAuditing(true);
          const result = await auditTransactionWithGemini(
            {
              toAddress: recipient.trim(),
              userAddress: currentAccount?.address,
              value: amount.trim() || '0',
              calldata: calldata.trim() || '0x',
              chainId: currentNetwork.chainId,
              networkName: currentNetwork.name,
              tokenSymbol: currentNetwork.symbol,
            },
            { apiKey: geminiApiKey, model: geminiModel }
          );
          setAuditResult(result);
        } catch (e) {
          console.warn('Auto audit error:', e);
        } finally {
          setIsAuditing(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [recipient, calldata, amount, currentAccount?.address, currentNetwork, geminiApiKey, geminiModel]);

  // Update Gas estimate on input changes
  useEffect(() => {
    async function updateGas() {
      if (!currentAccount || !isAddress(recipient)) return;
      try {
        setIsEstimatingGas(true);
        const est = await estimateTransferGas(
          currentNetwork.rpcUrl,
          currentAccount.address,
          recipient,
          amount || '0',
          calldata
        );
        setGasEstimatedEth(est.totalGasEth);
      } catch (e) {
        console.warn('Gas estimate error:', e);
      } finally {
        setIsEstimatingGas(false);
      }
    }

    const timer = setTimeout(updateGas, 400);
    return () => clearTimeout(timer);
  }, [recipient, amount, calldata, currentAccount, currentNetwork.rpcUrl]);

  // Manual trigger if user wants fresh evaluation
  const handleTriggerAIAudit = async () => {
    if (!isAddress(recipient)) {
      setInputError(t('invalidRecipient'));
      return;
    }

    setInputError('');
    setIsAuditing(true);
    setAuditResult(null);
    setPoisoningConfirmed(false);
    setBypassWarning(false);

    try {
      const result = await auditTransactionWithGemini(
        {
          toAddress: recipient.trim(),
          userAddress: currentAccount?.address,
          value: amount.trim() || '0',
          calldata: calldata.trim() || '0x',
          chainId: currentNetwork.chainId,
          networkName: currentNetwork.name,
          tokenSymbol: currentNetwork.symbol,
        },
        { apiKey: geminiApiKey, model: geminiModel }
      );

      setAuditResult(result);
    } catch (err) {
      console.error('Audit exception:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Sign and broadcast transaction
  const handleConfirmSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    if (!currentAccount) return;

    if (!isAddress(recipient)) {
      setInputError(t('invalidRecipient'));
      return;
    }

    const valNum = parseFloat(amount);
    if (isNaN(valNum) || valNum <= 0) {
      setInputError(t('invalidAmount'));
      return;
    }

    const balNum = parseFloat(balance);
    const gasNum = parseFloat(gasEstimatedEth);
    if (valNum + gasNum > balNum) {
      setInputError(t('insufficientFunds'));
      return;
    }

    // 1. HARD BLOCK: If address is on Blacklist, completely prevent sending
    if (auditResult?.blacklistCheck?.isBlocked || auditResult?.riskLevel === 'MALICIOUS') {
      setInputError(t('addressBlockedAlert'));
      return;
    }

    // 2. Address Poisoning checkpoint
    if (auditResult?.blacklistCheck?.isPoisoningRisk && !poisoningConfirmed) {
      setInputError(t('addressPoisoningAlert'));
      return;
    }

    // 3. AI Guard Suspicious warning bypass checkpoint
    if (
      aiGuardEnabled &&
      auditResult &&
      auditResult.riskLevel === 'SUSPICIOUS' &&
      !bypassWarning &&
      !poisoningConfirmed
    ) {
      setInputError(t('aiBypassWarning'));
      return;
    }

    try {
      setIsSending(true);
      const hash = await broadcastTransaction(
        currentNetwork.rpcUrl,
        currentAccount.privateKey,
        currentNetwork.chainId,
        recipient.trim(),
        amount.trim(),
        calldata.trim() || '0x'
      );

      setTxSuccessHash(hash);
      addTransactionRecord({
        hash,
        from: currentAccount.address,
        to: recipient.trim(),
        amount: amount.trim(),
        symbol: currentNetwork.symbol,
        networkId: currentNetwork.id,
        networkName: currentNetwork.name,
        timestamp: Date.now(),
        status: 'confirmed',
      });

      refreshBalance();
    } catch (err: any) {
      console.error('Transaction broadcast error:', err);
      setInputError(err?.message || 'Transaction failed. Check RPC or balance.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMaxAmount = () => {
    const balNum = parseFloat(balance);
    const gasNum = parseFloat(gasEstimatedEth);
    const maxVal = Math.max(0, balNum - gasNum).toFixed(4);
    setAmount(maxVal);
  };

  const totalCost = (
    parseFloat(amount || '0') + parseFloat(gasEstimatedEth || '0')
  ).toFixed(5);

  const isHardBlocked = Boolean(
    auditResult?.blacklistCheck?.isBlocked || auditResult?.riskLevel === 'MALICIOUS'
  );

  return (
    <div className="flex-1 flex flex-col p-4 animate-fade-in max-w-md mx-auto w-full space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </button>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {t('sendTitle')}
        </span>
        <div className="w-10" />
      </div>

      {/* Success View */}
      {txSuccessHash ? (
        <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 shadow-xl text-center space-y-4 animate-fade-in">
          <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {t('transactionSubmitted')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono break-all">
              Tx: {txSuccessHash}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {currentNetwork.explorerUrl && (
              <a
                href={`${currentNetwork.explorerUrl}/tx/${txSuccessHash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition"
              >
                <span>{t('viewTransaction')}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <button
              onClick={onBack}
              className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmSend} className="space-y-3.5">
          {inputError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          {/* CRITICAL BLACKLIST BANNER */}
          {isHardBlocked && (
            <div className="p-3.5 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 space-y-2 animate-bounce-short">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Ban className="h-4 w-4 shrink-0 text-white" />
                <span>{t('addressBlockedAlert')}</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-95">
                {language === 'vi'
                  ? auditResult?.blacklistCheck?.reasonVI || auditResult?.summaryVI
                  : auditResult?.blacklistCheck?.reasonEN || auditResult?.summaryEN}
              </p>
            </div>
          )}

          {/* ADDRESS POISONING WARNING BANNER */}
          {auditResult?.blacklistCheck?.isPoisoningRisk && !isHardBlocked && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{t('addressPoisoningAlert')}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {language === 'vi'
                  ? auditResult.blacklistCheck.reasonVI
                  : auditResult.blacklistCheck.reasonEN}
              </p>
              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none text-[11px] font-semibold text-amber-900 dark:text-amber-100">
                <input
                  type="checkbox"
                  checked={poisoningConfirmed}
                  onChange={(e) => setPoisoningConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span>{t('addressPoisoningConfirmed')}</span>
              </label>
            </div>
          )}

          {/* Recipient Address */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t('recipientAddress')}
              </label>
              {isAuditing && (
                <span className="flex items-center gap-1 text-[10px] text-indigo-500 animate-pulse font-mono">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                  Checking Security...
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
              }}
              placeholder="0x..."
              className={`w-full text-xs font-mono rounded-xl border p-3 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                isHardBlocked
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 focus:ring-rose-500'
                  : auditResult?.blacklistCheck?.isPoisoningRisk
                  ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20 focus:ring-amber-500'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-indigo-500'
              }`}
            />
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>{t('amount')}</span>
              <span className="text-slate-400 font-mono">
                {t('availableBalance')}: {balance} {currentNetwork.symbol}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                placeholder="0.0"
                className="w-full text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 pr-20 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute right-2 top-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleMaxAmount}
                  className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-[11px] font-semibold transition cursor-pointer"
                >
                  {t('maxAmount')}
                </button>
                <span className="text-xs font-semibold text-slate-400">
                  {currentNetwork.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Collapsible Advanced Calldata */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((p) => !p)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <span>{t('advancedCalldata')}</span>
              {showAdvanced ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-2 animate-fade-in">
                <input
                  type="text"
                  value={calldata}
                  onChange={(e) => {
                    setCalldata(e.target.value);
                  }}
                  placeholder={t('calldataPlaceholder')}
                  className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />

                {auditResult?.decodedCalldata && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-1">
                    <div className="font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                      Decoded: {auditResult.decodedCalldata.method}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {language === 'vi'
                        ? auditResult.decodedCalldata.descriptionVI
                        : auditResult.decodedCalldata.descriptionEN}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gas & Total Summary Card */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>{t('gasFeeEstimated')}</span>
              <span className="font-mono">
                {isEstimatingGas ? '...' : `${gasEstimatedEth} ${currentNetwork.symbol}`}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>{t('totalCost')}</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {totalCost} {currentNetwork.symbol}
              </span>
            </div>
          </div>

          {/* Gemini AI Transaction Guard Inspection Panel */}
          {aiGuardEnabled && (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-purple-50/30 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {t('aiGuardTitle')}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {geminiApiKey ? 'Google Gemini (your key)' : t('aiLocalModeBadge')}
                    </span>
                  </div>
                </div>

                {!auditResult && !isAuditing && isAddress(recipient) && (
                  <button
                    type="button"
                    onClick={handleTriggerAIAudit}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition cursor-pointer shadow-xs"
                  >
                    <Cpu className="h-3 w-3" />
                    <span>Audit</span>
                  </button>
                )}
              </div>

              {/* Loading State */}
              {isAuditing && (
                <div className="flex items-center gap-2 py-3 text-xs text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{t('aiAnalyzing')}</span>
                </div>
              )}

              {/* Audit Results View */}
              {auditResult && !isAuditing && (
                <div className="space-y-2.5 animate-fade-in text-xs">
                  {/* Risk Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        auditResult.riskLevel === 'SAFE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : auditResult.riskLevel === 'SUSPICIOUS'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {auditResult.riskLevel === 'SAFE' ? (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      ) : auditResult.riskLevel === 'SUSPICIOUS' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <AlertOctagon className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {auditResult.riskLevel === 'SAFE'
                          ? t('aiSafeBadge')
                          : auditResult.riskLevel === 'SUSPICIOUS'
                          ? t('aiSuspiciousBadge')
                          : t('aiMaliciousBadge')}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {t('aiRiskScore')}:{' '}
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {auditResult.riskScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    {language === 'vi' ? auditResult.summaryVI : auditResult.summaryEN}
                  </p>

                  {/* Warning Points */}
                  {(language === 'vi'
                    ? auditResult.warningPointsVI
                    : auditResult.warningPointsEN
                  ).length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="font-semibold text-[11px] text-slate-600 dark:text-slate-400">
                        {t('aiWarningNotes')}:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                        {(language === 'vi'
                          ? auditResult.warningPointsVI
                          : auditResult.warningPointsEN
                        ).map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {t('aiRecommendation')}:
                    </span>{' '}
                    {language === 'vi'
                      ? auditResult.recommendationVI
                      : auditResult.recommendationEN}
                  </div>

                  {/* Bypass checkbox if flagged as suspicious (and not hard blocked) */}
                  {auditResult.riskLevel === 'SUSPICIOUS' &&
                    !isHardBlocked &&
                    !auditResult.blacklistCheck?.isPoisoningRisk && (
                      <label className="flex items-center gap-2 pt-1 text-amber-700 dark:text-amber-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={bypassWarning}
                          onChange={(e) => setBypassWarning(e.target.checked)}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-[11px] font-semibold">
                          {t('aiBypassWarning')}
                        </span>
                      </label>
                    )}
                </div>
              )}
            </div>
          )}

          {/* Action Button: Hard blocked if address is in blacklist */}
          <button
            type="submit"
            disabled={isSending || isAuditing || isHardBlocked}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold shadow-md transition cursor-pointer ${
              isHardBlocked
                ? 'bg-rose-600 text-white opacity-80 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-indigo-600/20'
            }`}
          >
            {isHardBlocked ? (
              <>
                <Ban className="h-4 w-4" />
                <span>{t('blockedActionBtn')}</span>
              </>
            ) : isSending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{t('loading')}</span>
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4" />
                <span>{t('confirmSendBtn')}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
