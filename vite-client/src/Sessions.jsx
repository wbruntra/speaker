import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import AudioRecorderCard from './AudioRecorderCard'
import AudioCard from './AudioCard'
import { setMessageHistory, removeMessage, resetHistory } from './messageHistorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { FaMicrophone, FaStop, FaUpload, FaTrash } from 'react-icons/fa'
import _ from 'lodash'
import './Chat.css'

export default function Sessions() {
  const user = useSelector((state) => state.user.user)
  const [sessions, setSessions] = useState([])

  if (!user) {
    return <div>Loading...</div>
  }

  useEffect(() => {
    if (user?.id) {
      axios.get(`/api/sessions`).then((res) => {
        setSessions(res.data)
      })
    }
  }, [user])

  return (
    <>
      <div className="container mt-3">
        <h1>Chat Sessions</h1>
        {sessions.length > 0 && (
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                <Link to={`/chat/${session.id}`}>{session.id}</Link>
              </li>
            ))}
          </ul>
        )}
        <p>
          <Link to="/chat">Start a new chat session</Link>
        </p>
      </div>
    </>
  )
}
