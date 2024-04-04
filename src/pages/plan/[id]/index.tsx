import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMid } from '@/redux/slice/authSlice'

import { useRecoilValue } from 'recoil'
import { mapState } from '@/atom'

import { Map as MapComponent } from '@/components/Map'

import Image from 'next/image'
import { useRouter } from 'next/router'

import { Confirm, Notify } from 'notiflix'
import { planType } from '@/interface'
import { selectPendingDatas, SET_EDIT_DATA } from '@/redux/slice/planSlice'
import { InferGetServerSidePropsType } from 'next'

export const getServerSideProps = async (context) => {
  const { params } = context
  const { id } = params
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/plan?planId=${id}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )
  const result = await response.json()
  const status = result.status

  if (status === 200) {
    const data = result.data
    return { props: { status: 200, plan: data } }
  }

  if (status === 400) {
    return { props: { status: 400 } }
  }
}

export default function PlanDetailPage({
  status,
  plan,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { id } = router.query

  const map = useRecoilValue(mapState)
  const mid = useSelector(selectMid)
  const pendingDatas = useSelector(selectPendingDatas)

  const [data, setData] = useState<any>(null)
  const [isNull, setIsNull] = useState<boolean>(false)

  /**
   * @description 수정 페이지로 이동
   */
  function handleEditPlan() {
    router.push(`/plan/edit/${id}`)
  }

  /**
   * @description 계획 삭제
   */
  function handleRemovePlan() {
    Confirm.show(
      '계획 삭제하기',
      '해당 계획을 삭제하시겠습니까?',
      '삭제',
      '취소',
      async () => {
        const response = await fetch(`/api/plan?planId=${id}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()
        if (result.status === 200) {
          Notify.success(`삭제 완료!`, {
            clickToClose: true,
          })
          setTimeout(() => {
            router.push('/')
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
  useEffect(() => {
    if (map) {
      if (status === 200) {
        setData(plan)
        setIsNull(false)
      }
      if (status === 400) {
        setData(null)
        setIsNull(true)
      }
    }
  }, [map])

  useEffect(() => {
    if (data) {
      const pendingDatasParam = JSON.parse(data.data)
      const mapDatasParam: any[] = []
      pendingDatasParam.forEach((data: planType) => {
        mapDatasParam.push({
          id: data.id,
          x: data.x,
          y: data.y,
          place_name: data.place_name,
        })
      })

      dispatch(
        SET_EDIT_DATA({
          pendingDatas: pendingDatasParam,
          mapDatas: mapDatasParam,
          map: map,
        }),
      )
    }
  }, [data])

  if (isNull) {
    return (
      <>
        <div className='py-20 text-sm flex flex-col justify-center items-center'>
          <span>해당 경로를 찾을 수 없습니다.</span>
          <span> 다시 시도해주세요.</span>
        </div>
      </>
    )
  }

  return (
    <div className='w-[90%] mx-auto'>
      <div className='w-full flex flex-col gap-4'>
        {/* 제목, 작성자, 작성일자 */}
        <div className='w-full flex flex-row items-center justify-between'>
          <div className='w-full mt-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-row gap-3 items-start text-2xl font-bold leading-7 text-gray-900'>
                {data?.title || ''}
                <div className='flex items-center justify-center bg-blue-100 font-semibold text-sm px-2 py-1 rounded-lg'>
                  {data?.city || '분류없음'}
                </div>
              </div>
              <div className='flex flex-row mobile:flex-col items-center mobile:items-start text-sm text-gray-500 gap-4 mobile:gap-1'>
                <div className='flex flex-row items-center gap-2'>
                  <Image
                    src='/icons/user.svg'
                    alt='생성자'
                    width='18'
                    height='18'
                  />
                  <span>{data?.createdByName || ''}</span>
                </div>
                <div className='flex flex-row items-center gap-2'>
                  <Image
                    src='/icons/calendar.svg'
                    alt='생성일자'
                    width='18'
                    height='18'
                  />
                  <span>
                    {new Date(data?.createdAt).toLocaleString('ko-KR') || ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className='w-[20%] flex flex-row justify-end gap-2'>
            {mid === data?.createdById && (
              <>
                <button
                  className='text-sm bg-amber-100 px-2 py-1 border
                    border-amber-300 rounded-md text-amber-600 font-semibold
                    h-[30px]'
                  onClick={handleEditPlan}
                >
                  수정
                </button>
                <button
                  className='text-sm bg-red-100 px-2 py-1 border border-red-300 rounded-md text-red-600 font-semibold h-[30px]'
                  onClick={handleRemovePlan}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
        <div className='flex gap-4 flex-col md:flex-row lg:flex-row'>
          <div className='lg:w-2/5 overflow-hidden w-full'>
            {/* 지도 */}
            <div
              className='w-full lg:h-[75vh] md:h-[75vh] mobile:h-[50vh]'
              id='map'
            >
              <MapComponent type='full' />
            </div>
          </div>

          {/* 장소 정보 */}
          <div className='lg:w-3/5 w-full'>
            <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mb-3'>
              <thead className='text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='px-3 py-3 text-center'>
                    No
                  </th>
                  <th scope='col' className='px-3 py-3 text-center'>
                    시간
                  </th>
                  <th scope='col' className='px-3 py-3'>
                    장소명
                  </th>
                  <th scope='col' className='px-3 py-3'>
                    메모
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingDatas?.map((data, index) => {
                  const time =
                    data.hour && data.minute
                      ? `${data.hour}:${data.minute}`
                      : data.hour && !data.minute
                      ? `${data.hour}`
                      : ''
                  return (
                    <tr
                      key={data.id}
                      className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'
                    >
                      <th
                        scope='row'
                        className='w-[10%] px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center'
                      >
                        {index + 1}
                      </th>
                      <td className='w-[10%] whitespace-nowrap text-center px-3 py-3'>
                        {time}
                      </td>
                      <td className='w-[30%] px-2 py-2'>{data.place_name}</td>
                      <td className='w-[50%] px-2 py-2 min-h-12'>
                        {data.memo}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
