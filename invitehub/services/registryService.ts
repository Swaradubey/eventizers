import API from "./api";
import {
  Registry,
  RegistriesResponse,
  RegistryResponse,
  RegistrySummaryResponse,
  DeleteRegistryResponse,
} from "../types/registryTypes";

export const getRegistries = async (eventId: string): Promise<RegistriesResponse> => {
  const response = await API.get<RegistriesResponse>("/registries", {
    params: { eventId },
  });
  return response.data;
};

export const getRegistrySummary = async (eventId: string): Promise<RegistrySummaryResponse> => {
  const response = await API.get<RegistrySummaryResponse>("/registries/summary", {
    params: { eventId },
  });
  return response.data;
};

export const getRegistryById = async (id: string): Promise<RegistryResponse> => {
  const response = await API.get<RegistryResponse>(`/registries/${id}`);
  return response.data;
};

export const createRegistry = async (
  registry: Omit<Registry, "id" | "currentAmount" | "contributorCount">
): Promise<RegistryResponse> => {
  const response = await API.post<RegistryResponse>("/registries", registry);
  return response.data;
};

export const updateRegistry = async (
  id: string,
  registry: Partial<Omit<Registry, "id" | "eventId">>
): Promise<RegistryResponse> => {
  const response = await API.put<RegistryResponse>(`/registries/${id}`, registry);
  return response.data;
};

export const deleteRegistry = async (id: string): Promise<DeleteRegistryResponse> => {
  const response = await API.delete<DeleteRegistryResponse>(`/registries/${id}`);
  return response.data;
};

const registryService = {
  getRegistries,
  getRegistrySummary,
  getRegistryById,
  createRegistry,
  updateRegistry,
  deleteRegistry,
};

export default registryService;
