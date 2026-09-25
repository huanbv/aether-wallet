import { StorageEngine } from '../utils/crypto';

export interface BlacklistEntry {
  address: string;
  name: string;
  category: 'DRAINER' | 'PHISHING' | 'BURN_ADDRESS' | 'MALICIOUS_CONTRACT' | 'USER_BLOCKED';
  severity: 'CRITICAL' | 'HIGH';
  reasonEN: string;
  reasonVI: string;
  dateAdded: string;
}

export interface AddressCheckResult {
  isBlocked: boolean;
  isPoisoningRisk: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NONE';
  entry?: BlacklistEntry;
  reasonEN: string;
  reasonVI: string;
}

// 1. LOCAL_BLACKLIST: Hardcoded high-danger drainers, burn addresses, phishing contracts
export const LOCAL_BLACKLIST: BlacklistEntry[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Null / Zero Address',
    category: 'BURN_ADDRESS',
    severity: 'CRITICAL',
    reasonEN: 'Zero address. Sending tokens or ETH here permanently destroys them.',
    reasonVI: 'Địa chỉ Zero (0x0). Gửi tiền vào đây sẽ làm mất tài sản vĩnh viễn không thể lấy lại.',
    dateAdded: '2026-01-01',
  },
  {
    address: '0x000000000000000000000000000000000000dead',
    name: 'Dead / Burn Address',
    category: 'BURN_ADDRESS',
    severity: 'CRITICAL',
    reasonEN: 'EVM Burn address. Assets transferred here cannot be recovered.',
    reasonVI: 'Địa chỉ Thiêu hủy (Burn). Toàn bộ coin gửi vào đây sẽ bị tiêu hủy.',
    dateAdded: '2026-01-01',
  },
  {
    address: '0xdead000000000000000042069420694206942069',
    name: 'Meme Burn Address',
    category: 'BURN_ADDRESS',
    severity: 'CRITICAL',
    reasonEN: 'Irreversible burn address.',
    reasonVI: 'Địa chỉ burn không thể khôi phục.',
    dateAdded: '2026-01-01',
  },
  // Known notorious Web3 drainer and phishing contracts reported across security advisories
  {
    address: '0x000000000000cd9c855a80509ab93a10bf365f57',
    name: 'Inferno Drainer Sweeper',
    category: 'DRAINER',
    severity: 'CRITICAL',
    reasonEN: 'Known Inferno Drainer asset aggregator contract. Will sweep all tokens.',
    reasonVI: 'Hợp đồng độc hại Inferno Drainer. Sẽ rút cạn toàn bộ token của bạn.',
    dateAdded: '2026-01-15',
  },
  {
    address: '0x000000000001099e71ec26d36e2f1d9315bc99a2',
    name: 'Pink Drainer Proxy',
    category: 'DRAINER',
    severity: 'CRITICAL',
    reasonEN: 'Identified Pink Drainer proxy contract executing malicious permit2 signatures.',
    reasonVI: 'Hợp đồng lừa đảo Pink Drainer lợi dụng chữ ký permit2 để chiếm đoạt tài sản.',
    dateAdded: '2026-02-10',
  },
  {
    address: '0x0000000000007f150bd6f54c40a34d7c3d5e9f56',
    name: 'Monkey Drainer Exploiter',
    category: 'DRAINER',
    severity: 'CRITICAL',
    reasonEN: 'Reported Monkey Drainer phishing settlement wallet.',
    reasonVI: 'Ví nhận tiền của mã độc Monkey Drainer.',
    dateAdded: '2026-02-18',
  },
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT contract itself: Warning if user tries to transfer ETH directly to USDT contract
    name: 'USDT Token Contract',
    category: 'MALICIOUS_CONTRACT',
    severity: 'HIGH',
    reasonEN: 'This is the USDT Token contract, NOT a recipient wallet! Direct ETH transfers will get locked.',
    reasonVI: 'Đây là địa chỉ Hợp đồng USDT, KHÔNG phải ví cá nhân! Gửi ETH trực tiếp vào đây sẽ bị kẹt vĩnh viễn.',
    dateAdded: '2026-01-01',
  },
];

const STORAGE_KEYS = {
  CUSTOM_BLACKLIST: 'aether_custom_blacklist',
  REMOTE_CACHE: 'aether_remote_blacklist_cache',
  CACHE_TIMESTAMP: 'aether_blacklist_cache_time',
};

