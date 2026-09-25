export type Language = 'en' | 'vi';

export interface TranslationDictionary {
  // Navigation & Header
  appTitle: string;
  appSubtitle: string;
  network: string;
  selectNetwork: string;
  addNetwork: string;
  manageNetworks: string;
  switchAccount: string;
  createAccount: string;
  importAccount: string;
  lockWallet: string;
  unlockWallet: string;
  account: string;
  addressCopied: string;

  // Common UI
  copy: string;
  copied: string;
  back: string;
  next: string;
  confirm: string;
  cancel: string;
  save: string;
  delete: string;
  close: string;
  refresh: string;
  loading: string;
  status: string;
  success: string;
  error: string;
  warning: string;
  optional: string;
  search: string;

  // Onboarding / Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  createNewWallet: string;
  createWalletDesc: string;
  importExistingWallet: string;
  importWalletDesc: string;
  setMasterPassword: string;
  setMasterPasswordDesc: string;
  passwordPlaceholder: string;
  confirmPasswordPlaceholder: string;
  passwordMismatch: string;
  passwordTooShort: string;
  passwordHelp: string;
  continueBtn: string;
  secretPhraseTitle: string;
  secretPhraseDesc: string;
  secretPhraseWarning: string;
  clickToRevealSeed: string;
  hideSeed: string;
  copySeedPhrase: string;
  seedPhraseCopied: string;
  iSavedSeedPhrase: string;
  verifySeedPhrase: string;
  selectWordsInOrder: string;
  importSeedTitle: string;
  importSeedDesc: string;
  enterSeedPlaceholder: string;
  invalidSeedPhrase: string;
  orImportPrivateKey: string;
  privateKeyPlaceholder: string;
  invalidPrivateKey: string;
  walletCreatedSuccess: string;
  walletImportedSuccess: string;

  // Unlock Screen
  unlockTitle: string;
  unlockDesc: string;
  unlockBtn: string;
  incorrectPassword: string;
  forgotPasswordReset: string;

  // Dashboard
  totalBalance: string;
  send: string;
  receive: string;
  swap: string;
  tokensTab: string;
  activityTab: string;
  noTokensFound: string;
  noActivityYet: string;
  viewOnExplorer: string;
  nativeToken: string;
  customToken: string;
  addCustomToken: string;
  tokenContractAddress: string;
  tokenSymbol: string;
  tokenDecimals: string;

  // Send Screen & AI Guard
  sendTitle: string;
  sendSubtitle: string;
  recipientAddress: string;
  recipientPlaceholder: string;
  amount: string;
  maxAmount: string;
  availableBalance: string;
  calldataHex: string;
  calldataPlaceholder: string;
  advancedCalldata: string;
  gasFeeEstimated: string;
  totalCost: string;
  insufficientFunds: string;
  invalidRecipient: string;
  invalidAmount: string;
  analyzeWithAI: string;
  aiGuardTitle: string;
  aiGuardDesc: string;
  aiAnalyzing: string;
  aiSafeBadge: string;
  aiSuspiciousBadge: string;
  aiMaliciousBadge: string;
  aiRiskScore: string;
  aiWarningNotes: string;
  aiRecommendation: string;
  aiBypassWarning: string;
  confirmSendBtn: string;
  transactionSubmitted: string;
  viewTransaction: string;

  // Receive Screen
  receiveTitle: string;
  receiveSubtitle: string;
  scanQrToPay: string;
  onlySendThisNetwork: string;
  copyWalletAddress: string;

  // Settings
  settingsTitle: string;
  generalTab: string;
  networksTab: string;
  securityTab: string;
  aboutTab: string;
  themeSetting: string;
  themeDark: string;
  themeLight: string;
  languageSetting: string;
  aiSecuritySetting: string;
  aiSecurityDescription: string;
  aiGuardEnabled: string;
  aiGuardDisabled: string;
  customRpcSetting: string;
  networkNamePlaceholder: string;
  rpcUrlPlaceholder: string;
  chainIdPlaceholder: string;
  symbolPlaceholder: string;
  explorerUrlPlaceholder: string;
  addNetworkBtn: string;
  resetNetworksToDefault: string;
  exportSeedPhrase: string;
  exportPrivateKey: string;
  viewRecoveryPhrase: string;
  viewPrivateKey: string;
  securityCaution: string;
  enterPasswordToConfirm: string;
  yourPrivateKey: string;
  yourRecoveryPhrase: string;
  resetWalletData: string;
  resetWalletWarning: string;
  confirmResetWallet: string;

