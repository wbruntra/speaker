import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchTranscription = createAsyncThunk(
  'transcriptions/fetchTranscription',
  async (audioUrl) => {
    const response = await axios.post('/api/upload-audio', audioUrl, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.transcription
  },
)

const transcriptionsSlice = createSlice({
  name: 'transcriptions',
  initialState: {
    items: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTranscription.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTranscription.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items[action.meta.arg] = action.payload
      })
      .addCase(fetchTranscription.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export default transcriptionsSlice.reducer
