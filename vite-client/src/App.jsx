import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUploads } from './uploadsSlice'

function App() {
  const dispatch = useDispatch()
  const uploads = useSelector((state) => state.uploads.items)
  const uploadStatus = useSelector((state) => state.uploads.status)
  const error = useSelector((state) => state.uploads.error)

  useEffect(() => {
    dispatch(fetchUploads())
  }, [])

  let content

  if (uploadStatus === 'loading') {
    content = <p>Loading...</p>
  } else if (uploadStatus === 'succeeded') {
    content = uploads.map((upload) => (
      <div key={upload.id} className="col-md-4 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <Link to={`/audio/${upload.id}`}>
              <button className="btn btn-link">
                <h5 className="card-title text-truncate">
                  {upload.content.slice(0, 20)}...
                </h5>
              </button>
            </Link>
          </div>
        </div>
      </div>
    ))
  } else if (uploadStatus === 'failed') {
    content = <p>{error}</p>
  }

  return (
    <>
      <main className="container mt-5">
        <div className="text-center mb-4">
          <Link to="/upload-text">
            <button className="btn btn-link">Upload</button>
          </Link>
        </div>
        <h2 className="mb-3 text-center">Uploads</h2>
        <div className="row">{content}</div>
      </main>
    </>
  )
}

export default App