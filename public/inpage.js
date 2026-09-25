/**
 * AetherWallet - EIP-1193 Inpage Ethereum Provider
 * Injected directly into the website DOM window object: window.ethereum
 */

(function () {
  if (window.ethereum && window.ethereum.isAetherWallet) {
    return;
  }

  let requestId = 0;
  const pendingRequests = new Map();
  const eventListeners = new Map();

  class AetherEthereumProvider {
    constructor() {
      this.isMetaMask = false;
      this.isAetherWallet = true;
      this.selectedAddress = null;
      this.chainId = '0x1';
      this.networkVersion = '1';

      // Listen for return messages from contentScript
      window.addEventListener('message', (event) => {
        if (event.source !== window || !event.data || event.data.target !== 'aetherwallet-inpage') {
          return;
        }

        const { id, response } = event.data;
        if (pendingRequests.has(id)) {
          const { resolve, reject } = pendingRequests.get(id);
          pendingRequests.delete(id);

          if (response && response.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || 'User rejected the request'));
          }
        }
      });
    }

    async request(args) {
      if (!args || typeof args.method !== 'string') {
        throw new Error('Invalid request arguments. Method must be a string.');
      }

      const id = ++requestId;

      return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });

        window.postMessage(
          {
            target: 'aetherwallet-contentscript',
            id,
            data: args,
          },
          '*'
        );

        // Request timeout after 60 seconds
        setTimeout(() => {
          if (pendingRequests.has(id)) {
            pendingRequests.delete(id);
            reject(new Error('Request timed out'));
          }
        }, 60000);
      });
    }

    on(event, handler) {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event).push(handler);
    }

    removeListener(event, handler) {
      if (!eventListeners.has(event)) return;
      const list = eventListeners.get(event).filter((h) => h !== handler);
      eventListeners.set(event, list);
    }

    emit(event, ...args) {
      if (!eventListeners.has(event)) return;
      for (const handler of eventListeners.get(event)) {
        try {
          handler(...args);
        } catch (e) {
          console.error(e);
        }
      }
    }

    isConnected() {
      return true;
    }
  }

  const provider = new AetherEthereumProvider();
  window.ethereum = provider;
  window.dispatchEvent(new Event('ethereum#initialized'));
  console.log('[AetherWallet] Web3 Provider (EIP-1193) injected successfully.');
})();
