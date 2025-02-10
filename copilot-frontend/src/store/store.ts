import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userSlice';
import activationReducer from './activationSlice';
import navigationReducer from './navigationSlice';
import parkingReducer from './parkingSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'parking'], // Persist these reducers
  debug: true, // Add this to see persist logs
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    activation: activationReducer,
    navigation: navigationReducer,
    parking: parkingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Needed for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 