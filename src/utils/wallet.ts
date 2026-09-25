import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import {
  createPublicClient,
  http,
  formatEther,
  parseEther,
  isAddress,
  getAddress,
  type Hash,
  type Hex,
} from 'viem';

export { isAddress, getAddress };

import { privateKeyToAccount } from 'viem/accounts';
import { bufferToHex } from './crypto';

export interface WalletAccount {
  index: number;
  name: string;
  address: string;
  privateKey: string;
  derivationPath: string;
}

export interface NetworkConfig {
  id: string;
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
  isTestnet?: boolean;
}

export const DEFAULT_NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum-mainnet',
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://rpc.ankr.com/eth',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
  },
  {
    id: 'bnb-smart-chain',
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://rpc.ankr.com/bsc',
    symbol: 'BNB',
    decimals: 18,
    explorerUrl: 'https://bscscan.com',
    isTestnet: false,
  },
  {
    id: 'polygon-mainnet',
    chainId: 137,
    name: 'Polygon PoS',
    rpcUrl: 'https://rpc.ankr.com/polygon',
    symbol: 'POL',
    decimals: 18,
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false,
  },
  {
    id: 'arbitrum-one',
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://rpc.ankr.com/arbitrum',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://arbiscan.io',
    isTestnet: false,
  },
  {
    id: 'base-mainnet',
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://basescan.org',
    isTestnet: false,
  },
  {
    id: 'sepolia-testnet',
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
    symbol: 'SepoliaETH',
    decimals: 18,
    explorerUrl: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
];

/**
 * Generate a new cryptographically secure BIP-39 mnemonic phrase (12 or 24 words)
 */
export function generateSeedPhrase(wordCount: 12 | 24 = 12): string {
  const strength = wordCount === 24 ? 256 : 128;
  return bip39.generateMnemonic(wordlist, strength);
}

/**
 * Validate a mnemonic phrase against the BIP-39 English dictionary
 */
export function validateSeedPhrase(phrase: string): boolean {
  try {
    const clean = phrase.trim().toLowerCase().replace(/\s+/g, ' ');
    return bip39.validateMnemonic(clean, wordlist);
  } catch {
    return false;
  }
}

/**
 * Validate an EVM private key hex
 */
export function validatePrivateKey(pk: string): boolean {
  try {
    const clean = pk.trim().toLowerCase();
    const hex = clean.startsWith('0x') ? clean : `0x${clean}`;
    if (hex.length !== 66) return false;
    privateKeyToAccount(hex as Hex);
    return true;
  } catch {
    return false;
  }
}

/**
 * Derive EVM Account from Mnemonic using standard BIP-44 path: m/44'/60'/0'/0/{index}
 */
export async function deriveAccountFromMnemonic(
  mnemonic: string,
  index: number = 0,
  accountName?: string
): Promise<WalletAccount> {
  const cleanMnemonic = mnemonic.trim().toLowerCase().replace(/\s+/g, ' ');
  const seed = await bip39.mnemonicToSeed(cleanMnemonic);
  const hdRoot = HDKey.fromMasterSeed(seed);
  const path = `m/44'/60'/0'/0/${index}`;
  const child = hdRoot.derive(path);

  if (!child.privateKey) {
    throw new Error('Failed to derive private key from seed.');
  }

  const pkHex = `0x${bufferToHex(child.privateKey)}` as Hex;
  const account = privateKeyToAccount(pkHex);

  return {
    index,
    name: accountName || `Account ${index + 1}`,
    address: getAddress(account.address),
    privateKey: pkHex,
    derivationPath: path,
  };
}

/**
 * Import single account directly from private key
 */
export function importAccountFromPrivateKey(
  privateKeyInput: string,
  accountName?: string
): WalletAccount {
  const clean = privateKeyInput.trim();
  const pkHex = (clean.startsWith('0x') ? clean : `0x${clean}`) as Hex;
  const account = privateKeyToAccount(pkHex);

  return {
    index: 0,
    name: accountName || 'Imported Account',
    address: getAddress(account.address),
    privateKey: pkHex,
    derivationPath: 'custom_pk_import',
  };
}

/**
 * Fetch native coin balance via RPC
 */
