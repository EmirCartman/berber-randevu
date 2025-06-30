import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import barberReducer from './slices/barberSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    barbers: barberReducer,
    services: serviceReducer,
    appointments: appointmentReducer,
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store; 