import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getConversations } from '~services/user/chatService';

interface ChatState {
  unreadCount: number;
  loading: boolean;
}

const initialState: ChatState = {
  unreadCount: 0,
  loading: false,
};

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (userId: string) => {
    const res = await getConversations();
    const totalUnread = res.conversations.reduce((acc: number, conv: any) => {
      return acc + (conv.unreadCount?.[userId] || 0);
    }, 0);
    return totalUnread;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setUnreadCount, incrementUnreadCount } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
