import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';
import {
  createPublicClient,
  http,
  formatEther,
  parseEther,
  formatUnits,
  parseUnits,
  encodeFunctionData,
  erc20Abi,
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
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
  },
  {
    id: 'bnb-smart-chain',
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-rpc.publicnode.com',
    symbol: 'BNB',
    decimals: 18,
    explorerUrl: 'https://bscscan.com',
    isTestnet: false,
  },
  {
    id: 'polygon-mainnet',
    chainId: 137,
    name: 'Polygon PoS',
    rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
    symbol: 'POL',
    decimals: 18,
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false,
  },
  {
    id: 'arbitrum-one',
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arbitrum-one-rpc.publicnode.com',
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
    id: 'optimism-mainnet',
    chainId: 10,
    name: 'OP Mainnet (Optimism)',
    rpcUrl: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    decimals: 18,
    explorerUrl: 'https://optimistic.etherscan.io',
    isTestnet: false,
  },
  {
    id: 'avalanche-c-chain',
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    decimals: 18,
    explorerUrl: 'https://snowtrace.io',
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

export interface TokenConfig {
  chainId: number;
  symbol: string;
  name: string;
  address: string; // ERC-20 contract address
  decimals: number;
}

/**
 * Built-in stablecoin registry (USDT / USDC) per chain, with canonical contract
 * addresses and decimals. Note BNB Chain USDT/USDC use 18 decimals, not 6.
 */
export const DEFAULT_TOKENS: TokenConfig[] = [
  // Ethereum
  { chainId: 1, symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { chainId: 1, symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  // BNB Smart Chain (18 decimals)
  { chainId: 56, symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  { chainId: 56, symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
  // Polygon
  { chainId: 137, symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
  { chainId: 137, symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },
  // Arbitrum One
  { chainId: 42161, symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
  { chainId: 42161, symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
  // Base
  { chainId: 8453, symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  { chainId: 8453, symbol: 'USDT', name: 'Tether USD', address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
  // OP Mainnet
  { chainId: 10, symbol: 'USDT', name: 'Tether USD', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
  { chainId: 10, symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', decimals: 6 },
  // Avalanche C-Chain
  { chainId: 43114, symbol: 'USDT', name: 'TetherToken', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6 },
  { chainId: 43114, symbol: 'USDC', name: 'USD Coin', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 },
];

/** Return the built-in tokens registered for a given chain id. */
export function getTokensForChain(chainId: number): TokenConfig[] {
  return DEFAULT_TOKENS.filter((t) => t.chainId === chainId);
}

/**
 * Build ERC-20 transfer(to, amount) calldata. `amount` is a human-readable
 * decimal string that is scaled by the token's decimals. Throws if the amount
 * has more decimal places than the token supports.
 */
export function buildErc20TransferData(
  to: string,
  amount: string,
  decimals: number
): Hex {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [getAddress(to), parseUnits(amount, decimals)],
  });
}

/**
 * Read an ERC-20 token's symbol + decimals from its contract (for adding a
 * custom token by address). Throws if the address is not a readable ERC-20.
 */
export async function fetchTokenMetadata(
  rpcUrl: string,
  tokenAddress: string
): Promise<{ symbol: string; decimals: number }> {
  const client = createPublicClient({
    transport: http(rpcUrl, { timeout: 8000 }),
  });
  const address = getAddress(tokenAddress);
  const [symbol, decimals] = await Promise.all([
    client.readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
    client.readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
  ]);
  return { symbol: String(symbol), decimals: Number(decimals) };
}

/**
 * Read an ERC-20 token balance via RPC and format it using the token decimals.
 * Returns '0.00' on any failure (e.g. token not deployed on this network).
 */
export async function fetchTokenBalance(
  rpcUrl: string,
  tokenAddress: string,
  decimals: number,
  ownerAddress: string
): Promise<string> {
  try {
    const client = createPublicClient({
      transport: http(rpcUrl, { timeout: 8000 }),
    });

    const raw = await client.readContract({
      address: getAddress(tokenAddress),
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [getAddress(ownerAddress)],
    });

    const num = parseFloat(formatUnits(raw as bigint, decimals));
    // Keep real precision so "Max" never exceeds the actual on-chain balance.
    return isNaN(num) ? '0' : String(num);
  } catch (error) {
    console.warn(`[AetherWallet] Token balance fetch failed (${tokenAddress}):`, error);
    return '0';
  }
}

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
