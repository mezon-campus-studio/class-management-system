import type { ID, Timestamp } from "@shared/utils/common";

export type FundStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

export interface FundCampaign {
    id: ID;
    classId: ID;
    title: string;
    description: string;
    amount: number; // Số tiền mỗi người cần đóng
    totalTarget?: number; // Tổng mục tiêu (nếu có)
    bankAccount: BankAccount;
    createdAt: Timestamp;
    status: "OPEN" | "CLOSED";
}

export interface FundTransaction {
    id: ID;
    campaignId: ID;
    userId: ID;
    userName: string;
    amount: number;
    status: FundStatus;
    proofUrl?: string;
    paidAt?: Timestamp;
    createdAt: Timestamp;
}

export interface FundOverview {
    balance: number;
    totalCollected: number;
    totalSpent: number;
}