  // Blacklist & Security Hardening
  blacklistTab: string;
  blacklistTitle: string;
  blacklistDesc: string;
  addBlacklistAddress: string;
  addressPlaceholder: string;
  reasonPlaceholder: string;
  blacklistEmpty: string;
  addressBlockedAlert: string;
  addressPoisoningAlert: string;
  addressPoisoningConfirmed: string;
  blockedActionBtn: string;
  autoLockSetting: string;
  autoLockMinutes: string;

  // Open Source & Community
  openSourceBanner: string;
  openSourceDesc: string;
  githubRepo: string;
  viewCode: string;
  version: string;
  mitLicense: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appTitle: 'AetherWallet',
    appSubtitle: 'Decentralized Non-Custodial Web3 Extension',
    network: 'Network',
    selectNetwork: 'Select Network',
    addNetwork: 'Add Custom Network',
    manageNetworks: 'Manage RPC Networks',
    switchAccount: 'Switch Account',
    createAccount: 'Create New Account',
    importAccount: 'Import Account',
    lockWallet: 'Lock Wallet',
    unlockWallet: 'Unlock Wallet',
    account: 'Account',
    addressCopied: 'Address copied to clipboard!',

    copy: 'Copy',
    copied: 'Copied!',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    close: 'Close',
    refresh: 'Refresh',
    loading: 'Loading...',
    status: 'Status',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    optional: 'Optional',
    search: 'Search...',

    welcomeTitle: 'Your Sovereign Web3 Gateway',
    welcomeSubtitle: '100% Client-Side. No centralized trackers. Protected by AES-256-GCM and Gemini AI Transaction Guard.',
    createNewWallet: 'Create a New Wallet',
    createWalletDesc: 'Generate a new 12-word Secret Recovery Phrase to secure your crypto assets.',
    importExistingWallet: 'Import Existing Wallet',
    importWalletDesc: 'Restore with 12 or 24-word Secret Recovery Phrase or Raw Private Key.',
    setMasterPassword: 'Set Master Password',
    setMasterPasswordDesc: 'This password encrypts your private keys locally using AES-256-GCM on this device.',
    passwordPlaceholder: 'Enter master password (min 8 chars)',
    confirmPasswordPlaceholder: 'Confirm master password',
    passwordMismatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 8 characters with letters & numbers.',
    passwordHelp: 'AetherWallet cannot recover your password. Please remember it safely.',
    continueBtn: 'Continue',
    secretPhraseTitle: 'Secret Recovery Phrase',
    secretPhraseDesc: 'Write down these 12 words in precise order and store them in an offline safe place.',
    secretPhraseWarning: 'Never share your Secret Phrase with anyone. Anyone with this phrase can steal your funds permanently.',
    clickToRevealSeed: 'Click to reveal secret words',
    hideSeed: 'Hide words',
    copySeedPhrase: 'Copy Secret Phrase',
    seedPhraseCopied: 'Secret recovery phrase copied!',
    iSavedSeedPhrase: 'I have saved my secret recovery phrase securely',
    verifySeedPhrase: 'Verify Recovery Phrase',
    selectWordsInOrder: 'Select the words in the exact sequence as shown:',
    importSeedTitle: 'Import Recovery Phrase',
    importSeedDesc: 'Type or paste your 12 or 24-word recovery phrase separated by single spaces.',
    enterSeedPlaceholder: 'e.g. apple banana cherry dog elephant fox grape horse igloo jacket kite lion',
    invalidSeedPhrase: 'Invalid mnemonic phrase. Please verify word spellings.',
    orImportPrivateKey: 'Or import via Private Key',
    privateKeyPlaceholder: '0x...',
    invalidPrivateKey: 'Invalid 64-character EVM private key hex.',
    walletCreatedSuccess: 'Wallet initialized successfully!',
    walletImportedSuccess: 'Wallet imported successfully!',

