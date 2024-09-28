import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Uploads() {
  const [uploads, setUploads] = useState([])

  useEffect(() => {
    axios.get('/api/uploads').then((res) => {
      console.log(res.data)
      setUploads(res.data)
    })
  }, [])

  return (
    <div className="container">
      <main className="mt-5">
        <div className="text-center mb-4">
          {' '}
          {/* Bootstrap text center and margin bottom class */}
          <Link href="/upload-text">
            <button className="btn btn-link">Upload</button> {/* Bootstrap button class */}
          </Link>
        </div>
        <h2 className="mb-3 text-center">Uploads</h2> {/* Bootstrap margin bottom class */}
        <div className="row">
          <div className="col col-md-8">
            <ul className="list-group">
              {uploads.map((upload) => (
                <li key={upload.id} className="list-group-item">
                  <Link to={`/uploads/${upload.id}`}>{upload.content.slice(0, 45)}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* {uploads.map((upload) => (
            <div key={upload.id} className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <Link href={`/audio/${upload.id}`}>
                    <button className="btn btn-link">
                      <h5 className="card-title text-truncate">
                        {upload.content.slice(0, 20)}...
                      </h5>{' '}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))} */}
        </div>
      </main>
    </div>
  )
}
