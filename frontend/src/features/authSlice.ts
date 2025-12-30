import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  isSignedIn: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isSignedIn: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<User>) => {
      state.isSignedIn = true;
      state.user = action.payload;
    },
    signOut: (state) => {
      state.isSignedIn = false;
      state.user = null;
    },
  },
});

export const { signIn, signOut } = authSlice.actions;
export const authReducer = authSlice.reducer;
