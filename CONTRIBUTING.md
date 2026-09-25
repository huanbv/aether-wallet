# Contributing to AetherWallet 🚀

Thank you for your interest in contributing to **AetherWallet** — the 100% decentralized, non-custodial, open-source Web3 extension wallet with AI transaction guards. We welcome contributions from developers, cryptographers, UI/UX designers, and blockchain enthusiasts worldwide!

---

## 🇻🇳 Hướng Dẫn Đóng Góp (Tiếng Việt)

### 1. Quy Trình Phát Triển (Development Workflow)
1. **Fork Kho Lưu Trữ**: Nhấn nút `Fork` ở góc trên bên phải trang GitHub.
2. **Clone về máy cá nhân**:
   ```bash
   git clone https://github.com/<your-username>/aether-wallet.git
   cd aether-wallet
   ```
3. **Cài đặt thư viện phụ thuộc**:
   ```bash
   npm install
   ```
4. **Cấu hình môi trường**:
   Sao chép file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
   Cung cấp `GEMINI_API_KEY` từ Google AI Studio nếu muốn kích hoạt tính năng kiểm tra an ninh AI Transaction Guard trên backend proxy.
5. **Chạy máy chủ phát triển (Dev Server)**:
   ```bash
   npm run dev
   ```
   Truy cập `http://localhost:3000` trên trình duyệt để kiểm thử giao diện và tương tác ví.

### 2. Quy Chuẩn Đóng Góp Mã Nguồn
- **Cam kết Không Telemetry / Không Lưu Trữ Khóa trên Server**: Tất cả các thao tác mã hóa khóa cá nhân phải tuân thủ chuẩn Web Crypto API (AES-256-GCM + PBKDF2) hoàn toàn ở phía client.
- **Tiêu chuẩn TypeScript**: Toàn bộ mã nguồn phải có kiểu dữ liệu rõ ràng, không sử dụng `any` bừa bãi.
- **Kiểm tra cú pháp & build**:
  ```bash
  npm run lint
  npm run build
  ```
- **Tạo nhánh (Branching)**: Đặt tên nhánh theo cấu trúc:
  - `feat/<ten-tinh-nang>`: Thêm tính năng mới (ví dụ: `feat/erc4337-account-abstraction`)
  - `fix/<loi-can-sua>`: Sửa lỗi (ví dụ: `fix/gas-estimation-polygon`)
  - `docs/<tai-lieu>`: Cập nhật tài liệu
- **Gửi Pull Request (PR)**:
  - Cung cấp mô tả chi tiết những gì đã thay đổi.
  - Đính kèm ảnh chụp màn hình hoặc video nếu thay đổi giao diện UI.

---

## 🇬🇧 Contribution Guidelines (English)

### 1. Code of Conduct
We are committed to providing a friendly, safe, and welcoming environment for everyone, regardless of background or experience level.

### 2. Submitting an Issue
- Before creating a new issue, please search existing issues to avoid duplicates.
- Use issue templates where available.
- Include reproduction steps, browser/OS version, and network details if reporting a bug.

### 3. Pull Request Guidelines
- Follow TypeScript best practices and project coding conventions.
- Maintain test coverage where applicable.
- Ensure all commits are descriptive and atomic.
- Keep PRs focused on a single change or feature for easier review.

### 4. Build Chrome Extension for Local Testing
To load the extension into Google Chrome, Brave, or Edge:
1. Run `npm run build`.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** toggle in the top right.
4. Click **Load unpacked** and select the `/dist` directory.
5. Pin the AetherWallet icon and begin testing!
