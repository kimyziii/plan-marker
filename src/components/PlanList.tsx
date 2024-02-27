import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAuth } from '@/redux/slice/authSlice'

import { useRouter } from 'next/navigation'

import { Confirm, Notify } from 'notiflix'
import { AiOutlineClose } from 'react-icons/ai'
import { formatDate } from '@/utils/dayjs'
import { CITY_MAP } from '@/utils/city'
import { dataType } from '@/interface'

interface DataTypeGroup {
  city: string
  data: dataType[]
}

export default function PlanList() {
  const router = useRouter()
  const auth = useSelector(selectAuth)

  // 계획 리스트 상태
  const [isNull, setIsNull] = useState<boolean>(false)
  const [plans, setPlans] = useState<DataTypeGroup[]>([])

  /**
   * @description 공개로 설정 된 모든 여행 계획 리스트를 가져옴
   */
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

    const plansObj: { [city: string]: dataType[] } = {}
    data.forEach((d: dataType) => {
      const cityName = d.city || '분류없음'
      if (!plansObj[cityName]) {
        plansObj[cityName] = []
      }
      plansObj[cityName].push(d)
    })
    const plans: DataTypeGroup[] = []
    for (const plan in plansObj) {
      plans.push({ city: plan, data: plansObj[plan] })
    }

    // 도시 배열 순서대로 정렬
    plans.sort((a, b) => {
      return CITY_MAP.get(a.city) - CITY_MAP.get(b.city)
    })

    // 도시의 경로들에 대해 생성일자 내림차순으로 정렬
    plans.forEach((plan) => {
      plan.data.sort((a, b) => {
        return b.createdAt.toString().localeCompare(a.createdAt.toString())
      })
    })

    if (data.length === 0) {
      setIsNull(true)
      return
    }

    setPlans(plans)
  }

  /**
   * @description 특정 여행 계획 한 개 삭제
   * @param id 삭제하고자 하는 계획의 id값
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

  useEffect(() => {
    getPlans()
  }, [])

  return (
    <div className='w-[85%] flex flex-col place-items-center mx-auto'>
      <div className='w-full mt-8 flex justify-between items-end'>
        <div className='text-2xl text-gray-600 font-semibold mb-4'>
          탐색하기
        </div>
      </div>
      <div className='w-full flex flex-col gap-3 justify-start items-start mt-4'>
        {!isNull &&
          plans.map((p) => (
            <>
              <div
                className='text-xl font-bold'
                style={{
                  textShadow: 'text-shadow: 0px 0px 6px rgba(255,255,255,0.7)',
                }}
              >
                {p.city}
              </div>
              <hr className='border-1 border-gray-100 w-full' />
              <div key={p.city} className='w-full grid grid-cols-3 gap-3 mb-10'>
                {p?.data.map((plan) => (
                  <div
                    key={plan._id}
                    className='w-full flex flex-col gap-2 min-h-32'
                  >
                    <div className='w-full border rounded-md flex flex-col justify-between'>
                      <div className='px-4 py-3 flex flex-col justify-between items-start gap-1'>
                        <div className='w-full flex justify-between items-center'>
                          <div className=' text-lg font-semibold truncate ...'>
                            {plan.title}
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
                        <div className='text-gray-500 text-sm'>
                          {formatDate(plan.createdAt, 'YYYY. M. D. A h:mm')}
                        </div>
                      </div>
                      <div
                        className='bg-blue-100 text-center text-sm py-2 text-blue-600 font-semibold cursor-pointer min-h-9 h-9'
                        onClick={() => {
                          router.push(`/plan/${plan._id}`)
                        }}
                        role='presentation'
                      >
                        상세보기
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
