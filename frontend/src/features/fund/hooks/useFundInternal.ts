import { useState, useEffect, useCallback } from "react";
import type { ID } from "@shared/utils/common";
import { fundAPI } from "../api";
import type { FundCampaign, FundOverview, FundStatus } from "../types";

export const useFundInternal = (classId: ID) => {
    const [overview, setOverview] = useState<FundOverview | null>(null);
    const [campaigns, setCampaigns] = useState<FundCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!classId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fundAPI.getFundOverview(classId);
            if (response.success) {
                setOverview(response.data.overview);
                setCampaigns(response.data.campaigns);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Lỗi khi tải dữ liệu quỹ");
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    const createCampaign = async (data: Omit<FundCampaign, "id" | "classId" | "createdAt">) => {
        try {
            const response = await fundAPI.createCampaign(classId, data);
            if (response.success) {
                setCampaigns(prev => [...prev, response.data]);
                return true;
            }
            return false;
        } catch (err) {
            setError("Lỗi khi tạo khoản thu");
            return false;
        }
    };

    const submitProof = async (transactionId: ID, proofUrl: string) => {
        try {
            const response = await fundAPI.submitProof(transactionId, proofUrl);
            return response.success;
        } catch (err) {
            setError("Lỗi khi gửi minh chứng");
            return false;
        }
    };

    const verifyTransaction = async (transactionId: ID, status: FundStatus) => {
        try {
            const response = await fundAPI.verifyTransaction(transactionId, status);
            if (response.success && status === "APPROVED") {
                fetchData(); // Refresh overview balance
            }
            return response.success;
        } catch (err) {
            setError("Lỗi khi duyệt giao dịch");
            return false;
        }
    };

    const handleQRSuccess = async (campaignId: ID, userId: ID, userName: string, amount: number) => {
        try {
            const response = await fundAPI.mockWebhookQRSuccess(campaignId, userId, userName, amount);
            if (response.success) {
                fetchData();
            }
            return response.success;
        } catch (err) {
            setError("Lỗi khi xử lý thanh toán QR");
            return false;
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        overview,
        campaigns,
        isLoading,
        error,
        refresh: fetchData,
        createCampaign,
        submitProof,
        verifyTransaction,
        handleQRSuccess
    };
};
