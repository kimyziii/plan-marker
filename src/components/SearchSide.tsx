import { useState } from 'react'
import { placesState } from '@/atom'
import { searchResultType } from '@/interface'
import { useRecoilValue } from 'recoil'

import { FaSearch } from 'react-icons/fa'

interface SearchSideProps {
  handleSelect: (data: searchResultType) => void
  removeMarkers: (id: string) => void
}

export default function SearchSide({
  handleSelect,
  removeMarkers,
}: SearchSideProps) {
  const [isNull, setIsNull] = useState<boolean>(true)
  const [noData, setNoData] = useState<boolean>(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [resultData, setResultData] = useState<searchResultType[]>(null)

  const places = useRecoilValue(placesState)

  /**
   * 입력 받은 키워드로 장소 검색
   */
  function handleSearch() {
    var ps = places
    if (!searchKeyword) {
      setResultData(null)
      setIsNull(true)
    }
    ps.keywordSearch(searchKeyword, placesSearchCB, { size: 5 })
  }

  /**
   * 검색 상태와 결과를 리턴해주는 callback 함수
   * @param data 검색 결과를 담은 리스트
   * @param status 검색 상태
   */
  function placesSearchCB(data: searchResultType[], status: string) {
    if (status === window.kakao.maps.services.Status.OK) {
      if (data) {
        setResultData(data)
        setIsNull(false)
        setNoData(false)
      }
    } else {
      setResultData(null)
      setIsNull(true)
      setNoData(true)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-between gap-2 w-full h-[35px]'>
        <input
          className='w-full border px-2 place-items-center rounded-md text-sm'
          type='text'
          placeholder='검색어를 입력해 주세요'
          onChange={(e) => {
            setSearchKeyword(e.target.value)
          }}
          onKeyUp={(e) => {
            if (e?.key == 'Enter') {
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
                      <div className='text-gray-500 lg:block md:hidden'>
                        도로명주소
                      </div>
                      <div className='text-gray-500 lg:hidden md:block w-[18%]'>
                        도로명
                      </div>
                      <div className='md:w-[82%]'>{data.road_address_name}</div>
                    </div>
                  )}
                  {data.address_name && (
                    <div className='flex flex-row gap-2'>
                      <div className='text-gray-500 lg:block md:hidden'>
                        지번주소
                      </div>
                      <div className='text-gray-500 lg:hidden md:block w-[18%]'>
                        지번
                      </div>
                      <div className='md:w-[82%]'>{data?.address_name}</div>
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
        {!resultData && isNull && !noData && (
          <div className='text-sm text-gray-400 border rounded-md h-[40vh] flex justify-center pt-10'>
            검색결과가 표시됩니다.
          </div>
        )}
        {isNull && noData && (
          <div className='text-sm text-gray-400 border rounded-md h-[40vh] flex justify-center text-center pt-10'>
            검색 결과가 없습니다. <br />
            검색어를 확인해 주세요.
          </div>
        )}
      </div>
    </div>
  )
}
