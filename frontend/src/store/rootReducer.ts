import { combineReducers, UnknownAction } from '@reduxjs/toolkit';

import { authReducer } from '~features/authSlice';
import { bookingReducer } from '~features/bookingSlice';

const appReducer = combineReducers({
  auth: authReducer,
  booking: bookingReducer,
});

export type RootState = ReturnType<typeof appReducer>;

export const rootReducer = (
  state: RootState | undefined,
  action: UnknownAction,
) => {
  if (action.type === 'signout') {
    state = undefined;
  }

  return appReducer(state, action);
};
