import { API_ROUTES } from '~constants/routes';
import axios from '~utils/axiosConfig';

export const getConversations = async () => {
  const response = await axios.get(API_ROUTES.USER.CHATS);
  return response.data;
};

export const getMessages = async (conversationId: string, params?: { page?: number; limit?: number; targetId?: string }) => {
  const response = await axios.get(API_ROUTES.USER.CHAT_MESSAGES(conversationId), {
    params
  });
  return response.data;
};

export const sendMessage = async (receiverId: string, text?: string, fileUrl?: string, fileType?: string, fileName?: string) => {
  const response = await axios.post(API_ROUTES.USER.SEND_MESSAGE, {
    receiverId,
    text,
    fileUrl,
    fileType,
    fileName,
  });
  return response.data;
};

export const searchChat = async (params: {
  q: string;
  page?: number;
  limit?: number;
  sort?: string;
  language?: string;
}) => {
  const response = await axios.get(API_ROUTES.USER.CHAT_SEARCH, {
    params,
  });
  return response.data;
};

export const editMessage = async (messageId: string, text: string) => {
  const response = await axios.patch(`${API_ROUTES.USER.CHATS}/messages/${messageId}`, {
    text,
  });
  return response.data;
};

export const deleteMessage = async (messageId: string, forEveryone: boolean = false) => {
  const response = await axios.delete(`${API_ROUTES.USER.CHATS}/messages/${messageId}`, {
    params: { forEveryone }
  });
  return response.data;
};

export const uploadAttachment = async (file: File) => {
  const formData = new FormData();
  formData.append('attachment', file);
  const response = await axios.post(`${API_ROUTES.USER.CHATS}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createAbuseReport = async (data: {
  reportedId: string;
  type: string;
  description: string;
  messages: any[];
  channel: 'chat' | 'video';
}) => {
  const response = await axios.post(API_ROUTES.USER.REPORTS, data);
  return response.data;
};

export const getMyReports = async (params?: { page?: number; limit?: number; status?: string }) => {
  const response = await axios.get(API_ROUTES.USER.REPORTS, { params });
  return response.data;
};
