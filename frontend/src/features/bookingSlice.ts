import { createAsyncThunk,createSlice } from '@reduxjs/toolkit';

import { getBookings } from '~services/shared/bookingService';

interface BookingState {
    sessionCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: BookingState = {
    sessionCount: 0,
    loading: false,
    error: null,
};

export const fetchSessionCount = createAsyncThunk(
    'booking/fetchSessionCount',
    async (role: string) => {
        const response = await getBookings({}, role);
        return response?.upcoming?.length ?? 0;
    }
);

const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        updateSessionCount: (state, action) => {
            state.sessionCount = action.payload;
        },
        decrementSessionCount: (state) => {
            state.sessionCount = Math.max(0, state.sessionCount - 1);
        },
        incrementSessionCount: (state) => {
            state.sessionCount = state.sessionCount + 1;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSessionCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSessionCount.fulfilled, (state, action) => {
                state.loading = false;
                state.sessionCount = action.payload;
            })
            .addCase(fetchSessionCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch session count';
            });
    },
});

export const { updateSessionCount, decrementSessionCount, incrementSessionCount } = bookingSlice.actions;
export const bookingReducer = bookingSlice.reducer;
