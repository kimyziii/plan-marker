import { useState, useCallback, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { mapState } from '@/atom'

import SearchSide from '@/components/SearchSide'
import PlanForm from '@/components/PlanForm'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsLoggedIn } from '@/redux/slice/authSlice'
import { useRouter } from 'next/router'
import { Confirm } from 'notiflix'
import { ADD_MARKER, REMOVE_MARKERS } from '@/redux/slice/planSlice'

/**
 * 커스텀오버레이 인스턴스를 생성하여 리턴함
 * @param place_name
 * @param latlng
 * @returns customOverlay
 */
export function createOverlay(place_name, latlng, map) {
  var content =
    '<div className="customoverlay" style="padding: 3px 8px; background-color: #EEF6FF; border-radius: 14px; border: 1px solid #EDF2FD; color: #2E5BDC; font-size: small;">' +
    `    <span className="title">${place_name}</span>` +
    '</div>'

  var customOverlay = new window.kakao.maps.CustomOverlay({
    map: map,
    position: latlng,
    content: content,
    xAnchor: 0.5,
    yAnchor: 0,
  })

  return customOverlay
}

export default function PlanNewPage() {
  const router = useRouter()
  const map = useRecoilValue(mapState)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useDispatch()

  const [markerData, setMarkerData] = useState(new Map<string, any>(null))

  function handleSelect(data) {
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
      draggable: true,
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
   * 해당 지도에 해당 마커를 표시함
   * @param map
   * @param marker
   */
  function showMarkers(map, marker) {
    marker.setMap(map)
  }

  /**
   * 마커가 추가 혹은 삭제 될 때, 지도의 범위를 재설정함
   */
  const handleBounds = useCallback(() => {
    const points = []

    if (markerData?.size > 0) {
      markerData.forEach((value, key) => {
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
   * 삭제 버튼을 통해 경로에서 해당 장소를 삭제함
   * @param data
   * @returns void
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

  useEffect(() => {
    if (!isLoggedIn) {
      Confirm.show(
        '권한 없음',
        '새로운 여행 경로를 만들기 위해서는 로그인이 필요합니다.',
        '확인',
        '취소',
        () => {
          router.push('/login')
        },
        () => {
          router.push('/')
        },
      )
    }
  }, [])

  useEffect(() => {
    handleBounds()
  }, [handleBounds, markerData])

  return (
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

        <div className='w-2/3 mr-4'>
          <PlanForm
            isEditMode={false}
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
  )
}
