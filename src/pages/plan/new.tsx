import Map from '@/components/Map'
import { AiOutlineSearch } from 'react-icons/ai'
import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { mapState, placesState } from '@/atom'
import { paginationType, searchResultType } from '@/interface'

export default function PlanNewPage() {
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const places = useRecoilValue(placesState)
  const map = useRecoilValue(mapState)

  const [isNull, setIsNull] = useState<boolean>(true)
  const [resultData, setResultData] = useState<searchResultType[]>([])
  const [paginationInstance, setPaginationInstance] = useState<any>(null)

  function placesSearchCB(
    data: searchResultType[],
    status: string,
    pagination: paginationType,
  ) {
    if (status === window.kakao.maps.services.Status.OK) {
      console.log(data)

      if (data.length === 0) {
        setIsNull(true)
      } else {
        setResultData(data)
        setIsNull(false)

        // 지도 범위 재설정
        var bounds = new window.kakao.maps.LatLngBounds()

        for (var i = 0; i < data.length; i++) {
          displayMarker(data[i])
          bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x))
        }

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        if (map) map?.setBounds(bounds)
      }

      console.log(pagination)
      setPaginationInstance(pagination)
    }
  }

  function displayMarker(place: searchResultType) {
    // 마커를 생성하고 지도에 표시합니다
    var marker = new window.kakao.maps.Marker({
      map: map,
      position: new window.kakao.maps.LatLng(place.y, place.x),
    })

    var infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 })

    // 마커에 클릭이벤트를 등록합니다
    window.kakao.maps.event.addListener(marker, 'click', function () {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      infowindow.setContent(
        '<div style="padding:5px;font-size:12px;">' +
          place.place_name +
          '</div>',
      )
      infowindow.open(map, marker)
    })
  }

  return (
    <div className='flex lg:flex-row'>
      <div className='lg: w-2/5 m-4 rounded-md flex flex-col gap-2 '>
        <div className='flex justify-between w-full h-[35px]'>
          <input
            className='w-full border px-2 place-items-center'
            type='text'
            placeholder='검색어를 입력해 주세요'
            onChange={(e) => {
              setSearchKeyword(e.target.value)
            }}
          />
          <div
            role='presentation'
            className='flex w-[40px] justify-center align-middle'
            onClick={() => {
              var ps = places
              ps.keywordSearch(searchKeyword, placesSearchCB)
            }}
          >
            <AiOutlineSearch />
          </div>
        </div>
        {resultData &&
          !isNull &&
          resultData.map((data) => (
            <div key={data.id} className='text-sm'>
              <div>{data?.place_name}</div>
            </div>
          ))}

        <div className='flex items-center justify-center gap-2'>
          {paginationInstance.current !== 1 && (
            <button
              id='prevBtn'
              className='p-4'
              onClick={() => paginationInstance.prevPage()}
            >
              ←
            </button>
          )}
          {paginationInstance.current}
          {paginationInstance.current !== paginationInstance.last && (
            <button
              id='nextBtn'
              className='p-4'
              onClick={() => paginationInstance.nextPage()}
            >
              →
            </button>
          )}
        </div>
      </div>
      <div className='lg: w-3/5 h-1/2'>
        <Map />
      </div>
    </div>
  )
}
