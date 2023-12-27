import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

import { MdMenu } from 'react-icons/md'
import { MdClose } from 'react-icons/md'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data, status } = useSession()

  return (
    <div className='navbar'>
      <div className='navbar__logo'>
        <Link href='/'>App</Link>
      </div>
      <div className='navbar__list'>
        <Link href='/plan/list' className='navbar__list--item'>
          경로 리스트
        </Link>
        <Link href='/plan/new' className='navbar__list--item'>
          경로 생성
        </Link>
        <Link href='/user/1/likes' className='navbar__list--item'>
          찜한 경로
        </Link>
        {/* <Link href='/api/auth/signin' className='navbar__list--item'>
          로그인
        </Link> */}
        {status === 'authenticated' ? (
          <button type='button' onClick={() => signOut()}>
            로그아웃
          </button>
        ) : (
          <Link href='/api/auth/signin' className='navbar__list--item'>
            로그인
          </Link>
        )}
      </div>

      {/* Mobile Button */}
      <div
        className='navbar__button'
        role='presentation'
        onClick={() => setIsOpen((val) => !val)}
      >
        {isOpen ? <MdClose /> : <MdMenu />}
      </div>

      {/* Mobile Navbar */}
      {isOpen && (
        <div className='navbar--mobile'>
          <div className='navbar__list--mobile'>
            <Link href='/plan/list' className='navbar__list--item--mobile'>
              경로 리스트
            </Link>
            <Link href='/plan/new' className='navbar__list--item--mobile'>
              경로 생성
            </Link>
            <Link href='/user/1/likes' className='navbar__list--item--mobile'>
              찜한 경로
            </Link>
            <Link
              href='/api/auth/signin'
              className='navbar__list--item--mobile'
            >
              로그인
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
