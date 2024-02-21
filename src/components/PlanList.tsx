import { selectAuth } from '@/redux/slice/authSlice'
import { formatDate } from '@/utils/dayjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Confirm, Notify } from 'notiflix'
import React, { useCallback, useEffect, useState } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { useSelector } from 'react-redux'

type PlanType = {
  _id: string
  title: string
  data: string
  createdAt: string
  updatedAt: string
  createdById: string
}

const PlanList = () => {
  const router = useRouter()
  const auth = useSelector(selectAuth)

  async function getPlans() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/plans`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    )
    const data = await response.json()

    if (data.length === 0) {
      setIsNull(true)
      return
    }

    setPlans(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }

  const sortingFilter: string[] = ['생성일자', '이름']

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [sorting, setSorting] = useState<string>(sortingFilter[0])
  const [isNull, setIsNull] = useState<boolean>(false)
  const [plans, setPlans] = useState<PlanType[]>([])

  const sortPlans = useCallback(() => {
    const newPlans = [...plans]

    if (sorting === '생성일자') {
      newPlans.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (sorting === '이름') {
      newPlans.sort((a, b) => a.title.localeCompare(b.title))
    }

    setPlans(newPlans)
  }, [sorting])

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

  useEffect(() => {
    sortPlans()
  }, [sorting])

  useEffect(() => {
    getPlans()
  }, [])

  return (
    <div className='w-[85%] flex flex-col place-items-center mx-auto'>
      <div className='w-full mt-10 flex justify-between items-end'>
        <div className='text-2xl text-gray-600 font-semibold'>탐색하기</div>
        <div
          className='flex flex-col items-center justify-end gap-1 cursor-pointer'
          onClick={() => {
            setIsOpen((prev) => !prev)
          }}
        >
          <div className='relative inline-block text-left'>
            <button className='inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
              정렬
              <Image
                src='/icons/bars-arrow-down.svg'
                width='20'
                height='20'
                alt='정렬'
              />
            </button>

            {isOpen && (
              <div
                className='absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
                role='menu'
                tabIndex={-1}
                onMouseLeave={() => setIsOpen(false)}
              >
                <div
                  className='ring-1 ring-black ring-opacity-5 rounded-md overflow-hidden'
                  role='none'
                >
                  {sortingFilter.map((filter) => (
                    <div
                      key={filter}
                      className={`text-gray-700 block px-4 py-2 text-sm ${
                        sorting === filter ? 'bg-blue-100' : ''
                      } `}
                      id='menu-item-0'
                      onClick={() => {
                        setSorting(filter)
                      }}
                    >
                      {filter}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='w-full place-items-center mx-auto mt-10 grid gap-4 lg:grid-cols-3 md:grid-cols-2 mobile:grid-cols-1'>
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
                {auth.mid === plan.createdById && (
                  <div
                    className='cursor-pointer'
                    onClick={() => handleRemovePlan(plan._id)}
                  >
                    <AiOutlineClose />
                  </div>
                )}
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

export default PlanList
