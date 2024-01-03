import { Map as MapComponent } from '@/components/Map'
import { FaSearch } from 'react-icons/fa'
import { IoMdRemoveCircle } from 'react-icons/io'

import { useState } from 'react'
import { useRecoilValue } from 'recoil'
import { mapState, placesState } from '@/atom'
import { searchResultType } from '@/interface'
import { useCallback } from 'react'
import { useEffect } from 'react'

const DEFAULT_LAT = 37.5759689663327
const DEFAULT_LNG = 126.976861018866
const DEFAULT_ZOOM = 3

export default function PlanNewPage() {
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const places = useRecoilValue(placesState)
  const map = useRecoilValue(mapState)

  const [isNull, setIsNull] = useState<boolean>(true)
  const [resultData, setResultData] = useState<searchResultType[]>([])
  const [isPending, setIsPending] = useState<boolean>(false)
  const [pendingDatas, setPendingDatas] = useState<any[]>([])

  const [markerData, setMarkerData] = useState(new Map<string, any>(null))

  function handleSearch() {
    var ps = places
    ps.keywordSearch(searchKeyword, placesSearchCB, { size: 5 })
  }

  function placesSearchCB(data: searchResultType[], status: string) {
    if (status === window.kakao.maps.services.Status.OK) {
      if (data.length === 0) {
        setIsNull(true)
      }

      // 데이터 있는 경우 지도에 마커 표시
      else {
        setResultData(data)
        setIsNull(false)
      }
    }
  }

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
      (prev) => new Map(prev.set(data.id, { marker, data, customOverlay })),
    )
    setPendingDatas((prevState) => [...prevState, data])
    showMarkers(map, marker)

    if (isPending === false) setIsPending((prev) => !prev)
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
  function removeMarkers(data) {
    if (!markerData.has(data.id)) return

    const newMap = new Map(markerData)

    const marker = markerData.get(data.id)?.marker
    marker.setMap(null)
    const overlay = markerData.get(data.id)?.customOverlay
    overlay.setMap(null)

    newMap.delete(data.id)
    if (newMap.size === 0) setIsPending(false)

    setMarkerData(newMap)

    const updatedItems = pendingDatas.filter((item) => item.id !== data.id)
    setPendingDatas(updatedItems)
  }

  /**
   * 전체 마커 및 마커 데이터 삭제함
   */
  function clearMarkers() {
    const newMap = new Map(markerData)

    newMap.forEach((value, key) => {
      value.marker.setMap(null)
      value.customOverlay.setMap(null)

      newMap.delete(key)
    })

    setMarkerData(newMap)
    setPendingDatas([])
    setIsPending(false)
  }

  useEffect(() => {
    handleBounds()
  }, [handleBounds, markerData])

  return (
    <div className='flex w-full'>
      <div className='w-1/3 p-4 rounded-md flex flex-col gap-2'>
        <div className='flex justify-between gap-2 w-full h-[35px]'>
          <input
            className='w-full border px-2 place-items-center rounded-md'
            type='text'
            placeholder='검색어를 입력해 주세요'
            onChange={(e) => {
              setSearchKeyword(e.target.value)
            }}
            onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
              if (event?.key == 'Enter') {
                handleSearch()
              }
            }}
          />
          <div
            role='presentation'
            className='flex w-[40px] justify-center items-center bg-blue-800 rounded-md'
            onClick={() => handleSearch()}
          >
            <FaSearch size='16' color='white' stroke='100' />
          </div>
        </div>

        <div className=''>
          {resultData &&
            !isNull &&
            resultData.map((data) => (
              <div key={data.id} className='flex flex-col w-full'>
                <div className='mb-3 border px-3 py-2 rounded-md flex flex-col gap-1'>
                  <div className='flex justify-between'>
                    <div className='font-semibold text-base'>
                      {data.place_name}
                    </div>
                    <div className='text-gray-500 text-xs'>
                      {data?.category_name?.split('>')[1]}
                    </div>
                  </div>

                  <div className='w-full flex flex-col text-sm'>
                    {data.road_address_name && (
                      <div className='flex flex-row gap-2'>
                        <div className='text-gray-500'>도로명주소</div>
                        <div>{data.road_address_name}</div>
                      </div>
                    )}
                    {data.address_name && (
                      <div className='flex flex-row gap-2'>
                        <div className='text-gray-500'>지번주소</div>
                        <div>{data?.address_name}</div>
                      </div>
                    )}
                  </div>
                  <div className='flex gap-2 justify-end text-sm mt-1'>
                    <button
                      className='border border-blue-300 rounded-md px-2 py-1 bg-blue-100 font-semibold text-blue-600 text-xs'
                      onClick={() => {
                        handleSelect(data)
                      }}
                    >
                      추가
                    </button>
                    <button
                      className='border rounded-md px-2 py-1 bg-red-100
                      border border-red-300 rounded-md text-red-600 font-semibold text-xs'
                      onClick={() => {
                        removeMarkers(data)
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className='w-2/3 mr-4'>
        <>
          <div className='flex justify-between my-3'>
            <input
              className='w-[50%] bg-gray-100 rounded-md h-8 px-3 py-4 font-semibold text-base'
              placeholder='제목을 입력해 주세요.'
            />

            <button
              onClick={clearMarkers}
              className='text-xs bg-red-100 px-2 py-1 border border-red-300 rounded-md text-red-600 font-semibold'
            >
              전체삭제
            </button>
          </div>
          <MapComponent type='half' />
          {isPending && (
            <div className='relative overflow-x-auto my-3'>
              <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
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
                    <th scope='col' className='px-3 py-3 text-center'>
                      삭제
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDatas.map((data, index) => (
                    <tr
                      key={data.id}
                      className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'
                    >
                      <th
                        scope='row'
                        className='px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white w-[3%] text-center'
                      >
                        {index + 1}
                      </th>
                      <td
                        scope='row'
                        className='px-2 py-3 whitespace-nowrap dark:text-white w-[10%] text-center'
                      >
                        <input
                          className='w-[40%] mr-1 text-center bg-blue-100 rounded-md py-[6px]'
                          placeholder='시'
                        ></input>
                        <input
                          className='w-[40%] text-center bg-blue-100 rounded-md py-[6px]'
                          placeholder='분'
                        ></input>
                      </td>
                      <td className='px-2 py-2 w-[15%]'>{data.place_name}</td>
                      <td className='px-2 py-2  w-[50%] min-h-12'>
                        <textarea className='bg-blue-100 rounded-md w-full h-fit px-2 py-2 resize-none' />
                      </td>
                      <td
                        className='px-2 py-4 w-[5%]'
                        onClick={() => {
                          removeMarkers(data)
                        }}
                      >
                        <div className='flex justify-center'>
                          <IoMdRemoveCircle color='red' size='20' />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      </div>
    </div>
  )
}
