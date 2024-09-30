import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import AudioRecorderCard from './AudioRecorderCard'
import AudioCard from './AudioCard'
import { setMessageHistory, removeMessage, resetHistory } from './messageHistorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { FaMicrophone, FaStop, FaUpload, FaTrash, FaPaperPlane } from 'react-icons/fa'
import _ from 'lodash'
import './Chat.css'

const RenderMessage = ({ message, index, editChat }) => {
  const dispatch = useDispatch()

  const { role, content, audio_url } = message

  if (role === 'system') return null

  if (role === 'user') {
    return (
      <div className="d-flex justify-content-end mb-4">
        <div className="card user-message w-75">
          <div className="card-body d-flex justify-content-between">
            <div>{content}</div>
            {editChat && (
              <button
                className="btn btn-danger"
                onClick={() => dispatch(removeMessage({ index }))}
              >
                <FaTrash />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (role === 'assistant') {
    return (
      <div className="d-flex justify-content-start mb-4">
        <div className="card assistant-message w-75">
          <div className="card-body d-flex justify-content-between">
            <AudioCard file_url={audio_url} content={content} />
            <div className="col-1 text-end">
              {editChat && (
                <button
                  className="btn btn-danger"
                  onClick={() => dispatch(removeMessage({ index }))}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const initialItems = [
  {
    role: 'system',
    content:
      'You are a helpful assistant. All of your responses will be transcribed and spoken, so you should be friendly but brief, with a casual tone typical of conversations.',
  },
]

export default function Ask() {
  const [transcription, setTranscription] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [editChat, setEditChat] = useState(false)
  const [assistantResponse, setAssistantResponse] = useState(null)

  const dispatch = useDispatch()

  const [messageHistory, setMessageHistory] = useState([...initialItems])

  const resetHistory = () => {
    setMessageHistory([...initialItems])
  }

  const [loading, setLoading] = useState(false)

  const handleChatSend = async () => {
    // e.preventDefault()

    if (_.isEmpty(transcription)) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        messageHistory: [
          {
            role: 'system',
            content:
              'You are a helpful assistant. All of your responses will be transcribed and spoken, so you should be friendly but brief, with a casual tone typical of conversations.',
          },
          {
            role: 'user',
            content: transcription,
          },
        ],
        model: 'gpt-4o-2024-08-06',
        // session_id: sessionId,
      })

      const newMessageHistory = response.data.messageHistory

      const newAssistantResponse = newMessageHistory[newMessageHistory.length - 1]
      setAssistantResponse(newAssistantResponse)

      // setTranscription(null)
      setAudioUrl(null)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (transcription) {
      handleChatSend()
    }
  }, [transcription])

  useEffect(() => {
    console.log(messageHistory)
  }, [messageHistory.length])

  return (
    <>
      <div className="container mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="text-center">Ask a question</h1>
        </div>{' '}
        <AudioRecorderCard
          transcription={transcription}
          setTranscription={setTranscription}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
          autoTranscribe={true}
        />
        {transcription && loading && (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
        )}
        <div className="mt-3">
          {assistantResponse && (
            <AudioCard
              file_url={assistantResponse.audio_url}
              content={assistantResponse.content}
              autoPlay={true}
              autoShowContent={true}
            />
          )}
        </div>
      </div>
    </>
  )
}
