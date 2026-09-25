# Privacy Policy — AetherWallet

_Last updated: 2026-09-25_

AetherWallet is a **non-custodial, client-side** Web3 browser extension. We (the
maintainers) operate **no servers** and run **no analytics or trackers**. This
policy explains exactly what data the extension handles and where it goes.

## 1. Data stored on your device (never transmitted to us)

All of the following is stored **locally** in your browser (`chrome.storage.local`)
and is **encrypted with your master password** using AES‑256‑GCM (PBKDF2, 310,000
iterations) where sensitive:

- Your seed phrase / private keys (encrypted vault).
- Your Gemini API key, if you choose to add one (encrypted).
- Wallet settings: networks/RPCs, selected account, theme, language, blacklist,
  transaction history.

We never receive, see, or store any of this. There is no account and no cloud
backup. Uninstalling the extension or using **Reset Wallet** removes this data
from your device. We cannot recover your password or keys.

## 2. Network requests the extension makes

The extension talks directly to third parties **you** rely on; no data passes
through any server we control:

- **Blockchain RPC nodes** (default or custom): to read balances/gas and to
  broadcast transactions you sign. These see your public address and the
  transactions you submit — this is inherent to using a blockchain.
- **GitHub** (`api.github.com`, `raw.githubusercontent.com`): to fetch the public
  anti‑phishing blacklist and to check for a newer extension release. These
  requests contain no personal data beyond a normal HTTPS request.
- **Google Gemini** (`generativelanguage.googleapis.com`): **only if you add your
  own API key**. When enabled, the transaction details being analyzed (recipient
  address, value, calldata, network) are sent to Google under **your** key,
  subject to Google's privacy policy. Without a key, transaction analysis runs
  entirely on your device and no data is sent.

## 3. What we do NOT do

- We do not collect, transmit, or sell any personal data.
- We do not use analytics, advertising, or tracking.
- We do not have servers that receive your keys, addresses, or activity.

## 4. Permissions

- `storage`: to save your encrypted vault and settings on your device.
- Host access to websites (`https://*/*`) and a content script: to inject the
  standard `window.ethereum` provider so decentralized apps can request
  connection/signing — the core function of a wallet. The extension does not read
  page content beyond this messaging bridge.

## 5. Contact

Questions or requests: open an issue at
<https://github.com/huanbv/aether-wallet/issues>.

---

## Tiếng Việt (tóm tắt)

AetherWallet là ví Web3 **không giữ hộ khóa (non-custodial)**, chạy hoàn toàn phía
người dùng. Chúng tôi **không vận hành máy chủ**, **không thu thập dữ liệu**,
**không theo dõi**.

- **Dữ liệu trên máy bạn:** seed/private key, khóa Gemini (nếu bạn nhập), cài đặt,
  lịch sử — lưu cục bộ, mã hóa AES‑256‑GCM bằng mật khẩu chính. Chúng tôi không
  bao giờ nhận được. Gỡ extension hoặc "Reset Wallet" sẽ xóa sạch.
- **Kết nối mạng:** tới **RPC blockchain** (đọc số dư, phát giao dịch), tới
  **GitHub** (danh sách đen chống lừa đảo + kiểm tra bản mới), và tới **Google
  Gemini** *chỉ khi* bạn tự nhập khóa (dữ liệu giao dịch gửi tới Google bằng khóa
  của bạn). Không có khóa → phân tích chạy cục bộ, không gửi đi đâu.
- **Không** bán/chia sẻ dữ liệu, **không** quảng cáo, **không** máy chủ trung gian.
