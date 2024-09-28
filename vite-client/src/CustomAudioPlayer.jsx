import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import 'react-h5-audio-player/lib/styles.css'
import AudioPlayer from 'react-h5-audio-player'
import AudioCard from './AudioCard'

export default function CustomAudioPlayer() {
  const audioUrl = 'https://us-east-1.linodeobjects.com/test-projects/tts/83b9cb0b2ac8.mp3'
  const { id } = useParams()
  const dispatch = useDispatch()
  const upload = useSelector((state) => state.uploads.items.find((upload) => upload.id == id))

  if (!upload || !upload.file_url) {
    return <>Loading...</>
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h1 className="text-center mb-4">MP3 Player</h1>
          <AudioCard file_url={upload.file_url} content={upload.content} />
        </div>
      </div>
    </div>
  )
}
