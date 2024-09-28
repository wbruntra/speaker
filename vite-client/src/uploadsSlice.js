// src/uploadsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchUploads = createAsyncThunk('uploads/fetchUploads', async () => {
  const response = await axios.get('/api/uploads')
  return response.data
})

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUploads.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUploads.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchUploads.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export default uploadsSlice.reducer