import { mapState } from '@/atom'
import { Map } from '@/components/Map'
import { selectAuth, selectMid } from '@/redux/slice/authSlice'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Confirm, Notify } from 'notiflix'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRecoilValue } from 'recoil'

export default function PlanDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const map = useRecoilValue(mapState)
  const auth = useSelector(selectAuth)
  const mid = useSelector(selectMid)

  const [data, setData] = useState(null)
  const [isNull, setIsNull] = useState<boolean>(false)

  async function getData() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/plan/${id}`,
      {
        method: 'GET',
        credentials: 'include',
      },
    )
    const data = await response.json()
    if (data._id) {
      const markerData = JSON.parse(data.data)
      setIsNull(false)
      setData({ plan: data, markerData })
    } else {
      setIsNull(true)
    }
  }

  if (!isNull && data && map) {
    getMap()
  }

  function handleEditPlan() {
    router.push(`/plan/edit/${id}`)
  }
  function handleRemovePlan() {
    Confirm.show(
      '계획 삭제하기',
      '해당 계획을 삭제하시겠습니까?',
      '삭제',
      '취소',
      async () => {
        const result = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/plan/${id}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        if (result.status === 200) {
          Notify.success(`삭제 완료!`, {
            clickToClose: true,
          })
          router.push('/')
        }
      },
      () => {},
      {
        titleColor: 'black',
        okButtonBackground: '#dc2626',
        okButtonColor: 'white',
        borderRadius: '8px',
      },
    )
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
  }

  useEffect(() => {
    getData()
  }, [id])

  useEffect(() => {
    if (!auth.isLoggedIn) {
      router.push('/login')
    } else {
      getData()
    }
  }, [auth])

  return (
    <div className='w-[90%] mx-auto'>
      {data && (
        <div className='w-full flex flex-col gap-4'>
          {/* 제목, 작성자, 작성일자 */}
          <div className='w-full flex flex-row items-center justify-between'>
            <div className='w-full mt-4'>
              <div className='flex flex-col gap-2'>
                <div className='text-2xl font-bold leading-7 text-gray-900'>
                  {data.plan?.title}
                </div>
                <div className='flex flex-row mobile:flex-col items-center mobile:items-start text-sm text-gray-500 gap-4 mobile:gap-1'>
                  <div className='flex flex-row items-center gap-2'>
                    <Image
                      src='/icons/user.svg'
                      alt='생성자'
                      width='18'
                      height='18'
                    />
                    <span>{data.plan?.createdByName}</span>
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
            <div className='w-[20%] flex flex-row justify-end gap-2'>
              {mid === data.plan?.createdById && (
                <>
                  <button
                    className='text-sm bg-amber-100 px-2 py-1 border
                    border-amber-300 rounded-md text-amber-600 font-semibold
                    h-[30px]'
                    onClick={handleEditPlan}
                  >
                    수정
                  </button>
                  <button
                    className='text-sm bg-red-100 px-2 py-1 border border-red-300 rounded-md text-red-600 font-semibold h-[30px]'
                    onClick={handleRemovePlan}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
          <div className='flex gap-4 flex-col md:flex-row lg:flex-row'>
            <div className='xl:w-2/5 lg:w-2/5 overflow-hidden w-full'>
              {/* 지도 */}
              <div className='w-full h-[75vh]' id='map'>
                <Map type='full' />
              </div>
            </div>

            {/* 장소 정보 */}
            <div className='xl:w-3/5 lg:w-3/5 w-full'>
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
      {isNull && (
        <>
          <div className='py-20 text-sm flex flex-col justify-center items-center'>
            <span>해당 경로를 찾을 수 없습니다.</span>
            <span> 다시 시도해주세요.</span>
          </div>
        </>
      )}
    </div>
  )
}
