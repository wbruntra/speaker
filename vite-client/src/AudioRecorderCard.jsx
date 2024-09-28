import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FaMicrophone, FaStop, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa'

export default function AudioRecorderCard({
  transcription,
  setTranscription = () => {},
  audioUrl,
  setAudioUrl,
  autoTranscribe = false,
  showTranslate = true,
}) {
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [isLoading, setIsLoading] = useState(false)

  const handleDiscardRecording = () => {
    setAudioUrl(null)
    toast.info('Recording discarded', {
      autoClose: 1500,
    })
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
    }
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      audioChunksRef.current = []
    }
    mediaRecorderRef.current.start()
    setRecording(true)
  }

  useEffect(() => {
    console.log('Audio URL changed', audioUrl)
    if (audioUrl && autoTranscribe) {
      sendAudioToServer('transcribe')
    }
  }, [audioUrl])

  const stopRecording = () => {
    mediaRecorderRef.current.stop()
    setRecording(false)
  }

  const resetAll = () => {
    setAudioUrl(null)
    setTranscription(null)
  }

  const sendAudioToServer = async (actionType) => {
    if (!audioUrl) {
      toast.error('No audio recorded')
      return
    }

    setIsLoading(true)
    setTranscription(null)

    try {
      const response = await fetch(audioUrl)
      const audioBlob = await response.blob()
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.wav')
      formData.append('action', actionType)

      const { data } = await axios.post('/api/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Received transcription:', data.transcription)

      setTranscription(data.transcription)
      setIsLoading(false)

      toast.success('Audio uploaded successfully', {
        autoClose: 1500,
      })
    } catch (error) {
      console.error('Error uploading audio:', error)
      toast.error('Failed to upload audio', {
        autoClose: 1500,
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="card mb-2">
      <div className="card-body d-flex align-items-center justify-content-between">
        {transcription ? (
          <div className="row">
            <div className="col-11">
              <p className="card-text">{transcription}</p>
            </div>
            <div className="col-1 text-end">
              <button className="btn btn-danger" onClick={resetAll}>
                <FaTrash />
              </button>
            </div>
          </div>
        ) : (
          <>
            {audioUrl ? (
              <div className="d-flex align-items-center">
                <audio controls src={audioUrl} className="me-3"></audio>
                <div>
                  {autoTranscribe ? (
                    <button
                      className="btn btn-success me-2"
                      onClick={() => sendAudioToServer('transcribe')}
                      disabled={isLoading || autoTranscribe}
                    >
                      {isLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <FaUpload /> Transcribe
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      {isLoading && (
                        <FaSpinner className="spinner-border spinner-border-sm" role="status" />
                      )}
                    </>
                  )}
                  {showTranslate && (
                    <button
                      className="btn btn-info me-2"
                      onClick={() => sendAudioToServer('translate')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <FaUpload /> Translate
                        </>
                      )}{' '}
                    </button>
                  )}

                  {!autoTranscribe && (
                    <button
                      className="btn btn-warning"
                      onClick={handleDiscardRecording}
                      disabled={isLoading}
                    >
                      <FaTrash /> Discard
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {recording ? (
                  <button className="btn btn-danger" onClick={stopRecording}>
                    <FaStop /> Stop
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={startRecording}>
                    <FaMicrophone /> Record
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
