import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  carPlate?: string;
  carColor?: string;
  carMake?: string;
  carState?: string;
  // ... other fields
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, 'loading' | 'error'>>) => {
      state.user = action.payload.user;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setVehicleInfo: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
      }
    }
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;

export const setUserVehicleInfo = createAsyncThunk(
  'user/setVehicleInfo',
  async (vehicleInfo: { carPlate: string, carColor?: string, carMake?: string, carState?: string }, { dispatch }) => {
    try {
      const response = await axios.post('/api/user/vehicle-info', vehicleInfo);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export default userSlice.reducer; 