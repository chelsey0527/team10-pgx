import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';

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

export const setActivationCode = createAction<string>('activation/setActivationCode');

export const activationSlice = createSlice({
  name: 'activation',
  initialState,
  reducers: {
    setEvent(state, action: PayloadAction<Event>) {
      state.event = action.payload;
    },
    setEventUser(state, action: PayloadAction<any>) {
      state.eventUser = action.payload;
    },
    setActivationCode(state, action: PayloadAction<string>) {
      state.activationCode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setActivationCode, (state, action) => {
      state.activationCode = action.payload;
      // Persist to localStorage
      localStorage.setItem('activationCode', action.payload);
    });
  }
});

export const { setEvent, setEventUser } = activationSlice.actions;
export default activationSlice.reducer; 