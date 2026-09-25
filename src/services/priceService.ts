import { StorageEngine } from '../utils/crypto';

/**
 * Fetch real USD prices from the free CoinGecko API, with a short cache so we
 * don't hit rate limits. Everything degrades gracefully: on any failure the
 * caller simply gets an empty map and falls back to rough estimates.
 */

const CACHE_KEY = 'aether_price_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Native/network symbol -> CoinGecko id
const SYMBOL_TO_ID: Record<string, string> = {
  ETH: 'ethereum',
  BNB: 'binancecoin',
  POL: 'matic-network',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  USDT: 'tether',
  USDC: 'usd-coin',
};

// The set we always request so both native coins and stablecoins are covered.
const ALL_IDS = Array.from(new Set(Object.values(SYMBOL_TO_ID)));

export type PriceMap = Record<string, number>; // keyed by uppercase symbol

interface PriceCache {
  fetchedAt: number;
  prices: PriceMap;
}

/**
 * Returns a map of UPPERCASE symbol -> USD price. Uses a 5-minute cache.
 * Stablecoins fall back to 1 if the API omits them.
 */
export async function fetchUsdPrices(): Promise<PriceMap> {
  try {
    const cached = await StorageEngine.get<PriceCache>(CACHE_KEY);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS && cached.prices) {
      return cached.prices;
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ALL_IDS.join(
      ','
    )}&vs_currencies=usd`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`price API ${res.status}`);

    const data = await res.json();
    const prices: PriceMap = { USDT: 1, USDC: 1 };
    for (const [sym, id] of Object.entries(SYMBOL_TO_ID)) {
      const usd = data?.[id]?.usd;
      if (typeof usd === 'number') prices[sym.toUpperCase()] = usd;
    }

    await StorageEngine.set(CACHE_KEY, { fetchedAt: Date.now(), prices });
    return prices;
  } catch (err) {
    console.warn('[AetherWallet] Price fetch failed:', err);
    const cached = await StorageEngine.get<PriceCache>(CACHE_KEY);
    return cached?.prices || { USDT: 1, USDC: 1 };
  }
}
