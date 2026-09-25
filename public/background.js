/**
 * AetherWallet - Chrome Extension Manifest V3 Background Service Worker
 * Handles EIP-1193 RPC requests, session state, and dApp communication
 */

console.log('[AetherWallet] Background service worker initialized.');

// In-memory unlock cache for the current browser session
let sessionState = {
  isUnlocked: false,
  selectedAddress: null,
  chainId: '0x1', // Ethereum Mainnet (1)
};

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message || {};

  switch (type) {
    case 'AETHER_GET_STATE': {
      sendResponse({ success: true, data: sessionState });
      break;
    }

    case 'AETHER_UPDATE_SESSION': {
      sessionState = { ...sessionState, ...payload };
      sendResponse({ success: true, data: sessionState });
      break;
    }

    case 'AETHER_DAPP_REQUEST': {
      handleDappRpcRequest(payload, sender)
        .then((result) => sendResponse({ success: true, result }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for asynchronous response
    }

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Handle Ethereum JSON-RPC requests forwarded from injected inpage script
 */
async function handleDappRpcRequest(req, sender) {
  const { method, params } = req;

  switch (method) {
    case 'eth_requestAccounts':
    case 'eth_accounts': {
      // Never expose the account address while the wallet is locked. Only a
      // wallet that has been explicitly unlocked in the popup may report
      // connected accounts. (Per-origin connection approval is a known TODO.)
      if (sessionState.isUnlocked && sessionState.selectedAddress) {
        return [sessionState.selectedAddress];
      }
      return [];
    }

    case 'eth_chainId': {
      return sessionState.chainId || '0x1';
    }

    case 'net_version': {
      return parseInt(sessionState.chainId || '0x1', 16).toString();
    }

    case 'wallet_switchEthereumChain': {
      const requested = params && params[0] && params[0].chainId;
      // Only accept a well-formed 0x-prefixed hex chain id from the dApp.
      if (typeof requested === 'string' && /^0x[0-9a-fA-F]+$/.test(requested)) {
        sessionState.chainId = requested;
        return null;
      }
      throw new Error('Invalid chain ID parameter');
    }

    default:
      // Forward standard read RPC calls (like eth_blockNumber, eth_getBalance)
      throw new Error(`Method ${method} is deferred to wallet popup approval`);
  }
}
