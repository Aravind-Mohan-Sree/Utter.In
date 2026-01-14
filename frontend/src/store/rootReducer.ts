import { combineReducers, UnknownAction } from '@reduxjs/toolkit';
import { authReducer } from '~features/authSlice';
import { tutorReducer } from '~features/tutorSlice';

const appReducer = combineReducers({
  auth: authReducer,
  tutor: tutorReducer,
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
