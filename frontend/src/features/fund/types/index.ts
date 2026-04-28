export type PaymentStatus = 'PENDING' | 'CONFIRMED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO';
export type CollectionMemberStatus = 'NONE' | 'PENDING' | 'CONFIRMED';

export interface Fund {
  id: string;
  name: string;
  description: string | null;
  balance: number;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankBin: string | null;
  bankShortName: string | null;
}

export interface FundCollection {
  id: string;
  fundId: string;
  title: string;
  amount: number;
  description: string | null;
  dueDate: string | null;
  active: boolean;
}

export interface FundPayment {
  id: string;
  collectionId: string;
  memberId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string | null;
  note: string | null;
  confirmedById: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface FundExpense {
  id: string;
  title: string;
  amount: number;
  description: string | null;
  recordedById: string;
  expenseDate: string;
}

export interface FundSummary {
  fund: Fund;
  totalCollected: number;
  totalExpenses: number;
  collections: FundCollection[];
}

export interface FundCapabilities {
  canManage: boolean;
  vnpayEnabled: boolean;
  momoEnabled: boolean;
}

export interface CollectionMemberRow {
  userId: string;
  memberId: string;
  displayName: string;
  avatarUrl: string | null;
  status: CollectionMemberStatus;
  paymentId: string | null;
  amountPaid: number | null;
  paymentMethod: PaymentMethod | null;
  transactionRef: string | null;
}

export interface CollectionStatus {
  collectionId: string;
  expectedAmount: number;
  totalMembers: number;
  paidCount: number;
  pendingCount: number;
  unpaidCount: number;
  totalCollected: number;
  rows: CollectionMemberRow[];
}

export interface InitiatePaymentResult {
  paymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transferContent: string;
  qrImageUrl: string | null;
  redirectUrl: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankShortName: string | null;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản (VietQR)',
  VNPAY: 'VNPay',
  MOMO: 'Ví MoMo',
};

export const STATUS_LABELS: Record<CollectionMemberStatus, string> = {
  NONE: 'Chưa đóng',
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã đóng',
};

export const STATUS_VARIANT: Record<CollectionMemberStatus, 'amber' | 'green' | 'red'> = {
  NONE: 'red',
  PENDING: 'amber',
  CONFIRMED: 'green',
};

/**
 * Common Vietnamese banks with their NAPAS BIN. The list is intentionally
 * short — the user can also type a custom BIN. Source: napas.com.vn /
 * vietqr.io. Add more as needed.
 */
export const COMMON_BANKS: Array<{ bin: string; shortName: string; name: string }> = [
  { bin: '970436', shortName: 'VCB',     name: 'Vietcombank' },
  { bin: '970418', shortName: 'BIDV',    name: 'BIDV' },
  { bin: '970422', shortName: 'MB',      name: 'MB Bank' },
  { bin: '970407', shortName: 'TCB',     name: 'Techcombank' },
  { bin: '970432', shortName: 'VPB',     name: 'VPBank' },
  { bin: '970415', shortName: 'VietinBank', name: 'VietinBank' },
  { bin: '970403', shortName: 'STB',     name: 'Sacombank' },
  { bin: '970416', shortName: 'ACB',     name: 'ACB' },
  { bin: '970423', shortName: 'TPB',     name: 'TPBank' },
  { bin: '970454', shortName: 'VCCB',    name: 'Bản Việt' },
  { bin: '970441', shortName: 'VIB',     name: 'VIB' },
  { bin: '970448', shortName: 'OCB',     name: 'OCB' },
  { bin: '970437', shortName: 'HDB',     name: 'HDBank' },
  { bin: '970405', shortName: 'AGRIBANK', name: 'Agribank' },
  { bin: '970428', shortName: 'NAB',     name: 'Nam Á Bank' },
  { bin: '970443', shortName: 'SHB',     name: 'SHB' },
  { bin: '970426', shortName: 'MSB',     name: 'MSB' },
  { bin: '970429', shortName: 'SCB',     name: 'SCB' },
];
