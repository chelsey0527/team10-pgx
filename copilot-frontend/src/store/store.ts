import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import activationReducer from './activationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    activation: activationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 