import { useState, useCallback, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { mapState } from '@/atom'

import SearchSide from '@/components/SearchSide'
import PlanForm from '@/components/PlanForm'

export default function PlanNewPage() {
  const map = useRecoilValue(mapState)

  const [pendingDatas, setPendingDatas] = useState<any[]>([])
  const [markerData, setMarkerData] = useState(new Map<string, any>(null))

  function handleSelect(data) {
    if (markerData.has(data.id)) {
      data = { ...data, id: `${data.id}${new Date()}` }
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

    const customOverlay = createOverlay(data.place_name, latlng)

    window.kakao.maps.event.addListener(marker, 'mouseover', function () {
      marker.setZIndex(100)
      customOverlay.setZIndex(100)
    })

    window.kakao.maps.event.addListener(marker, 'mouseout', function () {
      marker.setZIndex(1)
      customOverlay.setZIndex(1)
    })

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
    setPendingDatas((prevState) => [...prevState, data])
    showMarkers(map, marker)
  }

  /**
   * 커스텀오버레이 인스턴스를 생성하여 리턴함
   * @param place_name
   * @param latlng
   * @returns customOverlay
   */
  function createOverlay(place_name, latlng) {
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
  function removeMarkers(id) {
    if (!markerData.has(id)) return

    // 마커, 오버레이 삭제하기
    markerData.get(id)?.marker.setMap(null)
    markerData.get(id)?.customOverlay.setMap(null)

    const newMap = new Map(markerData)
    newMap.delete(id)
    setMarkerData(newMap)

    const updatedItems = pendingDatas.filter((item) => item.id !== id)
    setPendingDatas(updatedItems)
  }

  useEffect(() => {
    handleBounds()
  }, [handleBounds, markerData])

  return (
    <div className='flex w-full'>
      <div className='w-1/3 p-4 rounded-md'>
        <SearchSide handleSelect={handleSelect} removeMarkers={removeMarkers} />
      </div>

      <div className='w-2/3 mr-4'>
        <PlanForm
          markerData={markerData}
          setMarkerData={setMarkerData}
          pendingDatas={pendingDatas}
          setPendingDatas={setPendingDatas}
          removeMarkers={removeMarkers}
        />
      </div>
    </div>
  )
}
