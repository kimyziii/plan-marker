import {
  REMOVE_ACTIVE_USER,
  selectMid,
  SET_ACTIVE,
} from '@/redux/slice/authSlice'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { auth } from '../../firebase'

export default function Navbar() {
  const router = useRouter()
  const dispatch = useDispatch()

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  onAuthStateChanged(auth, (user) => {
    if (user) {
      dispatch(SET_ACTIVE())
      setIsLoggedIn(true)
    } else {
      dispatch(REMOVE_ACTIVE_USER())
    }
  })

  function handleLogout() {
    signOut(auth)
    setIsLoggedIn(false)
    router.push('/login')
  }

  return (
    <div className='navbar'>
      <div className='navbar__logo italic'>
        <Link href='/'>Markers</Link>
      </div>
      <div className='navbar__list'>
        {isLoggedIn && (
          <>
            <Link href='/plan/new' className='navbar__list--item'>
              경로 생성
            </Link>
            <button type='button' onClick={() => router.push(`/mypage`)}>
              마이페이지
            </button>
            <button type='button' onClick={() => handleLogout()}>
              로그아웃
            </button>
          </>
        )}
        {!isLoggedIn && (
          <Link href='/login' className='navbar__list--item'>
            로그인
          </Link>
        )}
      </div>
    </div>
  )
}
