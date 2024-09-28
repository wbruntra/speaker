import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
// import AudioPlayer from 'react-h5-audio-player'
// import 'react-h5-audio-player/lib/styles.css'

const UploadPlay = () => {
  const params = useParams()
  const { id } = params
  const [entry, setEntry] = useState({})

  useEffect(() => {
    if (!id) return

    axios.get(`/api/uploads/${id}`).then((res) => {
      setEntry(res.data)
    })
  }, [id])

  if (!entry.file_url) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <div className="container mt-3">
      <main className="">
        <div className="row justify-content-center">
          <div className="col col-md-8">
            <h1 className="my-4 text-center">MP3 Player</h1>

            <div>
              <ReactMarkdown children={entry.content} />
            </div>

            <div className="my-4 text-center">
              <audio controls>
                <source src={entry.file_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            <div className="my-4 text-center">
              <button className="btn btn-link" href="/">
                Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default UploadPlay
