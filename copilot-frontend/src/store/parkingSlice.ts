import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParkingRecommendation {
  location: string;
  elevator: string;
  spots: number;
  color: string;
  zone: string;
  showMapNotification: boolean;
}

interface ParkingState {
  recommendation: ParkingRecommendation | null;
}

const initialState: ParkingState = {
  recommendation: null,
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    setParkingRecommendation: (state, action: PayloadAction<ParkingRecommendation>) => {
      state.recommendation = action.payload;
    },
  },
});

export const { setParkingRecommendation } = parkingSlice.actions;
export default parkingSlice.reducer; 