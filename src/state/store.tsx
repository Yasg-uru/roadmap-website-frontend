import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import roadmapReducer from "./slices/roadmapSlice"; 
import  analyticsReducer  from './slices/analyticsSlice';
import bookmarkReducer from './slices/bookmarkSlice'; 
import notificationReducer from './slices/notificationSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roadmap:roadmapReducer,
    analytics: analyticsReducer, 
    bookmark: bookmarkReducer,
    notification: notificationReducer, 
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

