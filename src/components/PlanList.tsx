import React, { useEffect, useState } from 'react'
import CITY_MAP from '../utils/city'
import { dataType, DataTypeGroup } from '@/interface'
import PlanCitySection from './plan/PlanCitySection'

export default function PlanList({ data }) {
  // 계획 리스트 상태
  const [isNull, setIsNull] = useState<boolean>(false)
  const [plans, setPlans] = useState<DataTypeGroup[]>([])

  /**
   * @description 공개로 설정 된 모든 여행 계획 리스트를 가져옴
   */
  async function getPlans() {
    if (data.length === 0) {
      setIsNull(true)
      return
    }

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
      return CITY_MAP[a.city] - CITY_MAP[b.city]
    })

    // 도시의 경로들에 대해 생성일자 내림차순으로 정렬
    plans.forEach((plan) => {
      plan.data.sort((a, b) => {
        return b.createdAt.toString().localeCompare(a.createdAt.toString())
      })
    })

    setPlans(plans)
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
          plans.map((plan) => <PlanCitySection plan={plan} key={plan.city} />)}
      </div>
      {isNull && (
        <div className='text-base w-full flex justify-center px-8 py-20 border border-gray-200 rounded-md'>
          데이터가 없습니다.
        </div>
      )}
    </div>
  )
}
