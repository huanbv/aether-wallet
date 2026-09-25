import { BlacklistService, type AddressCheckResult } from './blacklist';

// Export both standard and camelCase aliases for developer convenience
export { BlacklistService };
export const blacklistService = BlacklistService;

export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
export type SecurityExecutionPath =
  | 'FAST_PATH_BLACKLIST'
  | 'FAST_PATH_POISONING'
  | 'GEMINI_AI'
  | 'LOCAL_HEURISTIC';

export interface SecurityAnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  summaryEN: string;
  summaryVI: string;
  warningPointsEN: string[];
  warningPointsVI: string[];
  recommendationEN: string;
  recommendationVI: string;
  timestamp: number;
  executionPath: SecurityExecutionPath;
  decodedCalldata?: {
    method: string;
    descriptionEN: string;
    descriptionVI: string;
    isInfiniteApproval: boolean;
  };
  blacklistCheck?: AddressCheckResult;
}

export interface TransactionInspectionRequest {
  toAddress: string;
  userAddress?: string;
  value: string;
  calldata?: string;
  chainId: number;
  networkName: string;
  tokenSymbol: string;
}

/**
 * Fast-path check: Query blacklist and address poisoning rules immediately (0ms latency, zero API tokens)
 */
export async function checkBlacklistFastPath(
  toAddress: string,
  userAddress?: string
): Promise<AddressCheckResult> {
  return await blacklistService.checkAddress(toAddress, userAddress);
}

/**
 * Decode EVM Raw CallData for standard ERC-20, ERC-721, and Permit methods
 */
export function decodeCallData(hexData?: string) {
  if (!hexData || hexData.trim() === '' || hexData.trim() === '0x') {
    return null;
  }

  const clean = hexData.trim().toLowerCase();
  const selector = clean.slice(0, 10);

  // 1. ERC-20 approve(address spender, uint256 amount) - 0x095ea7b3
  if (selector === '0x095ea7b3') {
    const isInfinite = clean.includes('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    return {
      method: 'ERC-20 approve()',
      isInfiniteApproval: isInfinite,
      descriptionEN: isInfinite
        ? 'DANGER: Unlimited Token Allowance requested. The spender contract can withdraw ALL your tokens at any time.'
        : 'Token allowance request for specified amount.',
      descriptionVI: isInfinite
        ? 'CẢNH BÁO: Yêu cầu cấp quyền chi tiêu token vô hạn (type(uint256).max). Hợp đồng này có thể rút cạn toàn bộ token của bạn bất kỳ lúc nào.'
        : 'Yêu cầu cấp quyền chi tiêu token với số lượng cụ thể.',
    };
  }

  // 2. ERC-721 / ERC-1155 setApprovalForAll(address operator, bool approved) - 0xa22cb465
  if (selector === '0xa22cb465') {
    const isApprovedTrue = clean.endsWith('1');
    return {
      method: 'setApprovalForAll()',
      isInfiniteApproval: isApprovedTrue,
      descriptionEN: isApprovedTrue
        ? 'DANGER: Full NFT Collection Operator Approval. The operator can transfer ALL NFTs in this contract out of your wallet!'
        : 'Revoke full NFT collection operator approval.',
      descriptionVI: isApprovedTrue
        ? 'NGUY HIỂM: Cấp toàn quyền điều khiển toàn bộ bộ sưu tập NFT. Địa chỉ đối tác có thể rút hết tất cả NFT trong ví của bạn!'
        : 'Hủy quyền điều khiển toàn bộ bộ sưu tập NFT.',
    };
  }

  // 3. ERC-20 transfer(address to, uint256 amount) - 0xa9059cbb
  if (selector === '0xa9059cbb') {
    return {
      method: 'ERC-20 transfer()',
      isInfiniteApproval: false,
      descriptionEN: 'Standard token transfer to recipient.',
      descriptionVI: 'Chuyển token tiêu chuẩn đến địa chỉ nhận.',
    };
  }

  // 4. ERC-20 transferFrom(address from, address to, uint256 amount) - 0x23b872dd
  if (selector === '0x23b872dd') {
    return {
      method: 'ERC-20 transferFrom()',
      isInfiniteApproval: false,
      descriptionEN: 'Third-party allowance transfer execution.',
      descriptionVI: 'Thực thi chuyển token theo hạn mức được cấp.',
    };
  }

  // 5. EIP-2612 permit(...) - 0xd505accf
  if (selector === '0xd505accf') {
    return {
      method: 'EIP-2612 Gasless Permit Signature',
      isInfiniteApproval: clean.includes('ffffffffffffffffffffffffffffff'),
      descriptionEN: 'Off-chain gasless approval permit. High drainer risk if requested on unfamiliar sites.',
      descriptionVI: 'Chữ ký cấp quyền không tốn phí Gas (Permit). Rủi ro cao nếu được yêu cầu trên trang web lạ.',
    };
  }

  return {
    method: 'Custom Contract Interaction',
    isInfiniteApproval: false,
    descriptionEN: `Execution of custom smart contract method (Selector: ${selector}).`,
    descriptionVI: `Thực thi phương thức hợp đồng tùy chỉnh (Selector: ${selector}).`,
  };
}

