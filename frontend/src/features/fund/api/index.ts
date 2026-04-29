import { api } from '@/services/api-client';
import type {
  Fund,
  FundSummary,
  FundCollection,
  FundPayment,
  FundExpense,
  FundCapabilities,
  CollectionStatus,
  InitiatePaymentResult,
  PaymentMethod,
} from '../types';

interface ApiResponse<T> { data: T; message?: string; }

const base = (classroomId: string) => `/classrooms/${classroomId}/fund`;

export const fundApi = {
  getFund: (classroomId: string) =>
    api.get<ApiResponse<Fund>>(`${base(classroomId)}`).then((r) => r.data.data),

  getFundSummary: (classroomId: string) =>
    api.get<ApiResponse<FundSummary>>(`${base(classroomId)}/summary`).then((r) => r.data.data),

  getCapabilities: (classroomId: string) =>
    api
      .get<ApiResponse<FundCapabilities>>(`${base(classroomId)}/capabilities`)
      .then((r) => r.data.data),

  createFund: (classroomId: string, body: { name: string; description?: string }) =>
    api.post<ApiResponse<Fund>>(`${base(classroomId)}`, body).then((r) => r.data.data),

  updateBankInfo: (
    classroomId: string,
    body: {
      bankAccountName?: string | null;
      bankAccountNumber?: string | null;
      bankBin?: string | null;
      bankShortName?: string | null;
    },
  ) =>
    api
      .patch<ApiResponse<Fund>>(`${base(classroomId)}/bank-info`, body)
      .then((r) => r.data.data),

  createCollection: (
    classroomId: string,
    body: { title: string; amount: number; description?: string; dueDate?: string },
  ) =>
    api
      .post<ApiResponse<FundCollection>>(`${base(classroomId)}/collections`, body)
      .then((r) => r.data.data),

  getCollectionStatus: (classroomId: string, collectionId: string) =>
    api
      .get<ApiResponse<CollectionStatus>>(`${base(classroomId)}/collections/${collectionId}/status`)
      .then((r) => r.data.data),

  listPayments: (classroomId: string, collectionId: string) =>
    api
      .get<ApiResponse<FundPayment[]>>(`${base(classroomId)}/payments?collectionId=${collectionId}`)
      .then((r) => r.data.data),

  listMyPayments: (classroomId: string) =>
    api.get<ApiResponse<FundPayment[]>>(`${base(classroomId)}/payments/me`).then((r) => r.data.data),

  recordPayment: (
    classroomId: string,
    body: { collectionId: string; memberId: string; amount: number; note?: string },
  ) =>
    api.post<ApiResponse<FundPayment>>(`${base(classroomId)}/payments`, body).then((r) => r.data.data),

  initiatePayment: (
    classroomId: string,
    body: { collectionId: string; method: PaymentMethod; amount?: number; note?: string },
  ) =>
    api
      .post<ApiResponse<InitiatePaymentResult>>(`${base(classroomId)}/payments/initiate`, body)
      .then((r) => r.data.data),

  getPayment: (classroomId: string, paymentId: string) =>
    api
      .get<ApiResponse<FundPayment>>(`${base(classroomId)}/payments/${paymentId}`)
      .then((r) => r.data.data),

  confirmPayment: (classroomId: string, paymentId: string) =>
    api
      .post<ApiResponse<FundPayment>>(`${base(classroomId)}/payments/${paymentId}/confirm`, {})
      .then((r) => r.data.data),

  rejectPayment: (classroomId: string, paymentId: string) =>
    api
      .post<ApiResponse<FundPayment>>(`${base(classroomId)}/payments/${paymentId}/reject`, {})
      .then((r) => r.data.data),

  revertPayment: (classroomId: string, paymentId: string) =>
    api
      .post<ApiResponse<FundPayment>>(`${base(classroomId)}/payments/${paymentId}/revert`, {})
      .then((r) => r.data.data),

  listExpenses: (classroomId: string) =>
    api.get<ApiResponse<FundExpense[]>>(`${base(classroomId)}/expenses`).then((r) => r.data.data),

  addExpense: (
    classroomId: string,
    body: { title: string; amount: number; description?: string; expenseDate: string },
  ) =>
    api.post<ApiResponse<FundExpense>>(`${base(classroomId)}/expenses`, body).then((r) => r.data.data),
};
