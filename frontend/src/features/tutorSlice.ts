import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Tutor {
  name: string;
  email: string;
  knownLanguages: string;
  yearsOfExperience: string;
  rejectionReason: string;
}

interface TutorState {
  tutor: Tutor | null;
}

const initialState: TutorState = {
  tutor: null,
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<Tutor>) => {
      state.tutor = action.payload;
    },
    clearData: (state) => {
      state.tutor = null;
    },
  },
});

export const { setData, clearData } = tutorSlice.actions;
export const tutorReducer = tutorSlice.reducer;
