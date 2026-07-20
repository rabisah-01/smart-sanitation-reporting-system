import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', creds);
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token'), loading: false, error: null, initialized: false },
  reducers: {
    logout(state) { state.user = null; state.token = null; localStorage.removeItem('token'); },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state)         => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload.user; state.token = payload.token; })
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload.user; state.token = payload.token; })
      .addCase(register.rejected, rejected)
      .addCase(fetchMe.pending, (state) => { state.loading = true; })
      .addCase(fetchMe.fulfilled, (state, { payload }) => { state.loading = false; state.user = payload; state.initialized = true; })
      .addCase(fetchMe.rejected, (state) => { state.loading = false; state.initialized = true; state.token = null; localStorage.removeItem('token'); });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
