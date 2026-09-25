import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  type Language,
  type TranslationDictionary,
  translations,
} from '../i18n/locales';
import {
  type WalletAccount,
  type NetworkConfig,
  DEFAULT_NETWORKS,
  deriveAccountFromMnemonic,
  importAccountFromPrivateKey,
  fetchAccountBalance,
} from '../utils/wallet';
import {
  encryptData,
  decryptData,
  StorageEngine,
  type EncryptedPayload,
} from '../utils/crypto';

export interface TransactionRecord {
  hash: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  networkId: string;
  networkName: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
}

interface VaultData {
  mnemonic: string | null;
  accounts: WalletAccount[];
  createdAt: number;
}

interface AppContextType {
  // Theme & Language
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary) => string;

  // Vault State
  hasVault: boolean;
  isUnlocked: boolean;
  isLoading: boolean;
  accounts: WalletAccount[];
  currentAccountIndex: number;
  currentAccount: WalletAccount | null;
  mnemonic: string | null;
  rawMasterPassword: string | null;

  // Wallet Lifecycle
  createWallet: (password: string, customMnemonic?: string) => Promise<WalletAccount>;
  importPrivateKey: (password: string, privateKey: string, accountName?: string) => Promise<WalletAccount>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  resetWallet: () => Promise<void>;
  createNextAccount: () => Promise<WalletAccount>;
  switchAccount: (index: number) => void;

  // Networks & RPC
  networks: NetworkConfig[];
  currentNetwork: NetworkConfig;
  selectNetwork: (networkId: string) => void;
  addCustomNetwork: (net: NetworkConfig) => Promise<void>;
  removeNetwork: (networkId: string) => Promise<void>;
  resetNetworksToDefault: () => Promise<void>;

  // Balances & Activity
  balance: string;
  isRefreshingBalance: boolean;
  refreshBalance: () => Promise<void>;
  transactions: TransactionRecord[];
  addTransactionRecord: (tx: TransactionRecord) => void;

  // AI Security Guard Settings
  aiGuardEnabled: boolean;
  setAiGuardEnabled: (enabled: boolean) => void;
}

