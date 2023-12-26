import { StoreType } from '@/interface'
import { Dispatch, SetStateAction, useEffect, useCallback } from 'react'

interface MarkerProps {
  map: any
  stores: StoreType[]
  setCurrentStore: Dispatch<SetStateAction<any>>
}

export default function Markers({ map, stores, setCurrentStore }: MarkerProps) {
  const loadKaKaoMarkers = useCallback(() => {
    if (map) {
      // store marker
      stores?.map((store) => {
        var imageSrc = store?.category
            ? `/images/markers/${store?.category}.png`
            : '/images/markers/default.png',
          imageSize = new window.kakao.maps.Size(40, 40),
          imageOption = { offset: new window.kakao.maps.Point(27, 69) }

        var markerImage = new window.kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imageOption,
          ),
          markerPosition = new window.kakao.maps.LatLng(store?.lat, store?.lng)

        var marker = new window.kakao.maps.Marker({
          position: markerPosition,
          image: markerImage,
        })

        marker.setMap(map)

        // 인포윈도우
        var content = `<div class="infoWindow">${store?.name}</div>`
        var customOverlay = new window.kakao.maps.CustomOverlay({
          position: markerPosition,
          content,
          xAnchor: 0.6,
          yAnchor: 0.91,
        })

        window.kakao.maps.event.addListener(marker, 'mouseover', function () {
          customOverlay.setMap(map)
        })

        window.kakao.maps.event.addListener(marker, 'mouseout', function () {
          customOverlay.setMap(null)
        })

        window.kakao.maps.event.addListener(marker, 'click', function () {
          setCurrentStore(store)
        })
      })
    }
  }, [map, setCurrentStore, stores])

  useEffect(() => {
    loadKaKaoMarkers()
  }, [loadKaKaoMarkers])

  return <></>
}
