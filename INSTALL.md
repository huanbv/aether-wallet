# Hướng Dẫn Cài Đặt / Installation Guide

AetherWallet là extension Chrome MV3, ví Web3 phi tập trung (non-custodial).
Có hai cách dùng tùy bạn là **người dùng thường** hay **lập trình viên**.

---

## 👤 A. Người dùng thường — KHÔNG cần build

Bạn chỉ cần tải bản đã đóng gói sẵn. Không cần cài Node, không cần chạy lệnh nào.

### 🇻🇳 Các bước
1. Mở trang **[Releases](https://github.com/huanbv/aether-wallet/releases/latest)**.
2. Tải file `aether-wallet-v1.0.0-chrome.zip` trong mục **Assets**.
3. **Giải nén** file → bạn được thư mục tên `aether-wallet`.
4. Mở trình duyệt (Chrome / Brave / Edge / Cốc Cốc) → gõ vào thanh địa chỉ: `chrome://extensions/`
5. Bật công tắc **Developer mode / Chế độ dành cho nhà phát triển** (góc trên bên phải).
6. Bấm **Load unpacked / Tải tiện ích đã giải nén** → chọn thư mục `aether-wallet` vừa giải nén.
7. Ghim biểu tượng ví (Æ) lên thanh công cụ. Xong!

> ⚠️ Lưu ý: chọn đúng **thư mục** `aether-wallet` (thư mục chứa file `manifest.json`), không phải chọn file zip.

### 🇬🇧 Steps
1. Open **[Releases](https://github.com/huanbv/aether-wallet/releases/latest)**.
2. Download `aether-wallet-v1.0.0-chrome.zip` under **Assets**.
3. **Unzip** it → you get a folder named `aether-wallet`.
4. Open `chrome://extensions/` in your browser.
5. Enable **Developer mode** (top-right toggle).
6. Click **Load unpacked** → select the unzipped `aether-wallet` folder.
7. Pin the wallet (Æ) to your toolbar. Done!

---

## 👨‍💻 B. Lập trình viên — build từ mã nguồn

Dùng khi bạn muốn sửa/đóng góp code hoặc tự build bản riêng.

### Yêu cầu
- **Node.js** ≥ 18, và **bun** (khuyến nghị) hoặc **npm**.

### Các bước
```bash
# 1. Tải mã nguồn
git clone https://github.com/huanbv/aether-wallet.git
cd aether-wallet

# 2. Cài dependencies
bun install          # hoặc: npm install

# 3a. Chạy dev server (xem trước trên trình duyệt tại http://localhost:5173)
bun run dev          # hoặc: npm run dev

# 3b. Hoặc build bản extension để nạp vào Chrome
bun run build        # hoặc: npm run build  -> tạo ra thư mục dist/
```

Sau khi `build`, nạp extension:
1. Mở `chrome://extensions/` → bật **Developer mode**.
2. **Load unpacked** → chọn thư mục **`dist/`**.

Kiểm tra chất lượng trước khi commit:
```bash
bun run lint         # tsc --noEmit (kiểm tra kiểu TypeScript)
```

---

## 🔐 Bật/tắt AI Transaction Guard (tùy chọn — BYOK)

Ví hoạt động đầy đủ **không cần** API key. Lớp phân tích sâu bằng AI là tùy chọn:

- **Không nhập key** → chạy ở **chế độ cục bộ**: chặn blacklist (drainer/burn đã biết),
  phát hiện address poisoning, giải mã calldata (cảnh báo approve vô hạn / setApprovalForAll).
- **Nhập key riêng của bạn** (BYOK): vào **Cài đặt → Khóa API Gemini**, dán key lấy miễn phí tại
  [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Key được **mã hóa bằng mật khẩu chính**,
  chỉ lưu trên máy bạn, và gọi thẳng tới Google — không qua bất kỳ máy chủ nào.

The wallet works fully **without** an API key (local heuristic mode). To enable
deep AI inspection, paste your own Gemini key in **Settings → Your Gemini API Key**.
The key is encrypted with your master password, stored only on your device, and
sent directly to Google — never to any server.

---

## 🔄 Ghi chú cho maintainer: phát hành bản mới

Mỗi khi sửa code, người dùng thường chỉ nhận bản mới khi có **Release mới**:
```bash
bun run build                     # build lại dist/
# nén dist/ thành aether-wallet-vX.Y.Z-chrome.zip rồi tạo GitHub Release mới,
# hoặc thay file .zip trong Release hiện tại.
```
