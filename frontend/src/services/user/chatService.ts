import axios from '~utils/axiosConfig';
import { API_ROUTES } from '~constants/routes';

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

export const sendMessage = async (receiverId: string, text: string) => {
  const response = await axios.post(API_ROUTES.USER.SEND_MESSAGE, {
    receiverId,
    text,
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

export const deleteMessage = async (messageId: string) => {
  const response = await axios.delete(`${API_ROUTES.USER.CHATS}/messages/${messageId}`);
  return response.data;
};
