import type { ApiResponse, ID } from "@shared/utils/common";
import type { FundCampaign, FundTransaction, FundOverview, FundStatus } from "../types";

let mockOverview: FundOverview = {
    balance: 5250000,
    totalCollected: 8000000,
    totalSpent: 2750000
};

let mockCampaigns: FundCampaign[] = [
    {
        id: 1,
        classId: 1,
        title: "Quỹ lớp học kỳ 2",
        description: "Tiền quỹ lớp dùng cho các hoạt động ngoại khóa và photo tài liệu học tập.",
        amount: 200000,
        bankAccount: {
            bankName: "MB Bank",
            accountNumber: "999922226666",
            accountHolder: "NGUYEN VAN ADMIN"
        },
        status: "OPEN",
        createdAt: new Date().toISOString()
    }
];

let mockTransactions: FundTransaction[] = [
    {
        id: 101,
        campaignId: 1,
        userId: 1,
        userName: "Nguyễn Văn A",
        amount: 200000,
        status: "APPROVED",
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
    },
    {
        id: 102,
        campaignId: 1,
        userId: 102,
        userName: "Trần Thị B",
        amount: 200000,
        status: "PENDING",
        proofUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-M8v4mR6VpX6pL4V6_Z9V7R7_X9v8R7R7Q&s",
        createdAt: new Date().toISOString()
    }
];

export const fundAPI = {
    getFundOverview: async (classId: ID): Promise<ApiResponse<{overview: FundOverview, campaigns: FundCampaign[]}>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: "Lấy thông tin quỹ thành công",
                    data: {
                        overview: mockOverview,
                        campaigns: mockCampaigns.filter(c => String(c.classId) === String(classId))
                    },
                    time: new Date().toISOString()
                });
            }, 500);
        });
    },

    getTransactions: async (campaignId: ID): Promise<ApiResponse<FundTransaction[]>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: "Lấy lịch sử giao dịch thành công",
                    data: mockTransactions.filter(t => String(t.campaignId) === String(campaignId)),
                    time: new Date().toISOString()
                });
            }, 500);
        });
    },

    createCampaign: async (classId: ID, data: Omit<FundCampaign, "id" | "classId" | "createdAt">): Promise<ApiResponse<FundCampaign>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newCampaign: FundCampaign = {
                    id: Math.floor(Math.random() * 1000),
                    classId,
                    ...data,
                    createdAt: new Date().toISOString()
                };
                mockCampaigns.push(newCampaign);
                resolve({
                    success: true,
                    message: "Tạo khoản thu thành công",
                    data: newCampaign,
                    time: new Date().toISOString()
                });
            }, 800);
        });
    },

    submitProof: async (transactionId: ID, proofUrl: string): Promise<ApiResponse<FundTransaction>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = mockTransactions.findIndex(t => String(t.id) === String(transactionId));
                if (index !== -1) {
                    mockTransactions[index].proofUrl = proofUrl;
                    mockTransactions[index].status = "PENDING";
                }
                resolve({
                    success: true,
                    message: "Gửi minh chứng thành công",
                    data: mockTransactions[index],
                    time: new Date().toISOString()
                });
            }, 600);
        });
    },

    verifyTransaction: async (transactionId: ID, status: FundStatus): Promise<ApiResponse<FundTransaction>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = mockTransactions.findIndex(t => String(t.id) === String(transactionId));
                if (index !== -1) {
                    mockTransactions[index].status = status;
                    if (status === "APPROVED") {
                        mockTransactions[index].paidAt = new Date().toISOString();
                        mockOverview.balance += mockTransactions[index].amount;
                        mockOverview.totalCollected += mockTransactions[index].amount;
                    }
                }
                resolve({
                    success: true,
                    message: "Cập nhật trạng thái thành công",
                    data: mockTransactions[index],
                    time: new Date().toISOString()
                });
            }, 500);
        });
    },

    // Giả lập Webhook khi quét QR thành công (Phase 2)
    mockWebhookQRSuccess: async (campaignId: ID, userId: ID, userName: string, amount: number): Promise<ApiResponse<FundTransaction>> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTransaction: FundTransaction = {
                    id: Math.floor(Math.random() * 10000),
                    campaignId,
                    userId,
                    userName,
                    amount,
                    status: "APPROVED",
                    paidAt: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
                mockTransactions.push(newTransaction);
                mockOverview.balance += amount;
                mockOverview.totalCollected += amount;
                
                resolve({
                    success: true,
                    message: "Thanh toán QR thành công",
                    data: newTransaction,
                    time: new Date().toISOString()
                });
            }, 1000);
        });
    }
};
