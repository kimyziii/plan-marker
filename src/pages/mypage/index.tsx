import { selectAuth, selectMid } from '@/redux/slice/authSlice'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

export default function MyPage() {
  const auth = useSelector(selectAuth)

  async function getData() {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  useEffect(() => {
    getData()
  }, [auth])

  return (
    <div>
      <h1>마이페이지</h1>
      <h2>isLoggedIn: {auth.isLoggedIn.toString()}</h2>
      <h2>email: {auth.email}</h2>
      <h2>nickname: {auth.nickname}</h2>
      <h2>mid: {auth.mid}</h2>
    </div>
  )
}
