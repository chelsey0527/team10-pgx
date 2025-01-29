import { createSlice } from '@reduxjs/toolkit';

interface NavigationState {
  showMapNotification: boolean;
}

const initialState: NavigationState = {
  showMapNotification: false,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setShowMapNotification: (state, action) => {
      state.showMapNotification = action.payload;
    },
  },
});

export const { setShowMapNotification } = navigationSlice.actions;
export default navigationSlice.reducer; 