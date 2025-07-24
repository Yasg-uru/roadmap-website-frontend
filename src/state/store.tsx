import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import roadmapReducer from "./slices/roadmapSlice"; 
import  analyticsReducer  from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roadmap:roadmapReducer,
    analytics: analyticsReducer, 
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

