export type RegistryType = "CASH_FUND" | "GIFT_REGISTRY" | "DONATION" | "EXTERNAL_LINK";

export interface Registry {
  id: string;
  eventId: string;
  type: RegistryType;
  title: string;
  description: string | null;
  goalAmount: number | null;
  currentAmount: number;
  currency: string;
  externalUrl: string | null;
  contributorCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegistrySummary {
  totalRaised: number;
  totalContributors: number;
  registryCount: number;
}

export interface RegistriesResponse {
  success: boolean;
  registries: Registry[];
}

export interface RegistryResponse {
  success: boolean;
  registry: Registry;
  message?: string;
}

export interface RegistrySummaryResponse {
  success: boolean;
  summary: RegistrySummary;
}

export interface DeleteRegistryResponse {
  success: boolean;
  message: string;
}
