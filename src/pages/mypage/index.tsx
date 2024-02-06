import { selectAuth, SET_ACTIVE_USER } from '@/redux/slice/authSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GrFormEdit } from 'react-icons/gr'
import { useRouter } from 'next/navigation'

export default function MyPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector(selectAuth)
  const [nickname, setNickname] = useState<string>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [error, setError] = useState<string>(null)

  async function getData() {
    if (auth) {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/plans/${auth.mid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }

  function handleEdit() {
    setEditMode((prev) => !prev)
  }

  async function handleSave() {
    setError(null)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${auth.mid}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname }),
      },
    )
    const result = await response.json()

    if (response.status === 200) {
      dispatch(SET_ACTIVE_USER({ ...auth, nickname: nickname }))
      setEditMode(false)
    } else if (response.status === 409) {
      setError(result.message)
    }
  }

  useEffect(() => {
    getData()
    setNickname(auth.nickname)
  }, [auth])

  return (
    <div className='w-[60%] flex flex-col justify-center mx-auto mt-12'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-2'>
          {editMode ? (
            <>
              <input
                className='font-semibold text-lg bg-slate-100 rounded-md px-3'
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                }}
              />
              <div
                className='border border-blue-300 rounded-md px-2 py-1 bg-blue-100 font-semibold text-blue-600 text-xs cursor-pointer'
                onClick={handleSave}
              >
                저장
              </div>
            </>
          ) : (
            <>
              <span className='font-semibold text-lg'>{nickname}</span>
              <GrFormEdit
                size={22}
                onClick={handleEdit}
                className='cursor-pointer'
              />
            </>
          )}
        </div>
        <div className='text-sm bg-red-100 px-2 py-1 border border-red-300 rounded-md text-red-600 font-semibold h-[30px]'>
          탈퇴하기
        </div>
      </div>
      <span className='text-red-600 text-sm ml-3 mt-1'>{error}</span>
    </div>
  )
}
