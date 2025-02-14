import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParkingRecommendation {
  location?: string;
  elevator?: string;
  spots?: number;
  stallNumber?: string;
  color?: string;
  zone?: string;
  showMapNotification?: boolean;
}

interface ParkingState {
  recommendation: ParkingRecommendation | null;
}

const initialState: ParkingState = {
  recommendation: null
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    setParkingRecommendation: (state, action: PayloadAction<ParkingRecommendation>) => {
      state.recommendation = action.payload;
    },
    clearParkingRecommendation: (state) => {
      state.recommendation = null;
    }
  }
});

export const { setParkingRecommendation, clearParkingRecommendation } = parkingSlice.actions;
export default parkingSlice.reducer; 