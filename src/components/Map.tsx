/*global kakao*/
import Script from 'next/script'
import { useEffect, Dispatch, SetStateAction } from 'react'

declare global {
  interface Window {
    kakao: any
  }
}

// 강남 좌표
const DEFAULT_LAT = 37.497625203
const DEFAULT_LNG = 127.03088379

interface MapProps {
  setMap: Dispatch<SetStateAction<any>>
}

/**
 * navbar의 높이만큼 뺀 높이로 지도 높이 설정
 */
const setRootHeight = () => {
  const root = document.documentElement
  root.style.setProperty('--window-height', `${window.innerHeight - 50}px`)
}

export default function Map({ setMap }: MapProps) {
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
        center: new window.kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LNG),
        level: 3,
      }
      const map = new window.kakao.maps.Map(container, options)

      setMap(map)
    })
  }

  return (
    <>
      <Script
        strategy='afterInteractive'
        type='text/javascript'
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_CLIENT}&autoload=false`}
        onReady={loadKakaoMap}
      />
      <div id='map' className='w-full map'></div>
    </>
  )
}
