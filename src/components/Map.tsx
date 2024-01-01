/*global kakao*/
import Script from 'next/script'
import { useEffect } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { locationState, mapState, placesState } from '@/atom'

declare global {
  interface Window {
    kakao: any
  }
}

/**
 * navbar의 높이만큼 뺀 높이로 지도 높이 설정
 */
const setRootHeight = () => {
  const root = document.documentElement
  root.style.setProperty('--window-height', `${window.innerHeight - 50}px`)
}

export default function Map() {
  const setMap = useSetRecoilState(mapState)
  const location = useRecoilValue(locationState)
  const setPlaces = useSetRecoilState(placesState)

  useEffect(() => {
    setRootHeight()
    window.addEventListener('resize', setRootHeight)

    // 컴포넌트 언마운트 될 때 제거
    return () => {
      window.removeEventListener('resize', setRootHeight)
    }
  }, [])

  function loadKakaoMap() {
    window.kakao.maps.load(() => {
      const container = document.getElementById('map')
      const options = {
        center: new window.kakao.maps.LatLng(location?.lat, location?.lng),
        level: location.zoom,
      }
      const map = new window.kakao.maps.Map(container, options)
      var ps = new window.kakao.maps.services.Places()
      if (ps) {
        setPlaces(ps)
      }
      setMap(map)
    })
  }

  return (
    <>
      <Script
        strategy='afterInteractive'
        type='text/javascript'
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT}&autoload=false&libraries=services,clusterer`}
        onReady={loadKakaoMap}
      />
      <div className='w-full'>
        <div id='map' className='map'></div>
      </div>
    </>
  )
}
