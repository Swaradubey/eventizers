import API from "./api";
import { BillingUsage } from "../types/billing.types";

export interface Plan {
  id: string;
  name: string;
  price: number | null;
  features: string[];
}

export interface BillingInfoResponse {
  success: boolean;
  currentPlan: string;
  usage: BillingUsage;
  plans: Plan[];
}

export interface PaymentMethod {
  cardBrand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  status: string;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  downloadUrl: string;
  planName?: string;
  billingPeriod?: string;
  customerName?: string;
  customerEmail?: string;
  transactionId?: string;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod;
}

export interface InvoicesResponse {
  success: boolean;
  invoices?: Invoice[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalInvoices: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: string;
}

export interface SetupIntentResponse {
  clientSecret: string;
}

export interface SubscribeResponse {
  success?: boolean;
  requiresPaymentMethod?: boolean;
  clientSecret?: string;
  currentPlan?: string;
  usage?: BillingUsage;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface CheckoutSessionStatusResponse {
  status: string;
  paymentStatus: string;
  plan: string | null;
  subscriptionStatus: string | null;
}

export interface ActivateFreePlanResponse {
  success: boolean;
  message?: string;
  plan?: string;
  subscriptionStatus?: string;
  alreadyActive?: boolean;
  error?: string;
}

export const BillingAPI = {
  getBillingInfo: async (bypassCache = false): Promise<BillingInfoResponse> => {
    const params = bypassCache ? { _t: Date.now() } : undefined;
    const response = await API.get<BillingInfoResponse>("/dashboard/billing", { params });
    return response.data;
  },
  
  updatePlan: async (plan: string): Promise<BillingInfoResponse> => {
    const response = await API.patch<BillingInfoResponse>("/dashboard/billing", { plan });
    return response.data;
  },

  getCurrentPlan: async (bypassCache = false): Promise<{ success: boolean; currentPlan: string }> => {
    const params = bypassCache ? { _t: Date.now() } : undefined;
    const response = await API.get<{ success: boolean; currentPlan: string }>("/plans/current-plan", { params });
    return response.data;
  },

  subscribeToPlan: async (planId: string): Promise<SubscribeResponse> => {
    const response = await API.post<SubscribeResponse>("/plans/subscribe", { planId });
    return response.data;
  },

  getBillingUsage: async (): Promise<BillingUsage> => {
    const response = await API.get<BillingUsage>("/dashboard/billing/usage");
    return response.data;
  },

  getPaymentMethod: async (): Promise<PaymentMethodResponse> => {
    const response = await API.get<PaymentMethodResponse>("/user/billing/payment-method");
    return response.data;
  },

  createSetupIntent: async (): Promise<SetupIntentResponse> => {
    const response = await API.post<SetupIntentResponse>("/user/billing/setup-intent");
    return response.data;
  },

  updatePaymentMethod: async (paymentMethodId: string): Promise<PaymentMethodResponse> => {
    const response = await API.post<PaymentMethodResponse>("/user/billing/payment-method", { paymentMethodId });
    return response.data;
  },

  getInvoices: async (page = 1, limit = 5): Promise<InvoicesResponse> => {
    const response = await API.get<InvoicesResponse>("/user/billing/invoices", {
      params: { page, limit }
    });
    return response.data;
  },

  createCheckoutSession: async (plan: string): Promise<CheckoutSessionResponse> => {
    const response = await API.post<CheckoutSessionResponse>("/stripe/create-checkout-session", { plan });
    return response.data;
  },

  getCheckoutSessionStatus: async (sessionId: string): Promise<CheckoutSessionStatusResponse> => {
    const response = await API.get<CheckoutSessionStatusResponse>(`/stripe/checkout-session/${sessionId}`);
    return response.data;
  },

  activateFreePlan: async (): Promise<ActivateFreePlanResponse> => {
    const response = await API.post<ActivateFreePlanResponse>("/billing/activate-free");
    return response.data;
  }
};

export default BillingAPI;