// 6 Hours Cache duration
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const BlacklistService = {
  /**
   * Sync remote open-source phishing blacklist from GitHub with 6-hour caching
   */
  async syncRemoteBlacklist(): Promise<string[]> {
    try {
      const lastSync = await StorageEngine.get<number>(STORAGE_KEYS.CACHE_TIMESTAMP);
      const now = Date.now();

      if (lastSync && now - lastSync < CACHE_TTL_MS) {
        const cached = await StorageEngine.get<string[]>(STORAGE_KEYS.REMOTE_CACHE);
        if (cached && Array.isArray(cached)) {
          return cached;
        }
      }

      // Fetch from public Web3 community security threat feeds
      const response = await fetch(
        'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/hosts.json',
        { signal: AbortSignal.timeout(4000) }
      ).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        const blacklist = Array.isArray(data?.blacklist) ? data.blacklist : [];
        await StorageEngine.set(STORAGE_KEYS.REMOTE_CACHE, blacklist);
        await StorageEngine.set(STORAGE_KEYS.CACHE_TIMESTAMP, now);
        return blacklist;
      }
    } catch (err) {
      console.warn('[BlacklistService] Remote sync fallback to local cache:', err);
    }

    const fallback = await StorageEngine.get<string[]>(STORAGE_KEYS.REMOTE_CACHE);
    return fallback || [];
  },

  /**
   * Get user's custom personal blacklist
   */
  async getCustomBlacklist(): Promise<BlacklistEntry[]> {
    const list = await StorageEngine.get<BlacklistEntry[]>(STORAGE_KEYS.CUSTOM_BLACKLIST);
    return list && Array.isArray(list) ? list : [];
  },

  /**
   * Add new address to user's personal blacklist
   */
  async addCustomBlacklist(entry: Omit<BlacklistEntry, 'dateAdded'>): Promise<void> {
    const current = await this.getCustomBlacklist();
    const cleanAddress = entry.address.trim().toLowerCase();

    // Check if already in list
    if (current.some((c) => c.address.toLowerCase() === cleanAddress)) {
      return;
    }

    const newEntry: BlacklistEntry = {
      ...entry,
      address: cleanAddress,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    const updated = [newEntry, ...current];
    await StorageEngine.set(STORAGE_KEYS.CUSTOM_BLACKLIST, updated);
  },

  /**
   * Remove address from personal blacklist
   */
  async removeCustomBlacklist(address: string): Promise<void> {
    const current = await this.getCustomBlacklist();
    const clean = address.trim().toLowerCase();
    const updated = current.filter((c) => c.address.toLowerCase() !== clean);
    await StorageEngine.set(STORAGE_KEYS.CUSTOM_BLACKLIST, updated);
  },

  /**
   * Detect Address Poisoning Attack:
   * Attackers generate vanity addresses matching first 6 chars and last 4 chars of user's address or regular contact,
   * then send a 0-value transaction to poison their transaction history.
   */
  detectAddressPoisoning(userAddress?: string, recipientAddress?: string): boolean {
    if (!userAddress || !recipientAddress) return false;
    const u = userAddress.trim().toLowerCase();
    const r = recipientAddress.trim().toLowerCase();

    if (u.length !== 42 || r.length !== 42 || u === r) {
      return false;
    }

    // Check first 6 characters (e.g. 0x1234)
    const matchPrefix = u.slice(0, 6) === r.slice(0, 6);
    // Check last 4 characters (e.g. abcd)
    const matchSuffix = u.slice(-4) === r.slice(-4);
    // Middle 32 characters must differ
    const middleDiffers = u.slice(6, -4) !== r.slice(6, -4);

    return matchPrefix && matchSuffix && middleDiffers;
  },

  /**
   * Comprehensive check: Local Blacklist + User Custom Blacklist + Address Poisoning Detection
   */
  async checkAddress(
    recipientAddress: string,
    userAddress?: string
  ): Promise<AddressCheckResult> {
    const clean = (recipientAddress || '').trim().toLowerCase();

    if (!clean || clean.length < 10) {
      return {
        isBlocked: false,
        isPoisoningRisk: false,
        severity: 'NONE',
        reasonEN: '',
        reasonVI: '',
      };
    }

    // 1. Check Local Blacklist
    const localMatch = LOCAL_BLACKLIST.find((b) => b.address.toLowerCase() === clean);
    if (localMatch) {
      return {
        isBlocked: true,
        isPoisoningRisk: false,
        severity: localMatch.severity,
        entry: localMatch,
        reasonEN: `[CRITICAL SECURITY ALERT] ${localMatch.name}: ${localMatch.reasonEN}`,
        reasonVI: `[CẢNH BÁO AN NINH CỰC NGUY HIỂM] ${localMatch.name}: ${localMatch.reasonVI}`,
      };
    }

    // 2. Check Custom User Blacklist
    const customList = await this.getCustomBlacklist();
    const customMatch = customList.find((c) => c.address.toLowerCase() === clean);
    if (customMatch) {
      return {
        isBlocked: true,
        isPoisoningRisk: false,
        severity: 'CRITICAL',
        entry: customMatch,
        reasonEN: `[BLOCKED BY YOU] ${customMatch.reasonEN || 'Address is on your personal blacklist.'}`,
        reasonVI: `[ĐÃ BỊ CHẶN BỞI BẠN] ${customMatch.reasonVI || 'Địa chỉ này nằm trong danh sách đen cá nhân của bạn.'}`,
      };
    }

    // 3. Check Address Poisoning Risk
    if (userAddress && this.detectAddressPoisoning(userAddress, clean)) {
      return {
        isBlocked: false,
        isPoisoningRisk: true,
        severity: 'HIGH',
        reasonEN:
          'Potential Address Poisoning detected! This recipient address matches the first 6 and last 4 characters of your own wallet, but the middle characters are completely different. Verify every single character before proceeding.',
        reasonVI:
          'Phát hiện dấu hiệu Tấn công Giả mạo Địa chỉ (Address Poisoning)! Địa chỉ này có 6 ký tự đầu và 4 ký tự cuối giống hệt ví của bạn, nhưng phần thân giữa lại hoàn toàn khác. Hãy kiểm tra từng ký tự.',
      };
    }

    return {
      isBlocked: false,
      isPoisoningRisk: false,
      severity: 'NONE',
      reasonEN: '',
      reasonVI: '',
    };
  },
};
