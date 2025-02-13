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
  specialNeeds?: {
    needsEV?: boolean;
    needsAccessible?: boolean;
    needsCloserToElevator?: boolean;
  };
  // ... other fields
}

interface SpecialNeeds {
  needsEV?: boolean;
  needsAccessible?: boolean;
  needsCloserToElevator?: boolean;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateSpecialNeeds: (state, action: PayloadAction<SpecialNeeds>) => {
      if (state.user) {
        state.user.specialNeeds = {
          ...state.user.specialNeeds,
          ...action.payload,
        };
      }
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
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  updateSpecialNeeds, 
  setLoading, 
  setError,
  setVehicleInfo 
} = userSlice.actions;

export const setUserVehicleInfo = createAsyncThunk(
  'user/setVehicleInfo',
  async (vehicleInfo: { 
    carPlate: string, 
    carColor?: string, 
    carMake?: string, 
    carState?: string 
  }, { dispatch }) => {
    try {
      const response = await axios.post('/api/user/vehicle-info', vehicleInfo);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export default userSlice.reducer; 