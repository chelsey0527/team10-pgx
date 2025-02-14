import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParkingRecommendation {
  location: string;
  elevator: string;
  spots: number;
  color: string;
  zone: string;
  showMapNotification: boolean;
  // Add any additional fields that come from getParkingRecommendation
}

interface ParkingState {
  recommendation: ParkingRecommendation | null;
  lastUpdated: Date | null;
}

const initialState: ParkingState = {
  recommendation: null,
  lastUpdated: null,
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    setParkingRecommendation: (state, action: PayloadAction<ParkingRecommendation>) => {
      state.recommendation = action.payload;
      state.lastUpdated = new Date();
    },
    clearParkingRecommendation: (state) => {
      state.recommendation = null;
      state.lastUpdated = null;
    },
  },
});

export const { setParkingRecommendation, clearParkingRecommendation } = parkingSlice.actions;
export default parkingSlice.reducer; 