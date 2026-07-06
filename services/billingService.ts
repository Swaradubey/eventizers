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

export const BillingAPI = {
  getBillingInfo: async (): Promise<BillingInfoResponse> => {
    const response = await API.get<BillingInfoResponse>("/dashboard/billing");
    return response.data;
  },
  
  updatePlan: async (plan: string): Promise<BillingInfoResponse> => {
    const response = await API.patch<BillingInfoResponse>("/dashboard/billing", { plan });
    return response.data;
  },

  getBillingUsage: async (): Promise<BillingUsage> => {
    const response = await API.get<BillingUsage>("/dashboard/billing/usage");
    return response.data;
  }
};

export default BillingAPI;
