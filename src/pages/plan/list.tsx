import axios from 'axios'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

type PlanType = {
  id: string
  title: string
  data: string
  createdAt: string
  updatedAt: string
  createdById: string
}

export default function PlanListPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const sortingFilter: string[] = ['생성일자', '이름']

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [sorting, setSorting] = useState<string>(sortingFilter[0])
  const [isNull, setIsNull] = useState<boolean>(false)
  const [plans, setPlans] = useState<PlanType[]>([])

  const getUserId = useCallback(async () => {
    if (session) {
      const userEmail = session?.user.email
      const userRes = await axios(`/api/user?email=${userEmail}`)
      const userId = userRes.data.result.id
      getPlans(userId)
    } else {
      router.replace('/login')
    }
  }, [session, router])

  async function getPlans(userId) {
    const res = await axios(`/api/plan?uId=${userId}`)
    if (res.data) {
      const plansData = res.data.plans
      plansData.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      setPlans(plansData)
    } else {
      setIsNull(true)
    }
  }

  const sortPlans = useCallback(() => {
    const newPlans = [...plans]

    if (sorting === '생성일자') {
      newPlans.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (sorting === '이름') {
      newPlans.sort((a, b) => a.title.localeCompare(b.title))
    }

    setPlans(newPlans)
  }, [sorting, plans])

  useEffect(() => {
    getUserId()
  }, [getUserId])

  useEffect(() => {
    sortPlans()
  }, [sorting, sortPlans])

  return (
    <div className='w-[85%] flex flex-col place-items-center mx-auto'>
      <div className='w-full mt-10 flex justify-between items-end'>
        <div className='text-2xl text-blue-700 font-bold'>나의 경로</div>
        <div
          className='flex flex-col items-center justify-end gap-1 cursor-pointer'
          onClick={() => {
            setIsOpen((prev) => !prev)
          }}
        >
          <div className='relative inline-block text-left'>
            <button className='inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
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
      <div className='w-full place-items-center mx-auto mt-10 grid grid-cols-3 gap-4'>
        {!isNull &&
          plans.map((plan) => (
            <div
              key={plan.id}
              className='w-full border rounded-md flex flex-col'
            >
              <div className='px-5 py-4'>
                <div className='text-lg font-semibold'>{plan.title}</div>
                <div className='text-gray-500 text-sm'>
                  {new Date(plan.createdAt).toLocaleString('ko-KR')}
                </div>
              </div>
              <div
                className='bg-blue-100 text-center text-sm py-2 text-blue-600 font-semibold cursor-pointer'
                onClick={() => {
                  router.push(`/plan/${plan.id}`)
                }}
                role='presentation'
              >
                상세보기
              </div>
            </div>
          ))}
        {isNull && <div>데이터가 없습니다.</div>}
      </div>
    </div>
  )
}
