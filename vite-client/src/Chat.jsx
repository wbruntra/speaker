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

export default function Chat({ sessionId }) {
  const [transcription, setTranscription] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [editChat, setEditChat] = useState(false)

  const dispatch = useDispatch()

  const messageHistory = useSelector((state) => state.messageHistory.items)

  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get(`/api/session/${sessionId}`)

        if (response.data.messageHistory) {
          dispatch(setMessageHistory(response.data.messageHistory))
        }
      } catch (error) {
        console.error('Error fetching session data:', error)
      }
    }

    if (sessionId) {
      fetchSessionData()
    } else {
      dispatch(resetHistory())
    }
  }, [sessionId])

  const handleChatSend = async () => {
    // e.preventDefault()
    console.log(transcription)

    if (_.isEmpty(transcription)) {
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/chat', {
        messageHistory: [
          ...messageHistory,
          {
            role: 'user',
            content: transcription,
          },
        ],
        session_id: sessionId,
      })

      const newMessageHistory = response.data.messageHistory
      dispatch(setMessageHistory(newMessageHistory))
      setTranscription(null)
      setAudioUrl(null)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log(messageHistory)
  }, [messageHistory.length])

  return (
    <>
      <div className="container mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="text-center">Chat</h1>
          <button
            className="btn btn-secondary"
            onClick={() => setEditChat(!editChat)} // Toggle edit mode
          >
            {editChat ? 'Disable Edit Mode' : 'Edit Messages'}
          </button>
        </div>{' '}
        {messageHistory.map((message, index) => {
          return <RenderMessage key={index} message={message} index={index} editChat={editChat} />
        })}
        <AudioRecorderCard
          transcription={transcription}
          setTranscription={setTranscription}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
        />
        {transcription && (
          <button
            onClick={handleChatSend}
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        )}
      </div>
    </>
  )
}
