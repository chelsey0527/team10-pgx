import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Event {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  building: string;
  organizer: string;
}

interface ActivationState {
  activationCode: string | null;
  event: Event | null;
  eventUser: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ActivationState = {
  activationCode: null,
  event: null,
  eventUser: null,
  loading: false,
  error: null,
};

export const activationSlice = createSlice({
  name: 'activation',
  initialState,
  reducers: {
    setActivationCode(state, action: PayloadAction<string>) {
      state.activationCode = action.payload;
    },
    setEvent(state, action: PayloadAction<Event>) {
      state.event = action.payload;
    },
    setEventUser(state, action: PayloadAction<any>) {
      state.eventUser = action.payload;
    },
  },
});

export const { setActivationCode, setEvent, setEventUser } = activationSlice.actions;
export default activationSlice.reducer; 