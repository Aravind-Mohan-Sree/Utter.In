import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
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
    signin: (state, action: PayloadAction<User>) => {
      state.isSignedIn = true;
      state.user = action.payload;
    },
    signout: (state) => {
      state.isSignedIn = false;
      state.user = null;
    },
  },
});

export const { signin, signout } = authSlice.actions;
export const authReducer = authSlice.reducer;
