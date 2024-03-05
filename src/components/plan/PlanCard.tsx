import { selectAuth } from '@/redux/slice/authSlice'
import { useRouter } from 'next/navigation'
import { Confirm, Notify } from 'notiflix'
import React from 'react'
import { useSelector } from 'react-redux'

import { AiOutlineClose } from 'react-icons/ai'
import { formatDate } from '@/utils/dayjs'

const PlanCard = ({ plan }) => {
  const router = useRouter()
  const auth = useSelector(selectAuth)

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
          setTimeout(() => {
            router.refresh()
          }, 1000)
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

  return (
    <div className='w-full flex flex-col gap-2 min-h-32'>
      <div className='w-full border rounded-md flex flex-col justify-between'>
        <div className='w-full px-4 py-3 flex flex-col justify-between items-start gap-1'>
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
  )
}

export default PlanCard
