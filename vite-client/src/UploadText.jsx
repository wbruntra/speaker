import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { voices } from './config'
import { ToastContainer, toast } from 'react-toastify'

const getTranscriptionCost = (text) => {
  const textLength = text.length
  const costPerCharacter = 0.015 / 1000
  return { characters: textLength, cost: textLength * costPerCharacter }
}

export default function Uploader() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState(voices[3])
  const [showPopup, setShowPopup] = useState(true)

  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target.result)
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a .txt file.') // Using alert for simplicity; consider a more user-friendly approach
    }
  }

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setText('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(text)
    toast.success('Text successfully uploaded!', {
      autoClose: 1500,
    })
    axios.post('/api/text-to-speech', { text, voice }).then((res) => {
      console.log(res.data)
    })
  }

  const cost = getTranscriptionCost(text).cost
  const textLength = getTranscriptionCost(text).characters.toLocaleString()

  return (
    <>
      <div className="container mt-3">
        <main className="">
          <h1 className="text-center mb-3">Upload New Text</h1>
          <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
            <textarea
              className="form-control mb-3"
              rows="10"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">
                Choose a .txt file to upload (optional):
              </label>
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                className="form-control"
                accept=".txt"
                onChange={handleFileChange}
              />
              <button type="button" className="btn btn-warning btn-sm mt-2" onClick={clearFile}>
                Clear File
              </button>
            </div>
            <div className="mb-3">
              <label htmlFor="voice" className="form-label">
                Choose a voice:
              </label>
              <select
                id="voice"
                className="form-select"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                {voices.map((voice) => (
                  <option key={voice} value={voice}>
                    {voice}
                  </option>
                ))}
              </select>
            </div>
            <input className="btn btn-primary mb-3" type="submit" value="Submit" />
          </form>

          <p>
            Text Length: <span className="font-monospace fs-5">{textLength}</span>
          </p>
          <p>
            Cost to convert to speech:{' '}
            <span className="font-monospace fs-5">${cost.toFixed(3)}</span>
          </p>

          <Link to="/" className="btn btn-link">
            Home
          </Link>
        </main>
      </div>
    </>
  )
}
