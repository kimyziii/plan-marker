import { placesState } from '@/atom'
import { searchResultType } from '@/interface'
import { useState } from 'react'
import { useRecoilValue } from 'recoil'

import { FaSearch } from 'react-icons/fa'

export default function SearchSide({ handleSelect, removeMarkers }) {
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [isNull, setIsNull] = useState<boolean>(true)
  const [resultData, setResultData] = useState<searchResultType[]>([])

  const places = useRecoilValue(placesState)

  function handleSearch() {
    var ps = places
    ps.keywordSearch(searchKeyword, placesSearchCB, { size: 5 })
  }

  function placesSearchCB(data: searchResultType[], status: string) {
    if (status === window.kakao.maps.services.Status.OK) {
      if (data.length === 0) {
        setIsNull(true)
      } else {
        setResultData(data)
        setIsNull(false)
      }
    }
  }

  return (
    <div className='flex flex-col gap-2'>
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

      <div>
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
                    className='border rounded-md px-2 py-1 bg-red-100 border-red-300  text-red-600 font-semibold text-xs'
                    onClick={() => {
                      removeMarkers(data.id)
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
  )
}
