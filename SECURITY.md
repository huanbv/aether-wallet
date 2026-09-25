# Security Policy & Responsible Disclosure 🛡️

AetherWallet takes the security of user funds, cryptographic keys, and decentralized protocols with the highest level of priority. Because AetherWallet is a 100% non-custodial, client-side Web3 application, user private keys never touch any centralized servers.

---

## 🇻🇳 TIẾNG VIỆT — CHÍNH SÁCH BẢO MẬT & BÁO CÁO LỖ HỔNG

### 1. Quy Trình Báo Cáo Lỗ Hổng An Ninh Riêng Tư (Responsible Disclosure)
Nếu bạn phát hiện ra bất kỳ lỗ hổng bảo mật, lỗi rò rỉ bộ nhớ, hoặc nguy cơ tấn công nào trong mã nguồn AetherWallet, vui lòng **KHÔNG tạo Issue công khai trên GitHub**.

Hãy gửi báo cáo bảo mật bảo mật qua các kênh bảo mật sau:
- **Email Bảo Mật**: `security@aetherwallet.io` (hoặc thông qua tính năng GitHub Security Advisories)
- **Khóa PGP / GPG**: Sử dụng khóa PGP của Core Team để mã hóa nội dung báo cáo nếu cần thiết.

**Nội dung báo cáo nên bao gồm**:
1. Mô tả chi tiết lỗ hổng (Vulnerabily overview).
2. Các bước tái hiện (Proof-of-Concept / PoC steps).
3. Mức độ nghiêm trọng dự kiến (CVSS Score hoặc Critical / High / Medium / Low).
4. Đề xuất phương án khắc phục (nếu có).

Core Security Team cam kết phản hồi trong vòng **24 giờ** kể từ khi nhận được thông tin và giữ bí mật thông tin của nhà nghiên cứu cho đến khi bản vá được phát hành.

### 2. Chính Sách Bug Bounty (Thưởng Phát Hiện Lỗ Hổng)
Chúng tôi duy trì quỹ Bug Bounty dành cho các nhà nghiên cứu bảo mật (Whitehat Hackers) đóng góp tìm kiếm lỗ hổng:
- **Lỗ hổng Nghiêm Trọng (Critical)**: Rò rỉ Private Key từ Web Crypto Storage, vượt qua mã hóa AES-256-GCM, giải mã két ví không cần mật khẩu.
  * *Phần thưởng: Lên đến $10,000 USD (bằng USDC / ETH).*
- **Lỗ hổng Mức Cao (High)**: Bypass cơ chế kiểm duyệt Blacklist / Drainer Guard dẫn đến việc ký giao dịch rút tiền độc hại.
  * *Phần thưởng: Lên đến $3,000 USD.*
- **Lỗ hổng Mức Trung Bình (Medium)**: Lỗi phân giải địa chỉ, bypass CSP Manifest V3, rò rỉ metadata qua dApp inpage provider.
  * *Phần thưởng: Lên đến $1,000 USD.*

### 3. Khuyến Cáo An Toàn Tuyệt Đối Cho Người Dùng Cuối
- **Sao Lưu Ngoại Tuyến (Offline Cold Storage)**: Ghi lại 12 từ khóa bí mật ra giấy hoặc dập trên thẻ kim loại chống cháy. Không lưu trữ ảnh chụp màn hình lên Google Drive, iCloud, hoặc gửi qua tin nhắn.
- **Cảnh Giác Bẫy Address Poisoning**: Kẻ tấn công tạo ví có 6 ký tự đầu và 4 ký tự cuối giống ví của bạn. Luôn kiểm tra kỹ các ký tự ở giữa trước khi gửi tiền.
- **Không Chia Sẻ Mật Khẩu Chính**: Mật khẩu chính dùng để dẫn xuất khóa giải mã AES-256-GCM (310,000 vòng lặp PBKDF2) ngay trên máy của bạn.

---

## 🇬🇧 ENGLISH — SECURITY POLICY & RESPONSIBLE DISCLOSURE

### 1. Reporting Security Vulnerabilities
If you discover a security vulnerability within AetherWallet, please **do NOT report it via public GitHub issues**.

Report security vulnerabilities directly to:
- **Security Contact**: `security@aetherwallet.io` or open a private advisory via **GitHub Security Advisories**.
- **PGP Encryption**: Encrypt your submission with our security team's PGP key whenever sensitive exploits are attached.

Please provide:
- Type of issue (e.g. key extraction, memory leak, CSP violation, logic error).
- Step-by-step reproduction instructions or a minimal reproducible PoC.
- Affected components or versions.

We will acknowledge receipt within **24 hours** and coordinate a responsible release timeline.

### 2. Bug Bounty Program
AetherWallet operates a bug bounty program to reward security researchers who help protect the Web3 ecosystem:
- **Critical Severity**: Remote code execution, extraction of private keys, bypass of AES-256-GCM encryption.
  * *Reward: Up to $10,000 USD (in ETH or USDC).*
- **High Severity**: Bypass of Blacklist/Drainer Guard leading to arbitrary token authorization.
  * *Reward: Up to $3,000 USD.*
- **Medium Severity**: Inpage provider context leaks, CSP bypass without key access, UI spoofing.
  * *Reward: Up to $1,000 USD.*

### 3. End-User Best Practices
- **Never input your Seed Phrase on any website**: Legitimate dApps only request signatures through the browser extension popup (`window.ethereum`). No website ever needs your 12 recovery words.
- **Always inspect the Gemini AI Guard Risk Badge**: If an alert highlights unlimited token approval (`type(uint256).max`) or a known drainer contract, reject the request immediately.
- **Verify full address characters**: Guard against Address Poisoning attacks by comparing the middle characters, not merely the prefix and suffix.
