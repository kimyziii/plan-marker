import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAuth, selectMid, SET_ACTIVE_USER } from '@/redux/slice/authSlice'

import { useRouter } from 'next/navigation'

import { GrFormEdit } from 'react-icons/gr'
import { AiOutlineClose } from 'react-icons/ai'

import { Confirm, Notify } from 'notiflix'

import { deleteUser } from 'firebase/auth'
import { auth as currentUser } from '../../../firebase'

import { formatDate } from '@/utils/dayjs'
import { dataType } from '@/interface'

export default function MyPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const auth = useSelector(selectAuth)
  const mid = useSelector(selectMid)

  const [nickname, setNickname] = useState<string>(null)
  const [editMode, setEditMode] = useState<boolean>(false)
  const [error, setError] = useState<string>(null)

  const [isNull, setIsNull] = useState<boolean>(false)
  const [plans, setPlans] = useState<dataType[]>([])

  /**
   * @description 유저 정보 및 해당 유저의 모든 계획 조회
   */
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

      setPlans(
        data.sort((a: dataType, b: dataType) =>
          b.createdAt.toString().localeCompare(a.createdAt.toString()),
        ),
      )
    }
  }

  /**
   * @description 유저 닉네임 보기/수정 상태 변경
   */
  function handleEdit() {
    setEditMode((prev) => !prev)
  }

  /**
   * @description 유저 닉네임 변경
   * 중복되는 닉네임이 있을 경우 에러 메세지 표시
   */
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

  /**
   * @description 유저 닉네임 변경 취소
   */
  function handleCancel() {
    setNickname(auth.nickname)
    setEditMode(false)
    setError(null)
  }

  /**
   * @description 특정 여행 계획 삭제
   * @param id 해당 여행 계획의 id값
   */
  function handleRemovePlan(id: string) {
    Confirm.show(
      '계획 삭제하기',
      '해당 계획을 삭제하시겠습니까?',
      '삭제',
      '취소',
      async () => {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/plan/${id}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        if (result.status === 200) {
          Notify.success(`삭제 완료!`, {
            clickToClose: true,
          })
          router.refresh()
        }
      },
      () => {},
      {
        titleColor: 'black',
        okButtonBackground: '#dc2626',
        okButtonColor: 'white',
        borderRadius: '8px',
      },
    )
  }

  /**
   * @description 회원 탈퇴하기 안내창
   */
  function handleUserDelete() {
    Confirm.show(
      '계정 삭제하기',
      '계정을 삭제하시겠습니까?',
      '삭제',
      '취소',
      () => deleteAuth(),
      () => {},
      {
        titleColor: 'black',
        okButtonBackground: '#dc2626',
        okButtonColor: 'white',
        borderRadius: '8px',
      },
    )
  }

  /**
   * @description 회원 정보 삭제
   * 로그인 한 지 일정 시간이 지난 경우 다시 로그인 후 삭제 과정 필요 (firebase 규칙)
   */
  function deleteAuth() {
    const curUser = currentUser.currentUser

    deleteUser(curUser)
      .then(async () => {
        try {
          const result = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${mid}`,
            {
              method: 'DELETE',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          if (result.status === 200) {
            Notify.success('성공적으로 계정을 삭제했습니다.')
          }
        } catch (err) {
          Notify.failure(err.message)
        }
      })
      .catch((err) => {
        if (err.code.includes(`recent-login`)) {
          Confirm.show(
            '로그인 재요청',
            `해당 작업에는 재로그인이 필요합니다. <br> 로그인 페이지로 이동하시겠습니까?`,
            '이동',
            '취소',
            () => {
              router.push('/login')
            },
            () => {},
            {
              titleColor: 'black',
              okButtonBackground: '#dc2626',
              okButtonColor: 'white',
              borderRadius: '8px',
              plainText: false,
            },
          )
        }
      })
  }

  useEffect(() => {
    if (auth.isLoggedIn) {
      getData()
      setNickname(auth.nickname)
    } else {
      router.push('/login')
    }
  }, [auth])

  return (
    <div className='md:w-[80%] lg:w-[60%] flex flex-col justify-center mt-12 mobile:w-[90%] mx-auto'>
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-2'>
          {editMode ? (
            <>
              <input
                className='font-semibold text-lg bg-slate-100 rounded-md px-3 mobile:w-40'
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
        <div
          className='text-sm bg-red-100 px-2 py-1 border border-red-300 rounded-md text-red-600 font-semibold h-[30px] cursor-pointer'
          onClick={handleUserDelete}
        >
          탈퇴하기
        </div>
      </div>
      <span className='text-red-600 text-sm ml-3 mt-1 mb-2'>{error}</span>
      <div className='text-sm italic'>{auth.email}</div>
      <h1 className='mt-10 mb-3 text-2xl font-extrabold'>나의 여행경로</h1>
      <div className='w-full place-items-center grid gap-4 mobile:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
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
                    {formatDate(plan.createdAt, 'YYYY. M. D. A h:mm:ss')}
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
