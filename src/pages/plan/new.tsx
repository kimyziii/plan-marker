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

  const [selected, setSelected] = useState<searchResultType>(null)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [markerData, setMarkerData] = useState(new Map<string, any>(null))

  async function handleOpenDetail(data) {
    setOpenModal(true)
    setSelected(data)

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${data.address_name}&language=ko&key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`,
    )
    const result = await response.json()
    console.log(result)
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
