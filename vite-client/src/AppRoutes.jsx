import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUploads } from './uploadsSlice'
import App from './App'
import UploadText from './UploadText'
import CustomAudioPlayer from './CustomAudioPlayer'
import RecordAudio from './RecordAudio'
import Topbar from './Topbar'
import { ToastContainer, toast } from 'react-toastify'
import Chat from './Chat'
import { generateRandomSessionKey } from './utils'
import { resetHistory } from './messageHistorySlice'
import { fetchUser } from './userSlice'
import Login from './Login'
import Sessions from './Sessions'
import Logout from './Logout'
import ProtectedRoute from './ProtectedRoute'
import Uploads from './Uploads'
import UploadPlay from './UploadPlay'
import Ask from './Ask'

function ChatWrapper() {
  const navigate = useNavigate()
  const { session_id } = useParams()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)

  useEffect(() => {
    if (!session_id) {
      const newSessionId = generateRandomSessionKey()
      dispatch(resetHistory())
      navigate(`/chat/${newSessionId}`)
    }
  }, [session_id, navigate])

  return session_id ? <Chat sessionId={session_id} /> : null
}

function AppRoutes() {
  const dispatch = useDispatch()
  const uploads = useSelector((state) => state.uploads.items)
  const uploadStatus = useSelector((state) => state.uploads.status)
  const error = useSelector((state) => state.uploads.error)
  const user = useSelector((state) => state.user.user)

  useEffect(() => {
    if (uploadStatus === 'idle') {
      dispatch(fetchUploads())
    }
  }, [uploadStatus, dispatch])

  useEffect(() => {
    dispatch(fetchUser())
  }, [])

  return (
    <>
      <Topbar />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Sessions />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/upload-text" element={<UploadText />} />
          <Route path="/audio/:id" element={<CustomAudioPlayer />} />
          <Route path="/record-audio" element={<RecordAudio />} />
          <Route path="/chat" element={<ChatWrapper />} />
          <Route path="/chat/:session_id" element={<ChatWrapper />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/uploads/:id" element={<UploadPlay />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/ask" element={<Ask />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  )
}

export default AppRoutes
