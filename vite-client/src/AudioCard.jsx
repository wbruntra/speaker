import React, { useState, useEffect, useRef } from 'react'
import 'react-h5-audio-player/lib/styles.css'
import { FaEye } from 'react-icons/fa'

export default function AudioCard({
  file_url,
  content,
  autoPlay = false,
  autoShowContent = false,
}) {
  const [isContentVisible, setIsContentVisible] = useState(autoShowContent)
  const audioRef = useRef(null)

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible)
  }

  useEffect(() => {
    if (autoPlay && file_url && audioRef.current) {
      audioRef.current.play()
    }
  }, [file_url])

  return (
    <div className="col-11">
      {file_url && <audio controls src={file_url} className="me-3 w-100" ref={audioRef}></audio>}

      <div
        className="card-text mt-3"
        onClick={toggleContentVisibility}
        style={{ cursor: 'pointer' }}
      >
        {isContentVisible ? (
          content.split('\n').map((line, index) => <p key={index}>{line}</p>)
        ) : (
          <p className="fw-bold text-center w-100">
            <FaEye className="me-2" />
            Click to reveal text
          </p>
        )}
      </div>
    </div>
  )
}
