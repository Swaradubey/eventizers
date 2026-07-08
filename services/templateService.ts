import API from "./api";

export interface Template {
  id: string;
  name: string;
  category: string;
  content: string; // JSON string containing styling design (gradient, accentColor, emoji, description)
  isPremium: boolean;
  createdAt?: string;
}

export const getTemplates = async (): Promise<Template[]> => {
  const response = await API.get<Template[]>("/templates");
  return response.data;
};

const templateService = {
  getTemplates,
};

export default templateService;
