import { DataTypeGroup } from '@/interface'
import React from 'react'
import PlanCard from './PlanCard'

interface PlanCitySectionProps {
  plan: DataTypeGroup
}

const PlanCitySection = ({ plan }: PlanCitySectionProps) => {
  return (
    <div key={plan.city} className='w-full'>
      <div
        className='text-xl font-bold'
        style={{
          textShadow: 'text-shadow: 0px 0px 6px rgba(255,255,255,0.7)',
        }}
      >
        {plan.city}
      </div>
      <hr className='w-full border-1 border-gray-100 mt-2 mb-2' />
      <div className='grid grid-cols-3 gap-3 mb-10'>
        {plan?.data.map((plan) => (
          <PlanCard plan={plan} key={plan._id} />
        ))}
      </div>
    </div>
  )
}

export default PlanCitySection
