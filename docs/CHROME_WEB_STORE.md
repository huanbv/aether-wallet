# Chrome Web Store — Submission Guide & Listing Copy

Everything you need to publish AetherWallet to the Chrome Web Store (CWS).
Code/manifest items are already handled in the repo; the items marked **[you]**
must be done in your Google account / CWS dashboard.

---

## 1. Pre-submission checklist

### Code / manifest (done in this repo)
- [x] PNG icons at 16 / 48 / 128 (`public/icon16.png`, `icon48.png`, `icon128.png`).
- [x] Removed the unnecessary `unlimitedStorage` permission.
- [x] No remote code (CSP `script-src 'self'`, no `eval`; only remote *data*).
- [x] QR generated locally (no third-party image request).
- [x] `homepage_url` + `author` set in the manifest.
- [x] Update banner auto-disables when installed from the store (`update_url` present).
- [x] `PRIVACY.md` published in the repo.

### Account / dashboard **[you]**
- [ ] Register a **Chrome Web Store Developer account** ($5 one-time), verify email, enable 2FA.
- [ ] Host the privacy policy at a public URL (e.g. GitHub Pages of `PRIVACY.md`) and paste it in the listing.
- [ ] Complete the **Privacy practices** tab (see §4).
- [ ] Upload store assets (icon 128, screenshots — see §3).
- [ ] Build the store zip and upload (see §2).

---

## 2. Build the upload package

```bash
bun install
bun run build      # outputs dist/
```
Zip the **contents** of `dist/` (so `manifest.json` is at the zip root) and upload
that zip in the CWS dashboard. Bump `version` in `public/manifest.json` (and
`FALLBACK_VERSION` in `src/services/updateCheck.ts`) for every new submission.

---

## 3. Store assets **[you]**

- **Store icon:** 128×128 PNG → use `public/icon128.png`.
- **Screenshots:** at least 1 (up to 5), **1280×800** or 640×400 PNG/JPG.
  Suggested: Welcome screen, Dashboard, Send screen with AI guard, Settings (BYOK).
- **Small promo tile (optional):** 440×280.

---

## 4. Privacy practices tab (answers) **[you]**

- **Single purpose:** "A non-custodial Web3 wallet to store keys locally and let
  users connect to and sign transactions for decentralized apps."
- **Permission justifications:**
  - `storage` — "Persist the user's encrypted key vault and settings on-device."
  - Host access `https://*/*` + content script — "Inject the standard EIP-1193
    `window.ethereum` provider so dApps on any site can request connection and
    signing; this is the core function of a wallet."
- **Data usage:** Declare that the extension does **not** collect or transmit user
  data to the developer. Note that (a) transactions go to user-chosen RPC nodes,
  and (b) if the user adds their own Gemini API key, transaction details are sent
  to Google under the user's key. Certify: no selling of data; complies with the
  Limited Use policy; no unrelated data collection.
- **Privacy policy URL:** **https://huanbv.github.io/aether-wallet/** (hosted via
  GitHub Pages from `/docs`; source in `docs/index.html`).

---

## 5. Listing copy

**Name:** AetherWallet — Non-Custodial Web3 Wallet

**Short description (≤132 chars):**
Open-source, non-custodial Web3 wallet. Local AES-256 encryption, multi-chain EVM, phishing guard, optional BYOK AI. Your keys, your device.

**Detailed description (EN):**
> AetherWallet is a 100% open-source, non-custodial Web3 wallet. Your seed phrase
> and private keys are generated and stored only on your device, encrypted with
> AES-256-GCM (PBKDF2, 310,000 iterations). We run no servers and collect no data.
>
> • Multi-chain EVM: Ethereum, BNB Chain, Polygon, Arbitrum, Base, Sepolia + custom RPCs
> • Phishing & drainer blacklist + address-poisoning detection
> • Transaction guard: local heuristics, plus optional deep analysis using YOUR
>   own Gemini API key (BYOK) — no shared key, nothing routed through us
> • EIP-1193 provider for dApp connections; EIP-155 replay-protected signing
> • Bilingual EN/VI, dark/light themes
> • MIT-licensed, fully auditable source: https://github.com/huanbv/aether-wallet

**Mô tả (VI):**
> AetherWallet là ví Web3 mã nguồn mở, không giữ hộ khóa. Seed phrase và private
> key được tạo và lưu **chỉ trên máy bạn**, mã hóa AES-256-GCM. Chúng tôi không có
> máy chủ và không thu thập dữ liệu. Hỗ trợ đa chuỗi EVM, chặn phishing/drainer,
> phát hiện address poisoning, và phân tích giao dịch bằng AI theo mô hình BYOK
> (bạn tự nhập khóa Gemini). Mã nguồn MIT, kiểm tra được.

**Category:** Productivity (or Developer Tools). **Language:** English + Vietnamese.

---

## 6. Notes for a crypto wallet review (important)

- CWS reviews wallets **strictly** (anti-scam). Expect a longer review and possibly
  identity verification.
- Keep all claims **truthful** (encryption params, "no server", open-source) — do
  not overstate. Being MIT open-source with readable, non-obfuscated code is a big
  plus; never upload minified-only/obfuscated code without matching public source.
- The broad host permission is justified by dApp injection; state this clearly in
  the permission justification to avoid rejection.
- After you go live on the store, users will auto-update via Chrome; the in-app
  GitHub update banner disables itself automatically for store installs.
