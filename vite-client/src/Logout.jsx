import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { fetchUser } from './userSlice'

export default function Logout() {
  const dispatch = useDispatch()

  useEffect(() => {
    axios.get('/api/logout').then((res) => {
      console.log(res.data)
      dispatch(fetchUser())
    })
  }, [])

  return <div>Logout</div>
}