/**
 * Local heuristic security rule checker (fallback & instant validation)
 */
function localRuleAudit(
  req: TransactionInspectionRequest,
  decoded: ReturnType<typeof decodeCallData>,
  blacklistCheck?: AddressCheckResult
): SecurityAnalysisResult {
  const warningsEN: string[] = [];
  const warningsVI: string[] = [];
  let score = 5;
  let level: RiskLevel = 'SAFE';

  // Evaluate decoded calldata
  if (decoded) {
    if (decoded.isInfiniteApproval) {
      level = 'MALICIOUS';
      score = 98;
      warningsEN.push(decoded.descriptionEN);
      warningsVI.push(decoded.descriptionVI);
    } else if (decoded.method === 'setApprovalForAll()') {
      level = 'SUSPICIOUS';
      score = 80;
      warningsEN.push(decoded.descriptionEN);
      warningsVI.push(decoded.descriptionVI);
    }
  }

  // High amount warning
  const numVal = parseFloat(req.value);
  if (!isNaN(numVal) && numVal > 10) {
    warningsEN.push(`Large transfer amount (${req.value} ${req.tokenSymbol}). Verify the recipient address carefully.`);
    warningsVI.push(`Số tiền chuyển lớn (${req.value} ${req.tokenSymbol}). Hãy đối chiếu từng ký tự địa chỉ nhận.`);
    score = Math.max(score, 30);
  }

  if (warningsEN.length === 0) {
    warningsEN.push('Standard peer-to-peer EVM native transfer. No known phishing anomalies.');
    warningsVI.push('Giao dịch chuyển tiền thông thường giữa các ví cá nhân. Không có dấu hiệu lừa đảo.');
  }

  return {
    riskLevel: level,
    riskScore: score,
    summaryEN: level === 'SAFE'
      ? 'Transaction looks safe with normal EVM parameters.'
      : level === 'SUSPICIOUS'
      ? 'Suspicious contract interactions or high permission grants detected.'
      : 'High security danger detected! Reconsider signing this transaction.',
    summaryVI: level === 'SAFE'
      ? 'Giao dịch có vẻ an toàn với các thông số EVM thông thường.'
      : level === 'SUSPICIOUS'
      ? 'Phát hiện tương tác hợp đồng đáng nghi hoặc cấp quyền chi tiêu quá lớn.'
      : 'Phát hiện nguy cơ bảo mật nghiêm trọng! Cân nhắc kỹ trước khi ký.',
    warningPointsEN: warningsEN,
    warningPointsVI: warningsVI,
    recommendationEN: level === 'SAFE'
      ? 'Standard caution applies. Verify network and gas fees.'
      : level === 'SUSPICIOUS'
      ? 'Review the contract address on the block explorer and ensure you trust the spender.'
      : 'Do not sign unless you are 100% certain of the receiving smart contract.',
    recommendationVI: level === 'SAFE'
      ? 'Áp dụng thận trọng thông thường. Kiểm tra kỹ phí gas và mạng lưới.'
      : level === 'SUSPICIOUS'
      ? 'Kiểm tra lại địa chỉ hợp đồng trên trình khám phá khối và đảm bảo bạn tin cậy bên được cấp quyền.'
      : 'Không nên ký giao dịch trừ khi bạn chắc chắn 100% về hợp đồng nhận tiền.',
    timestamp: Date.now(),
    executionPath: 'LOCAL_HEURISTIC',
    decodedCalldata: decoded || undefined,
    blacklistCheck,
  };
}

/**
 * Perform comprehensive AI Transaction Guard analysis:
 * 1. FAST PATH (0ms, 0 API tokens): Check blacklistService against local & user custom blacklist
 * 2. FAST PATH (0ms, 0 API tokens): Address Poisoning detection
 * 3. FAST PATH (0ms): CallData decoding
 * 4. DEEP INSPECTION: Google Gemini AI Analysis via Server Proxy (/api/analyze-transaction)
 */