    unlockTitle: 'Welcome Back',
    unlockDesc: 'Enter your master password to unlock your decentralized vault.',
    unlockBtn: 'Unlock Vault',
    incorrectPassword: 'Incorrect master password. Please try again.',
    forgotPasswordReset: 'Forgot password? Reset and re-import with seed phrase',

    totalBalance: 'Total Balance',
    send: 'Send',
    receive: 'Receive',
    swap: 'Swap',
    tokensTab: 'Tokens',
    activityTab: 'Activity',
    noTokensFound: 'No custom tokens added.',
    noActivityYet: 'No transactions found on this network.',
    viewOnExplorer: 'View on Block Explorer',
    nativeToken: 'Native Coin',
    customToken: 'Custom Token',
    addCustomToken: '+ Add Token',
    tokenContractAddress: 'Token Contract Address',
    tokenSymbol: 'Token Symbol',
    tokenDecimals: 'Decimals',

    sendTitle: 'Send Assets',
    sendSubtitle: 'Transfer native coins or tokens across EVM chains safely.',
    recipientAddress: 'Recipient Address',
    recipientPlaceholder: '0x... or ENS domain name',
    amount: 'Amount',
    maxAmount: 'Max',
    availableBalance: 'Available',
    calldataHex: 'Hex Data (Calldata)',
    calldataPlaceholder: '0x (Optional contract interaction data)',
    advancedCalldata: 'Advanced / Contract Calldata',
    gasFeeEstimated: 'Est. Network Gas',
    totalCost: 'Total (Amount + Gas)',
    insufficientFunds: 'Insufficient funds for transfer and gas fee.',
    invalidRecipient: 'Please enter a valid Ethereum hex address (0x...).',
    invalidAmount: 'Please enter a valid amount greater than 0.',
    analyzeWithAI: 'AI Security Guard Analysis',
    aiGuardTitle: 'Gemini AI Transaction Guard',
    aiGuardDesc: 'Real-time smart contract & calldata security audit powered by Google AI Studio.',
    aiAnalyzing: 'Auditing smart contract calldata & recipient address...',
    aiSafeBadge: 'SAFE TRANSACTION',
    aiSuspiciousBadge: 'SUSPICIOUS ACTIVITY',
    aiMaliciousBadge: 'HIGH RISK / MALICIOUS',
    aiRiskScore: 'Risk Index',
    aiWarningNotes: 'Security Observations',
    aiRecommendation: 'Security Advice',
    aiBypassWarning: 'I understand the risks and wish to proceed anyway',
    confirmSendBtn: 'Sign & Broadcast Transaction',
    transactionSubmitted: 'Transaction broadcasted to mempool!',
    viewTransaction: 'Check Status on Explorer',

    receiveTitle: 'Receive Assets',
    receiveSubtitle: 'Scan QR code or copy your public wallet address.',
    scanQrToPay: 'Scan QR Code from another mobile device or exchange',
    onlySendThisNetwork: 'Only send supported EVM assets to this address on the selected network.',
    copyWalletAddress: 'Copy Address',

