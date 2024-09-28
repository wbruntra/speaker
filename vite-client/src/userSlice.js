import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchUser = createAsyncThunk('users/fetchUser', async () => {
  const response = await axios.get('/api/status')
  return response.data
})

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
    initialized: false,
    authed: false,
    status: 'idle',
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.authed = true
      state.initialized = true
    },
    setAuthed: (state, action) => {
      state.authed = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.initialized = true
        state.user = action.payload
      })
  },
})

export default userSlice.reducer
