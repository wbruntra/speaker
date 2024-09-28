// src/messageHistorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchMessageHistory = createAsyncThunk(
  'messageHistory/fetchMessageHistory',
  async (sessionId) => {
    const response = await axios.get(`/api/session/${sessionId}`)
    return response.data.messageHistory
  },
)

const initialItems = [
  {
    role: 'system',
    content:
      'You are a helpful assistant. All of your responses will be transcribed and spoken, so you should be friendly but brief, with a casual tone typical of conversations.',
  },
  {
    role: 'assistant',
    audio_url: 'https://us-east-1.linodeobjects.com/test-projects/tts/c32761702b72.mp3',
    content:
      '¡Hola! Bienvenido a tu asistente de aprendizaje de idiomas. Estoy aquí para ayudarte a practicar español de una manera divertida y relajada. ¿Sobre qué tema te gustaría conversar hoy?',
  },
]

const messageHistorySlice = createSlice({
  name: 'messageHistory',
  initialState: {
    items: [...initialItems],
    status: 'idle',
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
      state.items.push(action.payload)
    },
    clearMessages: (state) => {
      state.items = []
    },
    setMessageHistory: (state, action) => {
      state.items = action.payload
    },
    removeMessage: (state, { payload }) => {
      state.items.splice(payload.index, 1)
    },
    resetHistory: (state) => {
      state.items = [...initialItems]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessageHistory.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMessageHistory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMessageHistory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const { addMessage, clearMessages, setMessageHistory, removeMessage, resetHistory } =
  messageHistorySlice.actions
export default messageHistorySlice.reducer
