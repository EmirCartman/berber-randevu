import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// Get all barbers
export const getBarbers = createAsyncThunk(
  'barbers/getBarbers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/barbers`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Berberler alınamadı');
    }
  }
);

const initialState = {
  barbers: [],
  loading: false,
  error: null
};

const barberSlice = createSlice({
  name: 'barbers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBarbers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBarbers.fulfilled, (state, action) => {
        state.loading = false;
        state.barbers = action.payload;
      })
      .addCase(getBarbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = barberSlice.actions;
export default barberSlice.reducer; 