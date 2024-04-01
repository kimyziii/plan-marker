import { SET_ACTIVE_USER } from '@/redux/slice/authSlice'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Notify } from 'notiflix'
import { ChangeEvent, FormEvent, useState } from 'react'
import { useDispatch } from 'react-redux'
import { auth } from '../../firebase'

type SignupType = {
  email: string
  password: string
}

const initialState = {
  email: '',
  password: '',
}

const SignupPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [signupData, setSignupData] = useState<SignupType>(initialState)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { email, password } = signupData
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user

        // MongoDB에 저장
        const obj = {
          nickname: user.email,
          email: user.email,
          uid: user.uid,
        }

        const response = await fetch(`/api/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(obj),
        })

        const result = await response.json()

        if (result.status === 201) {
          const data = result.data

          Notify.success('회원가입 완료!', {
            clickToClose: true,
          })

          dispatch(
            SET_ACTIVE_USER({
              nickname: data.nickname,
              email: data.email,
              mid: data._id,
            }),
          )
          router.push('/')
        }
      })
      .catch((error) => {
        console.error(error)
        Notify.failure(error.message, {
          clickToClose: true,
        })
      })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setSignupData((prev) => ({ ...prev, [name]: value }))
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
          회원가입하기
        </button>
        <Link
          href='./login'
          className='text-gray-600 underline text-sm text-center'
        >
          › 회원이라면 로그인 하러가기
        </Link>
      </form>
    </div>
  )
}

export default SignupPage