    settingsTitle: 'Settings & Security',
    generalTab: 'General',
    networksTab: 'Networks',
    securityTab: 'Security',
    aboutTab: 'About',
    themeSetting: 'Interface Appearance',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    languageSetting: 'Language (Ngôn ngữ)',
    aiSecuritySetting: 'Gemini AI Transaction Guard',
    aiSecurityDescription: 'Audit calldata, drainer signatures, and zero-day phishing contracts before signing.',
    aiGuardEnabled: 'Enabled (Recommended)',
    aiGuardDisabled: 'Disabled',
    customRpcSetting: 'RPC Node Endpoints',
    networkNamePlaceholder: 'Network Name (e.g. My Private Node)',
    rpcUrlPlaceholder: 'RPC URL (https://...)',
    chainIdPlaceholder: 'Chain ID (e.g. 1)',
    symbolPlaceholder: 'Currency Symbol (e.g. ETH)',
    explorerUrlPlaceholder: 'Block Explorer URL (https://...)',
    addNetworkBtn: 'Add Custom Network',
    resetNetworksToDefault: 'Restore Default Networks',
    exportSeedPhrase: 'Export Secret Recovery Phrase',
    exportPrivateKey: 'Export Private Key',
    viewRecoveryPhrase: 'View Seed Phrase',
    viewPrivateKey: 'View Private Key',
    securityCaution: 'Keep your secret credentials offline. Anyone who views these can drain all your accounts.',
    enterPasswordToConfirm: 'Enter your master password to unlock:',
    yourPrivateKey: 'Your Raw Private Key',
    yourRecoveryPhrase: 'Your Secret Recovery Phrase',
    resetWalletData: 'Reset Entire Wallet',
    resetWalletWarning: 'This will purge all encrypted keys and settings from this browser. Ensure you backed up your recovery phrase.',
    confirmResetWallet: 'Yes, Purge Wallet Data',

    blacklistTab: 'Blacklist',
    blacklistTitle: 'Phishing & Drainer Blacklist',
    blacklistDesc: 'Automatically intercept known malicious drainers, burn addresses, and manage custom blocked accounts.',
    addBlacklistAddress: 'Block Suspicious Address',
    addressPlaceholder: '0x... address to block',
    reasonPlaceholder: 'Reason for blocking (e.g. impersonator scam)',
    blacklistEmpty: 'No custom blocked addresses yet.',
    addressBlockedAlert: 'CRITICAL ALERT: This address is in the Blacklist! Signing is strictly blocked.',
    addressPoisoningAlert: 'WARNING: Potential Address Poisoning detected! Front/back characters match your wallet.',
    addressPoisoningConfirmed: 'I verified all 42 characters and confirm this address is authentic',
    blockedActionBtn: 'Transaction Blocked (Security Hazard)',
    autoLockSetting: 'Auto-Lock Inactivity Timeout',
    autoLockMinutes: 'Minutes before vault locks',

