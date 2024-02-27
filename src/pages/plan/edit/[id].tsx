import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMid } from '@/redux/slice/authSlice'
import {
  ADD_MARKER,
  CLEAR_MARKERS,
  REMOVE_MARKERS,
  selectPendingDatas,
  SET_EDIT_DATA,
} from '@/redux/slice/planSlice'

import { mapState } from '@/atom'
import { useRecoilValue } from 'recoil'

import PlanForm from '@/components/PlanForm'
import SearchSide from '@/components/SearchSide'

import { useRouter } from 'next/router'

import { createOverlay } from '../new'
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

  const [formInfo, setFormInfo] = useState<FormInfoType>(null)
  const [markerData, setMarkerData] = useState(new Map<string, any>(null))

  /**
   * @description 마커를 다 감싸도록 지도 조절
   */
  const handleBounds = useCallback(() => {
    const points = []

    if (markerData?.size > 0) {
      markerData.forEach((value) => {
        const latlng = new window.kakao.maps.LatLng(
          value.data?.y,
          value.data?.x,
        )
        points.push(latlng)
      })
      var bounds = new window.kakao.maps.LatLngBounds()

      for (let i = 0; i < points.length; i++) {
        bounds.extend(points[i])
      }

      map.setBounds(bounds)
    }
  }, [map, markerData])

  /**
   * @description 지도에 마커 및 오버레이 작업
   */
  function getMap() {
    const newMarkerData = new Map()

    var imageSrc = '/icons/default-marker.svg'
    var imageSize = new window.kakao.maps.Size(30, 35)
    var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize)

    var bounds = new window.kakao.maps.LatLngBounds()
    pendingDatas.forEach((data: planType) => {
      const latlng = new window.kakao.maps.LatLng(data.y, data.x)

      var marker = new window.kakao.maps.Marker({
        map: map,
        position: latlng,
        title: data.place_name,
        image: markerImage,
      })

      var content =
        '<div className="customoverlay" style="padding: 3px 8px; background-color: #EEF6FF; border-radius: 14px; border: 1px solid #EDF2FD; color: #2E5BDC; font-size: small;">' +
        `    <span className="title">${data.place_name}</span>` +
        '</div>'

      var customOverlay = new window.kakao.maps.CustomOverlay({
        map: map,
        position: latlng,
        content: content,
        xAnchor: 0.5,
        yAnchor: 0,
      })

      window.kakao.maps.event.addListener(marker, 'mouseover', function () {
        marker.setZIndex(100)
        customOverlay.setZIndex(100)
      })

      window.kakao.maps.event.addListener(marker, 'mouseout', function () {
        marker.setZIndex(1)
        customOverlay.setZIndex(1)
      })

      bounds.extend(latlng)

      newMarkerData.set(data.id, {
        marker,
        data: { x: data.x, y: data.y },
        customOverlay,
      })
    })

    map.setBounds(bounds)
    setMarkerData(newMarkerData)
  }

  /**
   * @description 검색 결과에서 장소 선택
   * @param data 추가하고자 하는 장소의 정보
   */
  function handleSelect(data: planType) {
    if (markerData.has(data.id)) {
      data = {
        ...data,
        id: `${data.id}${new Date()}`,
      }
    }

    var imageSrc = '/icons/default-marker.svg'
    var imageSize = new window.kakao.maps.Size(30, 35)
    var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize)

    const latlng = new window.kakao.maps.LatLng(data.y, data.x)

    var marker = new window.kakao.maps.Marker({
      position: latlng,
      title: data.place_name,
      image: markerImage,
    })

    const customOverlay = createOverlay(data.place_name, latlng, map)

    window.kakao.maps.event.addListener(marker, 'mouseover', function () {
      marker.setZIndex(100)
      customOverlay.setZIndex(100)
    })

    window.kakao.maps.event.addListener(marker, 'mouseout', function () {
      marker.setZIndex(1)
      customOverlay.setZIndex(1)
    })

    dispatch(ADD_MARKER({ data, marker, customOverlay }))

    setMarkerData(
      (prev) =>
        new Map(
          prev.set(data.id, {
            marker,
            data: { x: data.x, y: data.y },
            customOverlay,
          }),
        ),
    )

    showMarkers(map, marker)
  }

  /**
   * @description 계획에서 하나의 장소 삭제
   * @param id 삭제하고자 하는 장소의 id
   */
  function removeMarkers(id: string) {
    if (!markerData.has(id)) return

    // 마커, 오버레이 삭제하기
    markerData.get(id)?.marker.setMap(null)
    markerData.get(id)?.customOverlay.setMap(null)

    const newMap = new Map(markerData)
    newMap.delete(id)
    setMarkerData(newMap)

    dispatch(REMOVE_MARKERS(id))
  }

  /**
   * @description 해당 지도에 해당 마커를 찍음
   * @param map 지도
   * @param marker 마커
   */
  function showMarkers(map: any, marker: any) {
    marker.setMap(map)
  }

  /**
   * @description 수정하고자 하는 계획의 데이터 조회
   */
  async function getData() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/plan/${id}`,
      {
        method: 'GET',
        credentials: 'include',
      },
    )
    const data = await response.json()
    if (data.createdById !== createdById) {
      setIsMine(false)
      return
    }

    if (data._id) {
      setIsNull(false)
      dispatch(SET_EDIT_DATA(JSON.parse(data.data)))
      setFormInfo({
        title: data.title,
        isPublic: data.isPublic,
        city: data.city,
      })

      setIsPending(false)
    } else {
      setIsNull(true)
    }
  }

  useEffect(() => {
    dispatch(CLEAR_MARKERS())
    getData()
  }, [dispatch])

  useEffect(() => {
    if (!isPending) {
      if (map) {
        getMap()
      }
    }
  }, [isPending])

  useEffect(() => {
    handleBounds()
  }, [handleBounds, markerData])

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
                <SearchSide
                  handleSelect={handleSelect}
                  removeMarkers={removeMarkers}
                />
              </div>
              <div className='w-2/3 mr-4 z-10'>
                <PlanForm
                  isEditMode={true}
                  planIsPublic={formInfo?.isPublic}
                  planTitle={formInfo?.title}
                  planCity={formInfo?.city}
                  markerData={markerData}
                  setMarkerData={setMarkerData}
                  removeMarkers={removeMarkers}
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
