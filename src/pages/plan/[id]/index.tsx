import { mapState } from '@/atom'
import { Map } from '@/components/Map'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useRecoilValue } from 'recoil'

export default function PlanDetailPage() {
  const { id } = useRouter().query
  const map = useRecoilValue(mapState)
  const [isNull, setIsNull] = useState<boolean>(false)

  const { data } = useQuery(
    `plan-${id}`,
    async () => {
      const { data } = await axios(`/api/plan?pId=${id}`)
      if (data.plans.length > 0) {
        const markerData = JSON.parse(data?.plans[0].data)
        setIsNull(false)
        
        return { plan: data.plans[0], markerData: markerData }
      } else {
        setIsNull(true)
        return null
      }

    },
    {
      refetchOnWindowFocus: false,
      enabled: !!id,
    },
  )

  if (!isNull && data && map) {
    getMap()
  }

  function getMap() {
    // 마커 작업
    var imageSrc = '/icons/default-marker.svg'
    var imageSize = new window.kakao.maps.Size(30, 35)
    var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize)

    var bounds = new window.kakao.maps.LatLngBounds()
    data.markerData.forEach((data) => {
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
    })

    map.setBounds(bounds)
    console.log(data.markerData)
  }

  return (
    <div className='w-[90%] mx-auto'>
      {data && (
        <div className='w-full flex flex-col gap-4'>
          {/* 제목, 작성자, 작성일자 */}
          <div className='w-full mx-4 my-5 h-[6vh]'>
            <div className='flex flex-col gap-2'>
              <div className='text-2xl font-bold leading-7 text-gray-900'>
                {data.plan?.title}
              </div>
              <div className='flex flex-row items-center text-sm text-gray-500 gap-4'>
                <div className='flex flex-row items-center gap-2'>
                  <Image
                    src='/icons/user.svg'
                    alt='생성일자'
                    width='18'
                    height='18'
                  />
                  <span>{data.plan?.user.name}</span>
                </div>
                <div className='flex flex-row items-center gap-2'>
                  <Image
                    src='/icons/calendar.svg'
                    alt='생성일자'
                    width='18'
                    height='18'
                  />
                  <span>
                    {new Date(data.plan?.createdAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className='flex gap-4'>
            <div className='w-2/5 overflow-hidden'>
              {/* 지도 */}
              <div className='w-full mx-4 px-4 h-[75vh]' id='map'>
                <Map type='full' />
              </div>
            </div>

            {/* 장소 정보 */}
            <div className='w-3/5'>
              <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mb-3'>
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
                  </tr>
                </thead>
                <tbody>
                  {data.markerData.map((data, index) => (
                    <tr
                      key={data.id}
                      className='bg-white border-b dark:bg-gray-800 dark:border-gray-700'
                    >
                      <th
                        scope='row'
                        className='w-[10%] px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center'
                      >
                        {index + 1}
                      </th>
                      <td className='w-[10%] whitespace-nowrap text-center px-3 py-3'>
                        {data.hour}:{data.minute}
                      </td>
                      <td className='w-[30%] px-2 py-2'>{data.place_name}</td>
                      <td className='w-[50%] px-2 py-2 min-h-12'>
                        {data.memo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {isNull && <><div className='py-20 text-sm flex flex-col justify-center items-center'>
        <span>해당 경로를 찾을 수 없습니다.</span><span> 다시 시도해주세요.</span>
        </div></>}
    </div>
  )
}
