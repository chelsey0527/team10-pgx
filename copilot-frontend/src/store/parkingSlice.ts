import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ParkingRecommendation {
  location: string;
  color: string;
  zone: string;
  availableSpots: number;
  directions: string;
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
    setRecommendation: (state, action: PayloadAction<ParkingRecommendation>) => {
      state.recommendation = action.payload;
    },
    clearRecommendation: (state) => {
      state.recommendation = null;
    }
  }
});

export const { setRecommendation, clearRecommendation } = parkingSlice.actions;
export default parkingSlice.reducer; 