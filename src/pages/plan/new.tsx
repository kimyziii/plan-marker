import { useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { mapState } from '@/atom'

import SearchSide from '@/components/SearchSide'
import PlanForm from '@/components/PlanForm'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsLoggedIn } from '@/redux/slice/authSlice'
import { useRouter } from 'next/router'
import { Confirm } from 'notiflix'
import {
  ADD_MARKER,
  CLEAR_MARKERS,
  selectMapDatas,
} from '@/redux/slice/planSlice'

import { IoCloseOutline } from 'react-icons/io5'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'

import { searchResultType } from '@/interface'
import Image from 'next/image'

export default function PlanNewPage() {
  const router = useRouter()
  const map = useRecoilValue(mapState)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useDispatch()

  const [selected, setSelected] = useState<searchResultType | null>(null)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [markerData, setMarkerData] = useState(new Map<string, any>(null))

  async function handleOpenDetail(data) {
    setOpenModal(true)
    setSelected(data)

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${data.address_name}&language=ko&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`,
    )
  }

  async function getPhotos(placeId: string) {
    const placesResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`,
    )
    const placeResult = await placesResponse.json()
    console.log(placeResult)
  }

  function handleSelect(data) {
    if (markerData.has(data.id)) {
      data = {
        ...data,
        id: `${data.id}${new Date()}`,
      }
    }

    dispatch(ADD_MARKER({ data, map }))
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
    } else {
      dispatch(CLEAR_MARKERS({ map }))
    }
  }, [])

  return (
    <div>
      {openModal && (
        <div className='absolute w-full flex justify-center'>
          <div
            onClick={() => setOpenModal(false)}
            className='absolute top-0 left-0 w-full h-[100vh] bg-black opacity-30 z-20'
          />
          <div className='absolute w-[500px] h-[55vh] mt-20 transform bg-white z-30 rounded-lg'>
            <div
              onClick={() => setOpenModal(false)}
              className='absolute right-0 px-4 py-4'
            >
              <IoCloseOutline size='20' />
            </div>
            {selected && (
              <div className='px-5 py-5'>
                <div>{selected.place_name}</div>
                <div className='w-full min-h-[250px]'>
                  <Image src='/' width={100} height={250} alt='' />
                </div>
                <div className='flex flex-row gap-2 justify-start items-center'>
                  <FaMapMarkerAlt />
                  {selected.road_address_name}
                </div>
                <div className='flex flex-row gap-2 justify-start items-center'>
                  <FaPhoneAlt />
                  {selected.phone}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className='md:flex w-full mobile:hidden'>
        <div className='w-1/3 p-4 rounded-md flex flex-col gap-2 z-10'>
          <div className='mx-2 text-xl text-blue-800 font-semibold'>
            장소 검색하기
          </div>
          <SearchSide
            handleDetailOpen={handleOpenDetail}
            handleSelect={handleSelect}
          />
        </div>

        <div className='w-2/3 mr-4'>
          <PlanForm isEditMode={false} />
        </div>
      </div>
      <div className='flex justify-center mt-16 md:hidden lg:hidden'>
        경로 생성은 웹에서 가능합니다.
      </div>
    </div>
  )
}
