/*global kakao*/
import Script from 'next/script'
import { useEffect } from 'react'

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
  useEffect(() => {
    setRootHeight()
    window.addEventListener('resize', setRootHeight)

    // 컴포넌트 언마운트 될 때 제거
    return () => {
      window.removeEventListener('resize', setRootHeight)
    }
  }, [])

  function loadKakaoMap() {
    window.kakao.maps.load(function () {
      const container = document.getElementById('map')
      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
      }
      new window.kakao.maps.Map(container, options)
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
