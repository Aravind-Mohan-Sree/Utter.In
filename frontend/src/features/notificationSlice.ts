import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  page: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  hasMore: true,
  page: 1,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotifications: (state, action) => {
      state.notifications = [...state.notifications, ...action.payload];
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
      state.unreadCount = 0;
    },
    incrementPage: (state) => {
      state.page += 1;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.page = 1;
      state.hasMore = true;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    prependNotification: (state, action) => {
      if (!state.notifications.some(n => n.id === action.payload.id)) {
        state.notifications = [action.payload, ...state.notifications];
      }
    },
  },
});

export const {
  setNotifications,
  addNotifications,
  setUnreadCount,
  markRead,
  markAllRead,
  incrementPage,
  setHasMore,
  resetNotifications,
  incrementUnreadCount,
  prependNotification,
} = notificationSlice.actions;

export const notificationReducer = notificationSlice.reducer;
