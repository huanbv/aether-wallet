/**
 * AetherWallet - Content Script (Manifest V3)
 * Bridges communication between the web page DOM (inpage provider) and extension background worker
 */

// Inject inpage.js into webpage context so window.ethereum is available
function injectScript(file) {
  try {
    const container = document.head || document.documentElement;
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.runtime.getURL(file));
    container.insertBefore(script, container.firstChild);
    script.onload = () => script.remove();
  } catch (error) {
    console.error('[AetherWallet] Injection error:', error);
  }
}

injectScript('inpage.js');

// Listen for window messages dispatched from inpage.js
window.addEventListener('message', async (event) => {
  // Only accept messages from same window and matching wallet channel
  if (event.source !== window || !event.data || event.data.target !== 'aetherwallet-contentscript') {
    return;
  }

  const { id, data } = event.data;

  try {
    chrome.runtime.sendMessage(
      {
        type: 'AETHER_DAPP_REQUEST',
        payload: data,
      },
      (response) => {
        // Forward response back to inpage.js
        window.postMessage(
          {
            target: 'aetherwallet-inpage',
            id,
            response,
          },
          '*'
        );
      }
    );
  } catch (err) {
    window.postMessage(
      {
        target: 'aetherwallet-inpage',
        id,
        response: { success: false, error: err.message },
      },
      '*'
    );
  }
});
