import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMid } from '@/redux/slice/authSlice'
import {
  ADD_MARKER,
  CLEAR_MARKERS,
  selectPendingDatas,
  SET_EDIT_DATA,
} from '@/redux/slice/planSlice'

import { mapState } from '@/atom'
import { useRecoilValue } from 'recoil'

import PlanForm from '@/components/PlanForm'
import SearchSide from '@/components/SearchSide'

import { useRouter } from 'next/router'

import { planType } from '@/interface'

type FormInfoType = {
  title: string
  isPublic: boolean
  city: string
}

export default function PlanEditPage() {
  const router = useRouter()
  const { id } = router.query

  const dispatch = useDispatch()

  const map = useRecoilValue(mapState)

  const createdById = useSelector(selectMid)
  const pendingDatas = useSelector(selectPendingDatas)

  const [isPending, setIsPending] = useState<boolean>(true)
  const [isNull, setIsNull] = useState<boolean>(false)
  const [isMine, setIsMine] = useState<boolean>(true)

  const [formInfo, setFormInfo] = useState<FormInfoType | null>(null)

  /**
   * @description 검색 결과에서 장소 선택
   * @param data 추가하고자 하는 장소의 정보
   */
  function handleSelect(data: planType) {
    dispatch(ADD_MARKER({ data, map }))
  }

  /**
   * @description 수정하고자 하는 계획의 데이터 조회
   */
  async function getData() {
    const response = await fetch(`/api/plan?planId=${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    const result = await response.json()

    if (result.status === 200) {
      const data = result.data
      if (data.createdById !== createdById) {
        setIsMine(false)
        return
      }

      if (data._id) {
        setIsNull(false)

        const pendingDatasParam = JSON.parse(data.data)

        const mapDatasParam: any[] = []
        pendingDatasParam.forEach((data: any) => {
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
        setFormInfo({
          title: data.title,
          isPublic: data.isPublic,
          city: data.city,
        })

        setIsPending(false)
      }
    } else {
      setIsNull(true)
    }
  }

  useEffect(() => {
    dispatch(CLEAR_MARKERS(map))
    if (map) {
      getData()
    }
  }, [dispatch, map])

  if (!isMine) {
    return (
      <div className='w-full h-[50vh] flex flex-col justify-center items-center gap-3 text-sm'>
        <span>수정 권한이 없습니다.</span>
        <div
          onClick={() => router.push('/')}
          className='underline cursor-pointer'
        >
          목록으로 돌아가기
        </div>
      </div>
    )
  }

  return (
    <>
      {pendingDatas && (
        <>
          <div>
            <div className='md:flex w-full mobile:hidden'>
              <div className='w-1/3 p-4 rounded-md flex flex-col gap-2'>
                <div className='mx-2 text-xl text-blue-800 font-semibold'>
                  장소 검색하기
                </div>
                <SearchSide handleSelect={handleSelect} />
              </div>
              <div className='w-2/3 mr-4 z-10'>
                <PlanForm
                  isEditMode={true}
                  planIsPublic={formInfo?.isPublic}
                  planTitle={formInfo?.title}
                  planCity={formInfo?.city}
                />
              </div>
            </div>
            <div className='flex justify-center mt-16 md:hidden lg:hidden'>
              경로 생성은 웹에서 가능합니다.
            </div>
          </div>
        </>
      )}
    </>
  )
}
