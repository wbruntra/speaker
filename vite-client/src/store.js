// src/store.js
import { configureStore } from '@reduxjs/toolkit'
import uploadsReducer from './uploadsSlice'
import messageHistorySlice from './messageHistorySlice'
import userReducer from './userSlice'

const store = configureStore({
  reducer: {
    uploads: uploadsReducer,
    messageHistory: messageHistorySlice,
    user: userReducer,
  },
})

export default store