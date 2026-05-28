import { useState, useCallback, useEffect } from "react";
import type { ID } from "@shared/utils/common";
import { fundAPI } from "../api";
import type {
  FundPaymentResponseDto,
  CreateFundPaymentRequestDto,
} from "../types";
import { toast } from "react-toastify";

export const useFundPaymentInternal = (classId: ID) => {
  const [payments, setPayments] = useState<
    Record<ID, FundPaymentResponseDto[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(
    async (fundId: ID) => {
      if (!classId || !fundId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fundAPI.getFundPayments(classId, fundId);
        if (res.success) {
          setPayments((prev) => ({ ...prev, [fundId]: res.data }));
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Lỗi kết nối khi tải danh sách minh chứng");
      } finally {
        setIsLoading(false);
      }
    },
    [classId],
  );

  const submitPayment = async (
    fundId: ID,
    data: CreateFundPaymentRequestDto,
  ) => {
    setIsLoading(true);
    try {
      const res = await fundAPI.createFundPayment(classId, fundId, data);
      if (res.success) {
        await fetchPayments(fundId);
        toast.success("Tạo giao dịch thành công");
        return true;
      } else {
        setError(res.message);
        return false;
      }
    } catch (err) {
      setError("Lỗi kết nối khi nộp minh chứng");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approvePayment = async (fundId: ID, paymentId: ID) => {
    setIsLoading(true);
    try {
      const res = await fundAPI.approveFundPayment(classId, fundId, paymentId);
      if (res.success) {
        await fetchPayments(fundId);
        return true;
      } else {
        setError(res.message);
        return false;
      }
    } catch (err) {
      setError("Lỗi kết nối khi duyệt minh chứng");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectPayment = async (fundId: ID, paymentId: ID) => {
    setIsLoading(true);
    try {
      const res = await fundAPI.rejectFundPayment(classId, fundId, paymentId);
      if (res.success) {
        await fetchPayments(fundId);
        toast.success("Đã từ chối minh chứng");
        return true;
      } else {
        setError(res.message);
        return false;
      }
    } catch (err) {
      setError("Lỗi kết nối khi từ chối minh chứng");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPayment = async (fundId: ID, paymentId: ID) => {
    setIsLoading(true);
    try {
      const res = await fundAPI.cancelFundPayment(classId, fundId, paymentId);
      if (res.success) {
        await fetchPayments(fundId);
        toast.success("Hủy minh chứng thành công");
        return true;
      } else {
        setError(res.message);
        return false;
      }
    } catch (err) {
      setError("Lỗi kết nối khi hủy minh chứng");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // display error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      console.error("Error:", error);
    }
  }, [error]);

  return {
    payments,
    isLoading,
    error,
    fetchPayments,
    submitPayment,
    approvePayment,
    rejectPayment,
    cancelPayment,
  };
};