export async function auditTransactionWithGemini(
  req: TransactionInspectionRequest
): Promise<SecurityAnalysisResult> {
  const decoded = decodeCallData(req.calldata);

  // STEP 1: FAST PATH - Blacklist Lookup via blacklistService
  // Immediate return if address is recognized on known drainer or burn database
  const blacklistCheck = await blacklistService.checkAddress(req.toAddress, req.userAddress);

  if (blacklistCheck.isBlocked) {
    return {
      riskLevel: 'MALICIOUS',
      riskScore: 100,
      summaryEN: blacklistCheck.reasonEN,
      summaryVI: blacklistCheck.reasonVI,
      warningPointsEN: [
        'Recipient address is on the Blacklist of known drainers, burn addresses, or user-blocked entities.',
        'Signing this transaction will result in permanent loss or theft of your funds.',
      ],
      warningPointsVI: [
        'Địa chỉ người nhận nằm trong Danh sách đen các địa chỉ lừa đảo, địa chỉ burn hoặc địa chỉ do bạn chặn.',
        'Ký giao dịch này sẽ dẫn đến việc mất trắng toàn bộ tài sản vĩnh viễn.',
      ],
      recommendationEN: 'DO NOT SIGN. Transaction is blocked to preserve your assets.',
      recommendationVI: 'TUYỆT ĐỐI KHÔNG KÝ. Giao dịch bị khóa để bảo vệ tài sản của bạn.',
      timestamp: Date.now(),
      executionPath: 'FAST_PATH_BLACKLIST',
      decodedCalldata: decoded || undefined,
      blacklistCheck,
    };
  }

  // STEP 2: FAST PATH - Address Poisoning Detection
  if (blacklistCheck.isPoisoningRisk) {
    return {
      riskLevel: 'SUSPICIOUS',
      riskScore: 90,
      summaryEN: blacklistCheck.reasonEN,
      summaryVI: blacklistCheck.reasonVI,
      warningPointsEN: [
        'Address Poisoning detected: Attacker crafted an address with identical start and end characters to trick you into copying from transaction history.',
        'Double-check all 42 characters of the recipient address before continuing.',
      ],
      warningPointsVI: [
        'Phát hiện tấn công Address Poisoning: Kẻ tấn công tạo địa chỉ có phần đầu và phần đuôi giống hệt địa chỉ của bạn nhằm lừa bạn copy từ lịch sử giao dịch.',
        'Hãy kiểm tra đối chiếu từng ký tự trong toàn bộ 42 ký tự của địa chỉ nhận.',
      ],
      recommendationEN: 'Verify the middle 32 characters on your original counterparty invoice.',
      recommendationVI: 'Đối chiếu 32 ký tự ở giữa từ nguồn gốc địa chỉ tin cậy của bạn.',
      timestamp: Date.now(),
      executionPath: 'FAST_PATH_POISONING',
      decodedCalldata: decoded || undefined,
      blacklistCheck,
    };
  }

  // STEP 3: Deep Inspection via Server Gemini AI Endpoint
  // Only called if address passes both fast-path checks!
  try {
    const response = await fetch('/api/analyze-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...req,
        decodedMethod: decoded?.method,
        isInfiniteApproval: decoded?.isInfiniteApproval,
      }),
    });

    if (!response.ok) {
      return localRuleAudit(req, decoded, blacklistCheck);
    }

    const data = await response.json();
    return {
      riskLevel: data.riskLevel || 'SAFE',
      riskScore: typeof data.riskScore === 'number' ? data.riskScore : 10,
      summaryEN: data.summaryEN || 'Transaction inspected.',
      summaryVI: data.summaryVI || 'Giao dịch đã được kiểm tra.',
      warningPointsEN: Array.isArray(data.warningPointsEN) ? data.warningPointsEN : [],
      warningPointsVI: Array.isArray(data.warningPointsVI) ? data.warningPointsVI : [],
      recommendationEN: data.recommendationEN || 'Proceed with standard caution.',
      recommendationVI: data.recommendationVI || 'Tiến hành với sự thận trọng thông thường.',
      timestamp: Date.now(),
      executionPath: 'GEMINI_AI',
      decodedCalldata: decoded || undefined,
      blacklistCheck,
    };
  } catch (error) {
    console.warn('[Gemini AI Guard] Network exception, using local heuristic auditor:', error);
    return localRuleAudit(req, decoded, blacklistCheck);
  }
}
