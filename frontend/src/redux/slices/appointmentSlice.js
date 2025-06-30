import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Async thunks
export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found in localStorage');
        return rejectWithValue('Yetkilendirme başarısız: Token bulunamadı');
      }

      console.log('Creating appointment:', {
        data: appointmentData,
        token: token.substring(0, 20) + '...' // Token'ın sadece ilk 20 karakterini logla
      });

      const response = await axios.post(
        `${API_URL}/appointments`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: function (status) {
            return status < 500; // 500'den küçük tüm status kodlarını kabul et
          }
        }
      );

      if (response.status >= 400) {
        console.error('Appointment creation failed:', {
          status: response.status,
          data: response.data
        });
        return rejectWithValue(response.data.message || 'Randevu oluşturulurken bir hata oluştu');
      }

      console.log('Appointment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Appointment creation error:', {
        data: error.response?.data,
        message: error.message,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: {
            ...error.config?.headers,
            Authorization: error.config?.headers?.Authorization ? 'Bearer [REDACTED]' : undefined
          }
        }
      });
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Randevu oluşturulurken bir hata oluştu'
      );
    }
  }
);

export const getAppointments = createAsyncThunk(
  'appointments/getAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Yetkilendirme başarısız: Token bulunamadı');
      }

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Randevular yüklenirken bir hata oluştu');
    }
  }
);

export const getCustomerAppointments = createAsyncThunk(
  'appointments/getCustomerAppointments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found in localStorage');
        return rejectWithValue('Authentication required');
      }

      console.log('Fetching customer appointments...');
      const response = await axios.get(`${API_URL}/appointments/customer`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (response.status >= 400) {
        console.error('Failed to fetch appointments:', {
          status: response.status,
          data: response.data
        });
        return rejectWithValue(response.data.message || 'Failed to fetch appointments');
      }

      console.log('Successfully fetched appointments:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.message || 'Failed to fetch appointments');
    }
  }
);

export const getBarberAppointments = createAsyncThunk(
  'appointments/getBarberAppointments',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { appointments } = getState();
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('No token found in localStorage');
        return rejectWithValue('Authentication required');
      }

      console.log('Fetching barber appointments...');
      const response = await axios.get(`${API_URL}/appointments/barber`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: function (status) {
          return status < 500;
        }
      });

      if (response.status >= 400) {
        console.error('Failed to fetch barber appointments:', {
          status: response.status,
          data: response.data
        });
        return rejectWithValue(response.data.message || 'Failed to fetch barber appointments');
      }

      console.log('Successfully fetched barber appointments:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching barber appointments:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.message || 'Failed to fetch barber appointments');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ appointmentId, status, note, photos }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating appointment status:', { appointmentId, status, note, photos, token });

      const response = await axios.patch(
        `${API_URL}/appointments/${appointmentId}/status`,
        { status, note, photos },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Appointment status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return rejectWithValue(error.response?.data?.message || 'Randevu durumu güncellenirken bir hata oluştu');
    }
  }
);

export const addReview = createAsyncThunk(
  'appointments/addReview',
  async ({ appointmentId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
      }

      console.log('Review request:', {
        url: `${API_URL}/appointments/${appointmentId}/review`,
        reviewData,
        token: token.substring(0, 20) + '...'
      });

      const response = await fetch(`${API_URL}/appointments/${appointmentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Review submission failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return rejectWithValue(errorData.message || 'Değerlendirme eklenirken bir hata oluştu');
      }

      const data = await response.json();
      console.log('Review submission successful:', data);
      return data;
    } catch (error) {
      console.error('Review submission error:', error);
      return rejectWithValue(error.message || 'Değerlendirme eklenirken bir hata oluştu');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return rejectWithValue('Authentication required');
      }

      console.log('Cancelling appointment:', appointmentId);
      const response = await axios.put(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: function (status) {
            return status < 500;
          }
        }
      );

      if (response.status >= 400) {
        console.error('Failed to cancel appointment:', {
          status: response.status,
          data: response.data
        });
        return rejectWithValue(response.data.message || 'Failed to cancel appointment');
      }

      console.log('Successfully cancelled appointment:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(error.message || 'Failed to cancel appointment');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  lastFetchTime: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.items = [];
      state.error = null;
      state.lastFetchTime = null;
      state.loading = false;
    },
    resetLoading: (state) => {
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Customer Appointments
      .addCase(getCustomerAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(getCustomerAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Barber Appointments
      .addCase(getBarberAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBarberAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
        state.lastFetchTime = Date.now();
      })
      .addCase(getBarberAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Appointment Status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAppointments, resetLoading, clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer; 