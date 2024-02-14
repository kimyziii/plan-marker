import { SET_ACTIVE_USER } from '@/redux/slice/authSlice'
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Notify } from 'notiflix'
import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import { auth } from '../../firebase'
import { FcGoogle } from 'react-icons/fc'

type SignupType = {
  email: string
  password: string
}

const initialState = {
  email: '',
  password: '',
}

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const googleProvider = new GoogleAuthProvider()

  const [loginData, setLoginData] = useState<SignupType>(initialState)

  const handleGoogleLogin = async (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        const user = result.user

        const obj = {
          email: user.email,
          lastLoginAt: user.metadata.lastSignInTime,
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/login/sns`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj),
          },
        )

        const res = await response.json()

        dispatch(
          SET_ACTIVE_USER({
            nickname: res.nickname,
            mid: res._id,
            email: res.email,
          }),
        )

        if (response.status === 200) {
          Notify.success('로그인 완료!', {
            clickToClose: true,
          })
        } else {
          Notify.success('회원가입 및 로그인 완료!', {
            clickToClose: true,
          })
        }

        router.push('/')
      })
      .catch((err) => {
        console.error(err.message)
      })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { email, password } = loginData
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user

        const obj = {
          uid: user.uid,
          lastLoginAt: user.metadata.lastSignInTime,
        }

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(obj),
            },
          )

          const result = await response.json()

          dispatch(
            SET_ACTIVE_USER({
              nickname: result.nickname,
              mid: result._id,
              email: result.email,
            }),
          )

          router.push('/')
        } catch (err) {
          console.error(err)
        }
      })
      .catch((error) => {
        Notify.failure(error.message, {
          clickToClose: true,
        })
      })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className='flex flex-col justify-center px-6 lg:px-8 h-[60vh]'>
      <form
        onSubmit={(e) => handleSubmit(e)}
        className='mx-auto w-full max-w-sm flex flex-col gap-2'
      >
        <div className='w-full grid grid-cols-4'>
          <label className='mr-2 col-span-1'>Email</label>
          <input
            name='email'
            type='email'
            className='col-span-3 bg-blue-500 bg-opacity-50 p-2 rounded-md'
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <div className='w-full grid grid-cols-4'>
          <label className='mr-2 col-span-1'>Password</label>
          <input
            type='password'
            name='password'
            className='col-span-3 bg-blue-500 bg-opacity-50 p-2 rounded-md'
            onChange={(e) => handleInputChange(e)}
          />
        </div>
        <button
          type='submit'
          className='bg-blue-600 text-white p-2 mt-3 rounded-md'
        >
          로그인하기
        </button>
        <Link
          href='./signup'
          className='text-gray-600 underline text-sm text-center'
        >
          › 회원이 아니라면 회원가입 하러가기
        </Link>
        <div
          className='flex flex-row justify-center mt-4 px-6 py-2 gap-4 border rounded-md cursor-pointer'
          onClick={(e) => handleGoogleLogin(e)}
        >
          <FcGoogle size={24} />
          Google 계정으로 로그인하기
        </div>
      </form>
    </div>
  )
}