export async function fetchAccountBalance(
  rpcUrl: string,
  address: string
): Promise<string> {
  try {
    const client = createPublicClient({
      transport: http(rpcUrl, { timeout: 8000 }),
    });

    const balanceWei = await client.getBalance({
      address: getAddress(address),
    });

    const formatted = formatEther(balanceWei);
    // Format to max 6 decimals for sleek UI presentation
    const num = parseFloat(formatted);
    return isNaN(num) ? '0.00' : num.toFixed(4);
  } catch (error) {
    console.warn(`[AetherWallet] RPC balance fetch failed (${rpcUrl}):`, error);
    return '0.00';
  }
}

/**
 * Estimate gas fee for a transfer
 */
export async function estimateTransferGas(
  rpcUrl: string,
  from: string,
  to: string,
  amountEth: string,
  calldataHex?: string
): Promise<{ gasLimit: bigint; gasPriceWei: bigint; totalGasEth: string }> {
  try {
    const client = createPublicClient({
      transport: http(rpcUrl, { timeout: 8000 }),
    });

    const gasPrice = await client.getGasPrice();
    const valueWei = parseEther(amountEth || '0');

    let estimatedGas = 21000n;
    if (to && isAddress(to)) {
      try {
        estimatedGas = await client.estimateGas({
          account: getAddress(from),
          to: getAddress(to),
          value: valueWei,
          data: (calldataHex && calldataHex.startsWith('0x') ? calldataHex : undefined) as Hex,
        });
      } catch {
        // Fallback default for smart contract or transfer
        estimatedGas = calldataHex && calldataHex.length > 2 ? 65000n : 21000n;
      }
    }

    const totalCostWei = estimatedGas * gasPrice;
    const totalGasEth = formatEther(totalCostWei);

    return {
      gasLimit: estimatedGas,
      gasPriceWei: gasPrice,
      totalGasEth: parseFloat(totalGasEth).toFixed(6),
    };
  } catch (err) {
    return {
      gasLimit: 21000n,
      gasPriceWei: 20000000000n, // 20 gwei fallback
      totalGasEth: '0.00042',
    };
  }
}

/**
 * Sign and broadcast transaction
 *
 * SECURITY: `chainId` is mandatory. Omitting it produces a pre-EIP-155 legacy
 * transaction with NO replay protection, meaning the signed transaction could be
 * rebroadcast on any other EVM chain where the account holds funds. We always
 * bind the signature to the target chain.
 */
export async function broadcastTransaction(
  rpcUrl: string,
  accountPrivateKey: string,
  chainId: number,
  to: string,
  amountEth: string,
  calldataHex: string = '0x'
): Promise<Hash> {
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error('A valid chain ID is required to sign this transaction safely.');
  }

  const account = privateKeyToAccount(accountPrivateKey as Hex);
  const client = createPublicClient({
    transport: http(rpcUrl, { timeout: 12000 }),
  });

  const toAddress = getAddress(to);
  const valueWei = parseEther(amountEth);
  const data = (calldataHex && calldataHex.startsWith('0x') ? calldataHex : '0x') as Hex;

  // Use the pending block so back-to-back sends don't collide on the same nonce
  const nonce = await client.getTransactionCount({
    address: account.address,
    blockTag: 'pending',
  });
  const gasPrice = await client.getGasPrice();

  // Estimate real gas instead of a hardcoded guess; add a 25% safety buffer so
  // contract interactions don't revert with out-of-gas after paying the fee.
  let gas: bigint;
  try {
    const estimated = await client.estimateGas({
      account: account.address,
      to: toAddress,
      value: valueWei,
      data: data !== '0x' ? data : undefined,
    });
    gas = (estimated * 125n) / 100n;
  } catch {
    gas = data !== '0x' ? 90000n : 21000n;
  }

  // Sign transaction — chainId enforces EIP-155 replay protection
  const serializedTx = await account.signTransaction({
    chainId,
    nonce,
    to: toAddress,
    value: valueWei,
    gasPrice,
    gas,
    data,
  });

  // Broadcast raw transaction to mempool
  const txHash = await client.sendRawTransaction({
    serializedTransaction: serializedTx,
  });

  return txHash;
}

/**
 * Truncate EVM Address for readable UI (0x1234...5678)
 */
export function formatAddress(address?: string | null): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
