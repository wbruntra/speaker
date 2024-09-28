import React, { useState, useRef } from 'react'
import AudioRecorderCard from './AudioRecorderCard'

export default function RecordAudio() {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Record Audio</h1>
      <AudioRecorderCard />
    </div>
  )
}