const STORAGE_KEYS = {
  VAULT: 'aether_encrypted_vault',
  THEME: 'aether_theme',
  LANG: 'aether_lang',
  NETWORKS: 'aether_custom_networks',
  SELECTED_NET: 'aether_selected_network_id',
  SELECTED_ACC_IDX: 'aether_selected_account_idx',
  TX_HISTORY: 'aether_tx_history',
  AI_GUARD: 'aether_ai_guard_enabled',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguageState] = useState<Language>('en');
  const [hasVault, setHasVault] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [rawMasterPassword, setRawMasterPassword] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number>(0);

  const [networks, setNetworks] = useState<NetworkConfig[]>(DEFAULT_NETWORKS);
  const [currentNetworkId, setCurrentNetworkId] = useState<string>(DEFAULT_NETWORKS[0].id);

  const [balance, setBalance] = useState<string>('0.00');
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [aiGuardEnabled, setAiGuardEnabledState] = useState<boolean>(true);

  // Initialize storage preferences on load
  useEffect(() => {
    async function initApp() {
      try {
        setIsLoading(true);

        // Load Theme
        const savedTheme = await StorageEngine.get<'dark' | 'light'>(STORAGE_KEYS.THEME);
        const resolvedTheme = savedTheme === 'light' ? 'light' : 'dark';
        setTheme(resolvedTheme);
        if (resolvedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Load Language
        const savedLang = await StorageEngine.get<Language>(STORAGE_KEYS.LANG);
        if (savedLang === 'vi' || savedLang === 'en') {
          setLanguageState(savedLang);
        }

        // Load AI Guard toggle
        const savedAiGuard = await StorageEngine.get<boolean>(STORAGE_KEYS.AI_GUARD);
        if (savedAiGuard !== null && savedAiGuard !== undefined) {
          setAiGuardEnabledState(Boolean(savedAiGuard));
        }

        // Load Custom Networks
        const savedNets = await StorageEngine.get<NetworkConfig[]>(STORAGE_KEYS.NETWORKS);
        if (savedNets && Array.isArray(savedNets) && savedNets.length > 0) {
          setNetworks(savedNets);
        }

        // Load Selected Network
        const savedNetId = await StorageEngine.get<string>(STORAGE_KEYS.SELECTED_NET);
        if (savedNetId) {
          setCurrentNetworkId(savedNetId);
        }

        // Load Selected Account Index
        const savedAccIdx = await StorageEngine.get<number>(STORAGE_KEYS.SELECTED_ACC_IDX);
        if (typeof savedAccIdx === 'number') {
          setCurrentAccountIndex(savedAccIdx);
        }

        // Load Transactions
        const savedTxs = await StorageEngine.get<TransactionRecord[]>(STORAGE_KEYS.TX_HISTORY);
        if (savedTxs && Array.isArray(savedTxs)) {
          setTransactions(savedTxs);
        }

        // Check if Encrypted Vault exists
        const vault = await StorageEngine.get<EncryptedPayload>(STORAGE_KEYS.VAULT);
        setHasVault(Boolean(vault && vault.ciphertext));
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  // Sync theme changes to HTML root
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      StorageEngine.set(STORAGE_KEYS.THEME, next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    StorageEngine.set(STORAGE_KEYS.LANG, lang);
  }, []);

  const t = useCallback(
    (key: keyof TranslationDictionary): string => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || String(key);
    },
    [language]
  );

  const setAiGuardEnabled = useCallback((enabled: boolean) => {
    setAiGuardEnabledState(enabled);
    StorageEngine.set(STORAGE_KEYS.AI_GUARD, enabled);
  }, []);

  const currentNetwork =
    networks.find((n) => n.id === currentNetworkId) || networks[0] || DEFAULT_NETWORKS[0];
  const currentAccount = accounts[currentAccountIndex] || accounts[0] || null;

  // Refresh Account Balance on network or account switch
  const refreshBalance = useCallback(async () => {
    if (!currentAccount || !currentNetwork) {
      setBalance('0.00');
      return;
    }

    try {
      setIsRefreshingBalance(true);
      const b = await fetchAccountBalance(currentNetwork.rpcUrl, currentAccount.address);
      setBalance(b);
    } catch (e) {
      console.warn('Balance refresh failed:', e);
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [currentAccount, currentNetwork]);

  useEffect(() => {
    if (isUnlocked && currentAccount) {
      refreshBalance();
    }
  }, [isUnlocked, currentAccount?.address, currentNetwork?.id, refreshBalance]);

  // Create New Wallet Vault
  const createWallet = async (
    password: string,
    customMnemonic?: string
  ): Promise<WalletAccount> => {
    const finalMnemonic = customMnemonic ? customMnemonic.trim().toLowerCase() : '';
    if (!finalMnemonic) {
      throw new Error('Mnemonic required to create wallet');
    }

    const firstAccount = await deriveAccountFromMnemonic(finalMnemonic, 0, 'Account 1');
    const vaultData: VaultData = {
      mnemonic: finalMnemonic,
      accounts: [firstAccount],
      createdAt: Date.now(),
    };

    const encryptedPayload = await encryptData(JSON.stringify(vaultData), password);
    await StorageEngine.set(STORAGE_KEYS.VAULT, encryptedPayload);

    setRawMasterPassword(password);
    setMnemonic(finalMnemonic);
    setAccounts([firstAccount]);
    setCurrentAccountIndex(0);
    setHasVault(true);
    setIsUnlocked(true);

    return firstAccount;
  };

  // Import directly via Raw Private Key
  const importPrivateKey = async (
    password: string,
    pk: string,
    accountName?: string
  ): Promise<WalletAccount> => {
    const acc = importAccountFromPrivateKey(pk, accountName || 'Imported Account 1');
    const vaultData: VaultData = {
      mnemonic: null,
      accounts: [acc],
      createdAt: Date.now(),
    };

    const encryptedPayload = await encryptData(JSON.stringify(vaultData), password);
    await StorageEngine.set(STORAGE_KEYS.VAULT, encryptedPayload);

    setRawMasterPassword(password);
    setMnemonic(null);
    setAccounts([acc]);
    setCurrentAccountIndex(0);
    setHasVault(true);
    setIsUnlocked(true);

    return acc;
  };

  // Unlock Wallet with Master Password
  const unlockWallet = async (password: string): Promise<boolean> => {
    try {
      const encryptedPayload = await StorageEngine.get<EncryptedPayload>(STORAGE_KEYS.VAULT);
      if (!encryptedPayload) {
        throw new Error('No vault found');
      }

      const decryptedJson = await decryptData(encryptedPayload, password);
      const vaultData: VaultData = JSON.parse(decryptedJson);

      setRawMasterPassword(password);
      setMnemonic(vaultData.mnemonic || null);
      setAccounts(vaultData.accounts || []);
      setCurrentAccountIndex(0);
      setIsUnlocked(true);
      return true;
    } catch (err) {
      console.error('Unlock error:', err);
      return false;
    }
  };

  // Lock Wallet
  const lockWallet = useCallback(() => {
    setRawMasterPassword(null);
    setMnemonic(null);
    setAccounts([]);
    setIsUnlocked(false);
  }, []);

  // Reset entire wallet and purge local data
  const resetWallet = async () => {
    await StorageEngine.clear();
    setRawMasterPassword(null);
    setMnemonic(null);
    setAccounts([]);
    setTransactions([]);
    setHasVault(false);
    setIsUnlocked(false);
    setNetworks(DEFAULT_NETWORKS);
  };

  // Derive and add the next account (Account 2, Account 3, etc.)
  const createNextAccount = async (): Promise<WalletAccount> => {
    if (!mnemonic) {
      throw new Error('Wallet was imported via single private key without seed phrase');
    }
    if (!rawMasterPassword) {
      throw new Error('Wallet is locked');
    }

    const nextIndex = accounts.length;
    const newAcc = await deriveAccountFromMnemonic(mnemonic, nextIndex, `Account ${nextIndex + 1}`);
    const updatedAccounts = [...accounts, newAcc];

    const vaultData: VaultData = {
      mnemonic,
      accounts: updatedAccounts,
      createdAt: Date.now(),
    };

    const encrypted = await encryptData(JSON.stringify(vaultData), rawMasterPassword);
    await StorageEngine.set(STORAGE_KEYS.VAULT, encrypted);

    setAccounts(updatedAccounts);
    setCurrentAccountIndex(nextIndex);
    await StorageEngine.set(STORAGE_KEYS.SELECTED_ACC_IDX, nextIndex);

    return newAcc;
  };

  // Switch Account
  const switchAccount = (index: number) => {
    if (index >= 0 && index < accounts.length) {
      setCurrentAccountIndex(index);
      StorageEngine.set(STORAGE_KEYS.SELECTED_ACC_IDX, index);
    }
  };

  // Select RPC Network
  const selectNetwork = (networkId: string) => {
    setCurrentNetworkId(networkId);
    StorageEngine.set(STORAGE_KEYS.SELECTED_NET, networkId);
  };

  // Add Custom RPC Network
  const addCustomNetwork = async (net: NetworkConfig) => {
    const updated = [...networks, net];
    setNetworks(updated);
    setCurrentNetworkId(net.id);
    await StorageEngine.set(STORAGE_KEYS.NETWORKS, updated);
    await StorageEngine.set(STORAGE_KEYS.SELECTED_NET, net.id);
  };

  // Remove RPC Network
  const removeNetwork = async (networkId: string) => {
    const updated = networks.filter((n) => n.id !== networkId);
    setNetworks(updated);
    if (currentNetworkId === networkId) {
      setCurrentNetworkId(updated[0]?.id || DEFAULT_NETWORKS[0].id);
    }
    await StorageEngine.set(STORAGE_KEYS.NETWORKS, updated);
  };

  // Restore Default Networks
  const resetNetworksToDefault = async () => {
    setNetworks(DEFAULT_NETWORKS);
    setCurrentNetworkId(DEFAULT_NETWORKS[0].id);
    await StorageEngine.set(STORAGE_KEYS.NETWORKS, DEFAULT_NETWORKS);
    await StorageEngine.set(STORAGE_KEYS.SELECTED_NET, DEFAULT_NETWORKS[0].id);
  };

  // Record Transaction to Local Activity History
  const addTransactionRecord = (tx: TransactionRecord) => {
    setTransactions((prev) => {
      const updated = [tx, ...prev];
      StorageEngine.set(STORAGE_KEYS.TX_HISTORY, updated);
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        hasVault,
        isUnlocked,
        isLoading,
        accounts,
        currentAccountIndex,
        currentAccount,
        mnemonic,
        rawMasterPassword,
        createWallet,
        importPrivateKey,
        unlockWallet,
        lockWallet,
        resetWallet,
        createNextAccount,
        switchAccount,
        networks,
        currentNetwork,
        selectNetwork,
        addCustomNetwork,
        removeNetwork,
        resetNetworksToDefault,
        balance,
        isRefreshingBalance,
        refreshBalance,
        transactions,
        addTransactionRecord,
        aiGuardEnabled,
        setAiGuardEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