    openSourceBanner: '100% Free & Open-Source Software',
    openSourceDesc: 'AetherWallet is built for the global decentralized community. Zero tracking, zero telemetry, full self-custody.',
    githubRepo: 'GitHub Repository',
    viewCode: 'Inspect Source Code',
    version: 'Version 1.0.0 (Production Release)',
    mitLicense: 'MIT Open-Source License',
  },
  vi: {
    appTitle: 'AetherWallet',
    appSubtitle: 'Ví Web3 Phi Tập Trung Chuẩn Extension',
    network: 'Mạng',
    selectNetwork: 'Chọn Mạng',
    addNetwork: 'Thêm Mạng Tùy Chỉnh',
    manageNetworks: 'Quản Lý Mạng RPC',
    switchAccount: 'Chuyển Đổi Tài Khoản',
    createAccount: 'Tạo Tài Khoản Mới',
    importAccount: 'Nhập Tài Khoản',
    lockWallet: 'Khóa Ví',
    unlockWallet: 'Mở Khóa Ví',
    account: 'Tài khoản',
    addressCopied: 'Đã sao chép địa chỉ ví!',

    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    back: 'Quay lại',
    next: 'Tiếp tục',
    confirm: 'Xác nhận',
    cancel: 'Hủy bỏ',
    save: 'Lưu',
    delete: 'Xóa',
    close: 'Đóng',
    refresh: 'Làm mới',
    loading: 'Đang tải...',
    status: 'Trạng thái',
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    optional: 'Tùy chọn',
    search: 'Tìm kiếm...',

    welcomeTitle: 'Cánh Cổng Web3 Tự Chủ Của Bạn',
    welcomeSubtitle: '100% Phía Client. Không máy chủ trung gian, mã hóa chuẩn AES-256-GCM và tích hợp Trợ Thủ AI Bảo Vệ Giao Dịch Gemini.',
    createNewWallet: 'Tạo Ví Mới',
    createWalletDesc: 'Tạo Cụm Từ Khôi Phục Bí Mật (12 từ) để tự bảo vệ tài sản số của bạn.',
    importExistingWallet: 'Nhập Ví Đã Có',
    importWalletDesc: 'Khôi phục ví bằng Cụm từ hạt giống (12/24 từ) hoặc Khóa cá nhân (Private Key).',
    setMasterPassword: 'Thiết Lập Mật Khẩu Chính',
    setMasterPasswordDesc: 'Mật khẩu này dùng để mã hóa Khóa cá nhân của bạn cục bộ bằng thuật toán AES-256-GCM trên thiết bị này.',
    passwordPlaceholder: 'Nhập mật khẩu chính (tối thiểu 8 ký tự)',
    confirmPasswordPlaceholder: 'Nhập lại mật khẩu chính',
    passwordMismatch: 'Mật khẩu nhập lại không khớp.',
    passwordTooShort: 'Mật khẩu phải có ít nhất 8 ký tự bao gồm cả chữ và số.',
    passwordHelp: 'AetherWallet không thể khôi phục mật khẩu giúp bạn. Hãy ghi nhớ cẩn thận.',
    continueBtn: 'Tiếp Tục',
    secretPhraseTitle: 'Cụm Từ Khôi Phục Bí Mật',
    secretPhraseDesc: 'Ghi lại 12 từ này theo đúng thứ tự chính xác và cất giữ ở nơi an toàn ngoại tuyến (offline).',
    secretPhraseWarning: 'Tuyệt đối không chia sẻ Cụm từ khôi phục với bất kỳ ai. Bất cứ ai có cụm từ này đều có thể lấy cắp toàn bộ tiền của bạn.',
    clickToRevealSeed: 'Nhấp để hiển thị cụm từ bí mật',
    hideSeed: 'Ẩn cụm từ',
    copySeedPhrase: 'Sao chép cụm từ bí mật',
    seedPhraseCopied: 'Đã sao chép 12 từ khóa bí mật!',
    iSavedSeedPhrase: 'Tôi đã lưu trữ cụm từ bí mật an toàn',
    verifySeedPhrase: 'Xác Nhận Cụm Từ Bí Mật',
    selectWordsInOrder: 'Chọn các từ theo đúng thứ tự ban đầu:',
    importSeedTitle: 'Nhập Cụm Từ Khôi Phục',
    importSeedDesc: 'Nhập hoặc dán cụm từ 12 hoặc 24 từ của bạn, mỗi từ cách nhau bởi một dấu cách đơn.',
    enterSeedPlaceholder: 'ví dụ: apple banana cherry dog elephant fox grape horse igloo jacket kite lion',
    invalidSeedPhrase: 'Cụm từ khôi phục không hợp lệ. Vui lòng kiểm tra lại chính tả các từ.',
    orImportPrivateKey: 'Hoặc nhập bằng Khóa Cá Nhân (Private Key)',
    privateKeyPlaceholder: '0x...',
    invalidPrivateKey: 'Khóa cá nhân EVM không hợp lệ (cần 64 ký tự hex).',
    walletCreatedSuccess: 'Khởi tạo ví thành công!',
    walletImportedSuccess: 'Nhập ví thành công!',

    unlockTitle: 'Chào Mừng Trở Lại',
    unlockDesc: 'Nhập mật khẩu chính để mở khóa két bảo mật phi tập trung của bạn.',
    unlockBtn: 'Mở Khóa Ví',
    incorrectPassword: 'Mật khẩu chính không chính xác. Vui lòng thử lại.',
    forgotPasswordReset: 'Quên mật khẩu? Đặt lại ví và nhập lại bằng cụm từ khôi phục',

    totalBalance: 'Tổng Số Dư',
    send: 'Gửi',
    receive: 'Nhận',
    swap: 'Hoán đổi',
    tokensTab: 'Tài Sản',
    activityTab: 'Hoạt Động',
    noTokensFound: 'Chưa có token tùy chỉnh nào.',
    noActivityYet: 'Chưa có giao dịch nào trên mạng này.',
    viewOnExplorer: 'Xem trên Trình Khám Phá Khối',
    nativeToken: 'Đồng Tiền Gốc',
    customToken: 'Token Tùy Chỉnh',
    addCustomToken: '+ Thêm Token',
    tokenContractAddress: 'Địa Chỉ Hợp Đồng Token',
    tokenSymbol: 'Ký Hiệu Token',
    tokenDecimals: 'Số Thập Phân (Decimals)',

    sendTitle: 'Gửi Tài Sản',
    sendSubtitle: 'Chuyển đồng tiền gốc hoặc token trên các mạng EVM an toàn.',
    recipientAddress: 'Địa Chỉ Người Nhận',
    recipientPlaceholder: '0x... hoặc tên miền ENS',
    amount: 'Số Lượng',
    maxAmount: 'Tối đa',
    availableBalance: 'Khả dụng',
    calldataHex: 'Dữ Liệu Hex (Calldata)',
    calldataPlaceholder: '0x (Dữ liệu tương tác hợp đồng thông minh tùy chọn)',
    advancedCalldata: 'Nâng Cao / Calldata Hợp Đồng',
    gasFeeEstimated: 'Ước Tính Phí Gas',
    totalCost: 'Tổng Cộng (Số tiền + Gas)',
    insufficientFunds: 'Số dư không đủ để thực hiện giao dịch và trả phí gas.',
    invalidRecipient: 'Vui lòng nhập địa chỉ ví Ethereum hợp lệ (bắt đầu bằng 0x...).',
    invalidAmount: 'Vui lòng nhập số tiền hợp lệ lớn hơn 0.',
    analyzeWithAI: 'Kiểm Tra An Ninh Bằng Gemini AI',
    aiGuardTitle: 'Gemini AI Transaction Guard',
    aiGuardDesc: 'Kiểm toán an ninh calldata & địa chỉ hợp đồng thông minh theo thời gian thực từ Google AI Studio.',
    aiAnalyzing: 'Đang phân tích dữ liệu calldata & địa chỉ người nhận qua Gemini AI...',
    aiSafeBadge: 'GIAO DỊCH AN TOÀN',
    aiSuspiciousBadge: 'HOẠT ĐỘNG NGHI VẤN',
    aiMaliciousBadge: 'RỦI RO CAO / LỪA ĐẢO',
    aiRiskScore: 'Chỉ Số Rủi Ro',
    aiWarningNotes: 'Chi Tiết Cảnh Báo An Ninh',
    aiRecommendation: 'Khuyến Nghị Hành Động',
    aiBypassWarning: 'Tôi hiểu rõ rủi ro và vẫn muốn tiếp tục ký giao dịch',
    confirmSendBtn: 'Ký & Phát Sóng Giao Dịch',
    transactionSubmitted: 'Giao dịch đã được phát sóng lên mạng!',
    viewTransaction: 'Kiểm tra trạng thái trên Explorer',

    receiveTitle: 'Nhận Tài Sản',
    receiveSubtitle: 'Quét mã QR hoặc sao chép địa chỉ ví công khai của bạn.',
    scanQrToPay: 'Quét mã QR từ điện thoại hoặc sàn giao dịch khác',
    onlySendThisNetwork: 'Chỉ gửi tài sản EVM được hỗ trợ đến địa chỉ này trên đúng mạng đã chọn.',
    copyWalletAddress: 'Sao Chép Địa Chỉ',

    settingsTitle: 'Cài Đặt & Bảo Mật',
    generalTab: 'Chung',
    networksTab: 'Mạng RPC',
    securityTab: 'Bảo Mật',
    aboutTab: 'Giới Thiệu',
    themeSetting: 'Giao Diện Người Dùng',
    themeDark: 'Chế độ Tối (Dark)',
    themeLight: 'Chế độ Sáng (Light)',
    languageSetting: 'Ngôn Ngữ (Language)',
    aiSecuritySetting: 'Bảo Vệ Giao Dịch Bằng Gemini AI',
    aiSecurityDescription: 'Tự động phát hiện hợp đồng rút cạn tiền (drainer), chữ ký độc hại, phishing trước khi ký.',
    aiGuardEnabled: 'Đang Bật (Khuyến nghị)',
    aiGuardDisabled: 'Đang Tắt',
    customRpcSetting: 'Điểm Cuối Node RPC',
    networkNamePlaceholder: 'Tên Mạng (ví dụ: Node Riêng Của Tôi)',
    rpcUrlPlaceholder: 'Địa chỉ RPC (https://...)',
    chainIdPlaceholder: 'Chain ID (ví dụ: 1)',
    symbolPlaceholder: 'Ký Hiệu Tiền Tệ (ví dụ: ETH)',
    explorerUrlPlaceholder: 'Trình Khám Phá Khối (https://...)',
    addNetworkBtn: 'Thêm Mạng Tùy Chỉnh',
    resetNetworksToDefault: 'Khôi Phục Mạng Mặc Định',
    exportSeedPhrase: 'Xuất Cụm Từ Khôi Phục Bí Mật',
    exportPrivateKey: 'Xuất Khóa Cá Nhân (Private Key)',
    viewRecoveryPhrase: 'Xem Cụm Từ Bí Mật',
    viewPrivateKey: 'Xem Khóa Cá Nhân',
    securityCaution: 'Lưu trữ thông tin bí mật này ngoại tuyến. Bất cứ ai xem được đều có thể lấy hết tài sản của bạn.',
    enterPasswordToConfirm: 'Nhập mật khẩu chính để xác nhận:',
    yourPrivateKey: 'Khóa Cá Nhân (Private Key) Của Bạn',
    yourRecoveryPhrase: 'Cụm Từ Khôi Phục Của Bạn',
    resetWalletData: 'Xóa Toàn Bộ Dữ Liệu Ví',
    resetWalletWarning: 'Thao tác này sẽ xóa sạch các khóa đã mã hóa và cài đặt khỏi trình duyệt. Đảm bảo bạn đã sao lưu cụm từ bí mật.',
    confirmResetWallet: 'Đồng Ý Xóa Sạch Dữ Liệu Ví',

    blacklistTab: 'Danh Sách Đen',
    blacklistTitle: 'Danh Sách Đen Chống Lừa Đảo',
    blacklistDesc: 'Tự động chặn các hợp đồng drainer độc hại, địa chỉ burn và quản lý danh sách địa chỉ bị cấm cá nhân.',
    addBlacklistAddress: 'Chặn Địa Chỉ Nghi Vấn',
    addressPlaceholder: 'Địa chỉ 0x... cần chặn',
    reasonPlaceholder: 'Lý do chặn (ví dụ: mạo danh lừa đảo)',
    blacklistEmpty: 'Chưa có địa chỉ nào trong danh sách đen cá nhân.',
    addressBlockedAlert: 'CẢNH BÁO NGUY HIỂM: Địa chỉ này nằm trong Danh Sách Đen! Giao dịch bị khóa cứng.',
    addressPoisoningAlert: 'CẢNH BÁO: Phát hiện bẫy Address Poisoning! Ký tự đầu/cuối trùng ví của bạn.',
    addressPoisoningConfirmed: 'Tôi đã đối chiếu kỹ toàn bộ 42 ký tự và xác nhận địa chỉ chính xác',
    blockedActionBtn: 'Giao Dịch Đã Bị Khóa (Rủi Ro Nghiêm Trọng)',
    autoLockSetting: 'Tự Động Khóa Khi Không Thao Tác',
    autoLockMinutes: 'Số phút trước khi tự động khóa két',

    openSourceBanner: '100% Mã Nguồn Mở & Miễn Phí Tự Do',
    openSourceDesc: 'AetherWallet được xây dựng vì cộng đồng phi tập trung toàn cầu. Không theo dõi người dùng, không phụ thuộc máy chủ trung tâm.',
    githubRepo: 'Kho Mã Nguồn GitHub',
    viewCode: 'Xem Mã Nguồn Trên GitHub',
    version: 'Phiên bản 1.0.0 (Chính thức)',
    mitLicense: 'Giấy Phép Mã Nguồn Mở MIT',
  },
};
