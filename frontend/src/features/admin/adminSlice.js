import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const fetchAnalytics = createAsyncThunk('admin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/analytics/summary');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: { analytics: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, { payload }) => { state.loading = false; state.analytics = payload; })
      .addCase(fetchAnalytics.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });
  },
});

export default adminSlice.reducer;
