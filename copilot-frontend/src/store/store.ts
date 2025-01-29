import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import activationReducer from './activationSlice';
import navigationReducer from './navigationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    activation: activationReducer,
    navigation: navigationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 