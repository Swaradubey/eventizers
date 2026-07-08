import API from "./api";

export interface Message {
  id: string;
  subject: string;
  body: string;
  status: "DRAFT" | "SENT" | "FAILED";
  recipientType: "ALL_GUESTS" | "ATTENDING" | "DECLINED" | "PENDING" | "SELECTED";
  eventId: string;
  eventTitle: string;
  recipientCount?: number;
  senderName?: string;
  senderEmail?: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalMessages: number;
  sentMessages: number;
  totalRecipients: number;
}

export interface MessageDetail extends Omit<Message, "recipientCount"> {
  recipients: Array<{
    id: string;
    guestId: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  }>;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

export interface MessageDetailResponse {
  success: boolean;
  message: MessageDetail;
}

export interface MessageStatsResponse {
  success: boolean;
  stats: UserStats;
}

export interface CreateMessageResponse {
  success: boolean;
  message?: string;
  data?: Message;
  error?: string;
}

export interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

export const getUserMessages = async (search?: string): Promise<MessagesResponse> => {
  const response = await API.get<MessagesResponse>("/messages", {
    params: search ? { search } : undefined
  });
  return response.data;
};

export const getUserMessageStats = async (): Promise<MessageStatsResponse> => {
  const response = await API.get<MessageStatsResponse>("/messages/stats");
  return response.data;
};

export const getUserMessageById = async (id: string): Promise<MessageDetailResponse> => {
  const response = await API.get<MessageDetailResponse>(`/messages/${id}`);
  return response.data;
};

export const sendMessage = async (payload: {
  eventId: string;
  recipientType: string;
  recipientIds?: string[];
  subject: string;
  body: string;
}): Promise<CreateMessageResponse> => {
  const response = await API.post<CreateMessageResponse>("/messages", payload);
  return response.data;
};

export const deleteMessage = async (id: string): Promise<DeleteMessageResponse> => {
  const response = await API.delete<DeleteMessageResponse>(`/messages/${id}`);
  return response.data;
};

// Admin Services
export const getAdminMessages = async (params?: {
  search?: string;
  status?: string;
  recipientType?: string;
}): Promise<MessagesResponse> => {
  const response = await API.get<MessagesResponse>("/admin/messages", { params });
  return response.data;
};

export const getAdminMessageStats = async (): Promise<MessageStatsResponse> => {
  const response = await API.get<MessageStatsResponse>("/admin/messages/stats");
  return response.data;
};

export const getAdminMessageById = async (id: string): Promise<MessageDetailResponse> => {
  const response = await API.get<MessageDetailResponse>(`/admin/messages/${id}`);
  return response.data;
};

const messageService = {
  getUserMessages,
  getUserMessageStats,
  getUserMessageById,
  sendMessage,
  deleteMessage,
  getAdminMessages,
  getAdminMessageStats,
  getAdminMessageById,
};

export default messageService;
