# AetherWallet 🌐🛡️
### 100% Non-Custodial, Open-Source Web3 Extension Wallet with Gemini AI Security Guard
### Ví Web3 Phi Tập Trung Mã Nguồn Mở Tự Do Tích Hợp Trợ Thủ An Ninh AI Gemini

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-success.svg)](public/manifest.json)
[![Security: AES-256-GCM](https://img.shields.io/badge/Cryptography-AES--256--GCM-indigo.svg)](src/utils/crypto.ts)
[![AI Engine](https://img.shields.io/badge/AI%20Guard-BYOK%20Google%20Gemini-cyan.svg)](src/services/aiSecurity.ts)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg)](tsconfig.json)

---

## 📥 Cài đặt / Install

- **Người dùng thường (không cần build)** → tải bản dựng sẵn ở [**Releases**](https://github.com/huanbv/aether-wallet/releases/latest).
- **Lập trình viên** → xem hướng dẫn build từ mã nguồn.
- 📄 **Hướng dẫn chi tiết song ngữ cho cả hai: [INSTALL.md](INSTALL.md)**

---

## 📖 MỤC LỤC / TABLE OF CONTENTS
1. [🇻🇳 Giới Thiệu Dự Án (Tiếng Việt)](#-tiếng-việt---giới-thiệu-dự-án)
   - [Đặc Điểm Nổi Bật](#đặc-điểm-nổi-bật)
   - [Cấu Trúc Cây Thư Mục](#cấu-trúc-cây-thư-mục-project-structure)
   - [Hướng Dẫn Cài Đặt & Build](#hướng-dẫn-cài-đặt--build-mã-nguồn)
   - [Cài Đặt Vào Trình Duyệt Chrome / Brave](#cài-đặt-extension-vào-trình-duyệt)
2. [🇬🇧 English Documentation](#-english---project-overview)
   - [Key Highlights](#key-highlights)
   - [Architecture & Cryptography](#architecture--cryptography)
   - [Local Development & Build Steps](#local-development--build-steps)
   - [Loading Unpacked in Chrome / Chromium](#loading-unpacked-in-chrome--chromium)

---

## 🇻🇳 TIẾNG VIỆT - GIỚI THIỆU DỰ ÁN

**AetherWallet** là nền tảng ví Web3 chuẩn Chrome Extension Manifest V3 hoàn toàn phi tập trung và mã nguồn mở (Non-custodial Open-Source Web3 Wallet). Không có bất kỳ máy chủ trung tâm nào lưu trữ private key hay theo dõi người dùng. Dự án được thiết kế để bất kỳ cá nhân, lập trình viên hoặc tổ chức nào cũng có thể tự do clone mã nguồn về máy, tự kiểm tra mã nguồn (audit), tự build và tùy chỉnh mạng RPC node riêng mà không bị phụ thuộc.

### Đặc Điểm Nổi Bật
- **Mã hóa Cục Bộ Chuẩn Quân Sự (AES-256-GCM + PBKDF2)**: Toàn bộ Secret Recovery Phrase (12/24 từ) và Private Key được mã hóa bằng Web Crypto API chuẩn AES-256-GCM với **310,000 vòng lặp PBKDF2** và muối (salt) ngẫu nhiên 16 bytes.
- **Trợ Thủ An Ninh AI theo mô hình BYOK (Gemini Transaction Guard)**: Mỗi người dùng **tự nhập khóa Gemini của mình** (khóa được mã hóa cục bộ, gọi thẳng tới Google — không qua máy chủ trung gian). Phân tích calldata, cấp quyền vô hạn (infinite approval), drainer độc hại. **Không có khóa vẫn chạy** ở chế độ phân tích cục bộ (blacklist + address poisoning + giải mã calldata).
- **Bảo Vệ Ký Giao Dịch (EIP-155)**: Ràng buộc chữ ký với đúng `chainId` để chống tấn công phát lại (replay) chéo mạng.
- **Thông Báo Bản Mới Trong App**: Tự kiểm tra GitHub Releases và hiện banner khi có phiên bản mới hơn.
- **QR Nhận Tiền Tạo Cục Bộ**: Mã QR được vẽ ngay trên máy (SVG), không gọi dịch vụ ngoài, không lộ địa chỉ ví.
- **Hỗ Trợ Song Ngữ (Tiếng Việt & English)** + **Giao Diện Sáng / Tối**: i18n chuyển đổi tức thì, thiết kế Tailwind CSS.
- **Đa Mạng EVM & Tùy Chỉnh RPC**: Ethereum, BNB Chain, Polygon, Arbitrum, Base, Optimism, Avalanche C-Chain, Sepolia và thêm Custom RPC tùy ý.
- **Stablecoin ERC-20 (USDT/USDC)**: Hiển thị **và gửi** USDT/USDC theo từng mạng (địa chỉ hợp đồng chuẩn, đúng decimals).
- **Chuẩn EIP-1193**: Tiêm `window.ethereum` vào trang web để kết nối Uniswap, OpenSea, PancakeSwap,...

---

### Cấu Trúc Cây Thư Mục (Project Structure)

```text
├── public/
│   ├── manifest.json         # Manifest V3 configuration
│   ├── background.js         # Extension Background Service Worker
│   ├── contentScript.js      # Bridge script connecting web pages to extension
│   ├── inpage.js             # EIP-1193 window.ethereum provider injection
│   └── wallet-icon.svg       # Vector icon branding
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Navigation, Network selector, Account pill, Theme/Lang
│   │   ├── NetworkModal.tsx  # Add custom RPC, switch EVM networks
│   │   ├── AccountModal.tsx  # Account switcher & HD derivation (Account 1, 2...)
│   │   ├── ReceiveModal.tsx  # QR code display & address copy
│   │   └── UnlockScreen.tsx  # Master password decryption gateway
│   ├── context/
│   │   └── AppContext.tsx    # Global React state (Wallet, Crypto, i18n, Networks)
│   ├── i18n/
│   │   └── locales.ts        # Full bilingual dictionary (Tiếng Việt & English)
│   ├── pages/
│   │   ├── Welcome.tsx       # Onboarding: Create 12-word seed, import seed or PK
│   │   ├── Dashboard.tsx     # Portfolio balances, tokens, send/receive, history
│   │   ├── Send.tsx          # Transfer UI + Gemini AI Transaction Guard
│   │   └── Settings.tsx      # RPC nodes, Reveal seed/PK, AI toggle, reset
│   ├── services/
│   │   ├── aiSecurity.ts     # BYOK Gemini audit (direct call) & local rule engine
│   │   ├── blacklist.ts      # Drainer/phishing blacklist & address-poisoning check
│   │   └── updateCheck.ts    # In-app "new version" check against GitHub Releases
│   ├── utils/
│   │   ├── crypto.ts         # Web Crypto API (AES-256-GCM, PBKDF2, StorageEngine)
│   │   └── wallet.ts         # Viem, BIP-39, BIP-32 HD derivation, EIP-155 signing
│   ├── App.tsx               # Main layout, popup/expanded toggle, update banner
│   ├── index.css             # Tailwind CSS styles & dark mode variants
│   └── main.tsx              # React DOM entry point
├── docs/                     # GitHub Pages privacy site + Chrome Web Store guide
├── package.json              # Project packages & build scripts (pure Vite, no server)
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite build configuration
├── INSTALL.md                # Install guide (users + developers)
├── PRIVACY.md                # Privacy policy
├── CONTRIBUTING.md           # Community guidelines & Pull Request instructions
├── LICENSE                   # MIT License
└── README.md                 # Project documentation
```

---

### ⚡ Cài Đặt Nhanh (không cần build)

Nếu bạn chỉ muốn dùng ví, hãy tải bản đã build sẵn — không cần Node, không cần build:

1. Vào [**Releases**](https://github.com/huanbv/aether-wallet/releases/latest) và tải file `aether-wallet-*-chrome.zip` ở bản mới nhất.
2. Giải nén → bạn được thư mục `aether-wallet`.
3. Mở `chrome://extensions/`, bật **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
4. Nhấn **Tải tiện ích đã giải nén (Load unpacked)** → chọn thư mục `aether-wallet` vừa giải nén.

---

### Hướng Dẫn Cài Đặt & Build Mã Nguồn (dành cho lập trình viên)

#### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.0.0 trở lên.
- **npm** hoặc **pnpm** / **yarn** / **bun**.

#### 2. Cài đặt các thư viện
```bash
# Clone repo về máy
git clone https://github.com/huanbv/aether-wallet.git
cd aether-wallet

# Cài đặt dependencies
npm install   # hoặc: bun install
```

#### 3. Chạy môi trường phát triển (Dev Mode)
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ Vite in ra (mặc định `http://localhost:5173`). Bạn có thể tương tác với ví ở cả 2 chế độ:
- **Kích thước Extension Popup (380x600px)**: Trải nghiệm y hệt khi mở popup trên thanh công cụ Chrome.
- **Chế độ Mở Rộng (Expanded View)**: Trải nghiệm toàn màn hình tiện lợi khi phát triển.

#### 4. Build bản đóng gói Extension
```bash
npm run build
```
Thư mục `/dist` sau khi build sẽ chứa đầy đủ:
- `manifest.json` (Chuẩn Chrome MV3)
- `background.js` (Service Worker)
- `contentScript.js` & `inpage.js`
- `index.html` và toàn bộ các bundle JS/CSS đã được tối ưu hóa.

---

### Cài Đặt Extension Vào Trình Duyệt
1. Mở trình duyệt Chrome, Brave hoặc Edge.
2. Truy cập thanh địa chỉ: `chrome://extensions/`.
3. Bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
4. Nhấn nút **Tải tiện ích đã giải nén (Load unpacked)**.
5. Chọn thư mục `/dist` vừa tạo từ lệnh `npm run build`.
6. Biểu tượng AetherWallet sẽ xuất hiện trên thanh công cụ trình duyệt!

---

## 🇬🇧 ENGLISH - PROJECT OVERVIEW

**AetherWallet** is a 100% decentralized, non-custodial, open-source Web3 browser extension built to the Chrome Extension Manifest V3 standard. There are zero centralized databases, zero tracking analytics, and zero remote key vaults. Users maintain absolute sovereignty over their cryptographic assets.

### Key Highlights
- **100% Client-Side Web Crypto Security**: Master passwords derive AES-256-GCM keys with 310,000 iterations of PBKDF2 and cryptographically secure random salts.
- **Gemini AI Transaction Guard (BYOK)**: Each user brings their own Google Gemini API key. It is encrypted with the master password, stored only on the device, and used to call Google directly from the client — no shared key and no backend proxy. Without a key, the guard runs in a fully local heuristic mode (blacklist, address-poisoning detection, calldata decoding).
- **Full Bilingual Localization (EN / VI)**: Seamless language toggling with rich translation dictionaries.
- **Instant Dark/Light Mode**: Styled with Tailwind CSS for high readability and crypto aesthetics.
- **EIP-155 Replay-Protected Signing**: Every transaction is bound to its `chainId`, preventing cross-chain replay.
- **In-App Update Notifications**: Checks GitHub Releases and shows a banner when a newer version is available (auto-disabled on Web Store installs).
- **Locally-Generated Receive QR**: The QR is rendered on-device (SVG) — no third-party request, no address leak.
- **Multi-Chain EVM & Custom RPCs**: Preloaded with Ethereum, BNB Chain, Polygon, Arbitrum, Base, Optimism, Avalanche C-Chain, Sepolia, plus instant support for any custom RPC node.
- **Built-in Stablecoins (USDT/USDC)**: View **and send** USDT/USDC per network with canonical contract addresses and correct decimals.
- **EIP-1193 Inpage Provider**: Injects `window.ethereum` into the webpage DOM for compatibility with dApps.

### Quick Install (no build required)

If you just want to use the wallet, download the pre-built package — no Node, no build:

1. Go to [**Releases**](https://github.com/huanbv/aether-wallet/releases/latest) and download the `aether-wallet-*-chrome.zip` from the latest release's Assets.
2. Unzip it → you get an `aether-wallet` folder.
3. Open `chrome://extensions/`, enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the unzipped `aether-wallet` folder.

### Local Development & Build Steps (for developers)

```bash
# 1. Clone repository
git clone https://github.com/huanbv/aether-wallet.git
cd aether-wallet

# 2. Install dependencies
npm install   # or: bun install

# 3. Start local development server
npm run dev

# 4. Build for production extension package
npm run build
```

> No `.env` / API key is required to run the wallet. The AI Transaction Guard is
> opt-in per user: open **Settings → Your Gemini API Key** and paste your own key
> (get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
> The key is encrypted with your master password and never leaves your device
> except in direct calls to Google.

### Loading Unpacked in Chrome / Chromium
1. Open Chrome, Brave, or Chromium.
2. Go to `chrome://extensions/`.
3. Toggle on **Developer mode** in the upper-right corner.
4. Click **Load unpacked** and select the project's `dist/` directory.
5. Pin AetherWallet and interact with decentralized applications!

---

## 🕒 Changelog / Lịch Sử Phiên Bản

Xem đầy đủ tại [Releases](https://github.com/huanbv/aether-wallet/releases).

### v1.0.4
- **Gửi được USDT / USDC** (chuyển token ERC-20): chọn tài sản trong màn Gửi, ví tự tạo calldata `transfer` (phí gas trả bằng coin gốc). AI Guard vẫn kiểm tra địa chỉ người nhận + giải mã calldata như thường.

### v1.0.3
- Thêm **mạng phổ biến**: OP Mainnet (Optimism) và Avalanche C-Chain.
- Hỗ trợ **stablecoin ERC-20 (USDT / USDC)**: hiển thị số dư trên Dashboard cho các mạng ETH, BNB, Polygon, Arbitrum, Base, Optimism, Avalanche (địa chỉ hợp đồng + decimals chuẩn theo từng mạng, đã đối chiếu on-chain).
- **Sửa RPC mặc định** của Ethereum/BNB/Polygon/Arbitrum sang `publicnode` (endpoint `ankr` công khai cũ trả lỗi) → đọc số dư coin gốc & token ổn định. *(Ví đã lưu mạng cũ: bấm "Khôi phục mạng mặc định" trong Cài đặt để áp dụng.)*

### v1.0.2
- Chuẩn bị Chrome Web Store: icon PNG 16/48/128, bỏ quyền thừa `unlimitedStorage`, thêm `PRIVACY.md` + trang [Privacy Pages](https://huanbv.github.io/aether-wallet/) và guide đăng store.
- Banner cập nhật tự tắt khi cài từ Chrome Web Store.

### v1.0.1
- Thêm **thông báo bản mới trong app** (kiểm tra GitHub Releases).
- **Fix QR màn Receive**: vẽ QR cục bộ (SVG), không gọi dịch vụ ngoài, không lộ địa chỉ.

### v1.0.0
- Chuyển AI Guard sang **BYOK** (mỗi người tự nhập khóa Gemini), gọi Google trực tiếp từ client, **bỏ hẳn server** (chạy Vite thuần).
- Vá bảo mật: **EIP-155** chống replay chéo mạng, ước tính gas thật, nonce `pending`; không lộ địa chỉ khi ví khóa; validate/chống prompt-injection.
- Phát hành bản build sẵn (zip) + hướng dẫn cài đặt.

> 🔧 **Quy ước cập nhật**: mỗi lần nâng cấp → tăng `version` trong `public/manifest.json` và `FALLBACK_VERSION` trong `src/services/updateCheck.ts`, cập nhật mục Changelog này, rồi tạo Release mới.

---

## 📜 LICENSE
This project is licensed under the permissive **MIT License**. You are free to fork, modify, rebrand, distribute, and integrate this software in commercial or non-commercial applications. See the [LICENSE](LICENSE) file for full details.
