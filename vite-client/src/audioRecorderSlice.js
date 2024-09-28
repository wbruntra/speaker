// src/audioRecorderSlice.js
import { createSlice } from '@reduxjs/toolkit'

const audioRecorderSlice = createSlice({
  name: 'audioRecorder',
  initialState: {
    recording: false,
    audioUrl: null,
  },
  reducers: {
    startRecording: (state) => {
      state.recording = true
    },
    stopRecording: (state) => {
      state.recording = false
    },
    setAudioUrl: (state, action) => {
      state.audioUrl = action.payload
    },
    resetAudioRecorder: (state) => {
      state.recording = false
      state.audioUrl = null
    },
  },
})

export const { startRecording, stopRecording, setAudioUrl, resetAudioRecorder } =
  audioRecorderSlice.actions
export default audioRecorderSlice.reducer
