import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/api';

export const fetchComplaints = createAsyncThunk('complaints/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/complaints', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchComplaintById = createAsyncThunk('complaints/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get('/complaints/' + id);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createComplaint = createAsyncThunk('complaints/create', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateComplaintStatus = createAsyncThunk('complaints/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch('/complaints/' + id + '/status', { status });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const assignComplaint = createAsyncThunk('complaints/assign', async ({ id, assigned_to, notes }, { rejectWithValue }) => {
  try {
    const res = await api.post('/complaints/' + id + '/assign', { assigned_to, notes });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteComplaint = createAsyncThunk('complaints/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete('/complaints/' + id);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState: { list: [], selected: null, total: 0, page: 1, totalPages: 1, loading: false, error: null, success: null },
  reducers: {
    clearStatus(state) { state.error = null; state.success = null; },
    setSelected(state, { payload }) { state.selected = payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComplaints.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload.complaints;
        state.total = payload.total;
        state.page = payload.page;
        state.totalPages = payload.totalPages;
      })
      .addCase(fetchComplaints.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchComplaintById.fulfilled, (state, { payload }) => { state.selected = payload; })
      .addCase(createComplaint.fulfilled, (state, { payload }) => {
        state.list.unshift(payload); state.total += 1; state.success = 'Complaint submitted successfully!';
      })
      .addCase(createComplaint.rejected, (state, { payload }) => { state.error = payload; })
      .addCase(updateComplaintStatus.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex(c => c.complaint_id === payload.complaint_id);
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...payload };
        if (state.selected?.complaint_id === payload.complaint_id) state.selected = { ...state.selected, ...payload };
        state.success = 'Status updated!';
      })
      .addCase(assignComplaint.fulfilled, (state) => { state.success = 'Complaint assigned!'; })
      .addCase(deleteComplaint.fulfilled, (state, { payload }) => {
        state.list = state.list.filter(c => c.complaint_id !== payload); state.total -= 1;
      });
  },
});

export const { clearStatus, setSelected } = complaintsSlice.actions;
export default complaintsSlice.reducer;
