import { selectAuth, SET_ACTIVE_USER } from '@/redux/slice/authSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GrFormEdit } from 'react-icons/gr'
import { useRouter } from 'next/navigation'
import { AiOutlineClose } from 'react-icons/ai'

type PlanType = {
  _id: string
  title: string
  data: string
  createdAt: string
  updatedAt: string
  createdById: string
}

export default function MyPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const auth = useSelector(selectAuth)
  const [nickname, setNickname] = useState<string>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [error, setError] = useState<string>(null)

  const [isNull, setIsNull] = useState<boolean>(false)
  const [plans, setPlans] = useState<PlanType[]>([])

  async function getData() {
    if (auth) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/plans/${auth.mid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await response.json()

      if (data.length === 0) {
        setIsNull(true)
        return
      }

      setPlans(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
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

  function handleCancel() {
    setNickname(auth.nickname)
    setEditMode(false)
    setError(null)
  }

  async function handleRemovePlan(planId: string) {
    const confirm = window.confirm('해당 경로를 삭제하시겠습니까?')
    if (confirm) {
      // const result = await axios.delete(`/api/plan?pId=${planId}`)
      // if (result.status === 200) router.reload()
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
              <div
                className='border border-gray-300 rounded-md px-2 py-1 bg-gray-100 font-semibold text-gray-600 text-xs cursor-pointer'
                onClick={handleCancel}
              >
                취소
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
      <span className='text-red-600 text-sm ml-3 mt-1 mb-2'>{error}</span>
      <div className='text-sm italic'>{auth.email}</div>
      <div className='w-full place-items-center mx-auto mt-10 grid grid-cols-3 gap-4'>
        {!isNull &&
          plans.map((plan) => (
            <div
              key={plan._id}
              className='w-full border rounded-md flex flex-col'
            >
              <div className='px-5 py-4 flex justify-between items-start'>
                <div>
                  <div className='text-lg font-semibold'>{plan.title}</div>
                  <div className='text-gray-500 text-sm'>
                    {new Date(plan.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div
                  className='cursor-pointer'
                  onClick={() => handleRemovePlan(plan._id)}
                >
                  <AiOutlineClose />
                </div>
              </div>
              <div
                className='bg-blue-100 text-center text-sm py-2 text-blue-600 font-semibold cursor-pointer'
                onClick={() => {
                  router.push(`/plan/${plan._id}`)
                }}
                role='presentation'
              >
                상세보기
              </div>
            </div>
          ))}
      </div>
      {isNull && (
        <div className='text-base w-full flex justify-center px-8 py-20 border border-gray-200 rounded-md'>
          데이터가 없습니다.
        </div>
      )}
    </div>
  )
}
