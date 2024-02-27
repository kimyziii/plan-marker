import { Map as MapComponent } from '@/components/Map'

import Alert from '@mui/material/Alert'
import { Button, Checkbox } from '@mui/material'
import { IoMdRemoveCircle } from 'react-icons/io'
import { TiArrowSortedUp } from 'react-icons/ti'
import { TiArrowSortedDown } from 'react-icons/ti'

import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMid } from '@/redux/slice/authSlice'
import { Checkbox } from '@mui/material'
import { TiArrowSortedUp } from 'react-icons/ti'
import { TiArrowSortedDown } from 'react-icons/ti'
import {
  CLEAR_MARKERS,
  REMOVE_MARKERS,
  selectPendingDatas,
  SORT_PENDING_DATAS,
  UPDATE_PENDING_DATAS,
} from '@/redux/slice/planSlice'

import { useRouter } from 'next/router'

import { planType } from '@/interface'

interface PlanFormProps {
  isEditMode: boolean
  planIsPublic?: boolean
  planTitle?: string
  markerData?: Map<string, any>
  setMarkerData: Dispatch<SetStateAction<any>>
  removeMarkers: (id: string) => void
}

export default function PlanForm({
  markerData,
  setMarkerData,
  isEditMode,
  planIsPublic,
  planTitle,
  removeMarkers,
}: PlanFormProps) {
  const router = useRouter()
  const { id } = router.query

  const mId = useSelector(selectMid)

  const [title, setTitle] = useState<string>('')
  const [isPublic, setIsPublic] = useState<boolean>(true)
  const [isError, setIsError] = useState<boolean>(false)
  const [alert, setAlert] = useState<boolean>(false)
  const [selectOpen, setSelectOpen] = useState<boolean>(false)

  const pendingDatas = useSelector(selectPendingDatas)
  const dispatch = useDispatch()

  /**
   * @description 여행 계획의 제목이 비어있는지 체크
   * @returns boolean
   */
  function checkTitle() {
    if (title.trim().length === 0) {
      setIsError(true)
      window.scrollTo(0, 0)
      return false
    }

    return true
  }

  /**
   * @description 수정 페이지에서 저장 버튼을 눌렀을 때 실행됨
   * 제목이 있는지 체크 후, 테이블 데이터 string으로 변환하고 API 통해서 기존의 여행 계획 업데이트
   * 업데이트에 성공하면 해당 여행 계획 상세 페이지로 이동
   */
  async function handleUpdate() {
    let titleIsChecked = checkTitle()
    if (!titleIsChecked) {
      return
    }

    setIsError(false)
    const data = makeData()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/plans/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          isPublic,
          modifiedAt: new Date(),
          data,
        }),
      },
    )

    if (response.status === 200) {
      router.replace(`/plan/${id}`)
    }
  }

  /**
   * @description 여행 계획 생성 페이지에서 저장 버튼을 눌렀을 때 실행됨
   * 제목 비었는지 확인 후, 테이블 데이터 string으로 변한하고 API 통해서 여행 계획 생성
   * 생성에 성공하면 해당 여행 계획 상세 페이지로 이동
   */
  async function handleSave() {
    let titleIsChecked = checkTitle()
    if (!titleIsChecked) {
      return
    }

    setIsError(false)
    const data = makeData()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/plans`,
      {
        method: 'POST',
        body: JSON.stringify({
          title,
          isPublic,
          createdById: mId,
          createdAt: new Date(),
          modifiedAt: new Date(),
          data,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    const result = await response.json()
    const planId = result.id
    router.replace(`/plan/${planId}`)
  }

  /**
   * @description planType[]을 String으로 변환
   * @returns string
   */
  function makeData() {
    const jsonData = JSON.stringify(pendingDatas)
    return jsonData
  }

  /**
   * @description 시, 분 및 메모 변경시 데이터 업데이트 함수
   */
  function handleInputChange(
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
    id: string,
  ) {
    const { name, value } = event.target

    dispatch(
      UPDATE_PENDING_DATAS({
        name,
        value,
        id,
      }),
    )
  }

  /**
   * @description 여행 계획 공개/비공개 변경 함수
   */
  function handleCheckboxChange() {
    setIsPublic((prev) => !prev)
  }

  /**
   * @description 전체삭제 버튼 클릭시 실행됨
   * 지도에 붙어있는 마커와 오버레이도 삭제
   */
  function clearMarkers() {
    const newMap = new Map(markerData)

    newMap.forEach((value, key) => {
      value.marker.setMap(null)
      value.customOverlay.setMap(null)

      newMap.delete(key)
    })

    setMarkerData(newMap)
  }

  /**
   * @description 여행 계획 순서 변경 (위로)
   * @param idx 순서 변경하고자 하는 인덱스
   * @returns 첫번째 요소일 경우 메세지 띄움
   */
  function handleUp(idx: number) {
    if (idx === 0) {
      setAlert(true)
      setTimeout(() => {
        setAlert(false)
      }, 2000)
      return
    }

    dispatch(SORT_PENDING_DATAS({ idx, type: 'up' }))
  }

  /**
   * @description 여행 계획 순서 변경 (아래로)
   * @param idx 순서 변경하고자 하는 인덱스
   * @returns 마지막 요소일 경우 메세지 띄움
   */
  function handleDown(idx: number) {
    if (idx === pendingDatas.length - 1) {
      setAlert(true)
      setTimeout(() => {
        setAlert(false)
      }, 2000)
      return
    }

    dispatch(SORT_PENDING_DATAS({ idx, type: 'down' }))
  }

  /**
   * @description 여행 계획 요소 중 하나 삭제
   * @param id 여행 계획에서 제외하고자 하는 마커의 id값
   */
  function handleRemove(id: string) {
    removeMarkers(id)
    dispatch(REMOVE_MARKERS(id))
  }

  useEffect(() => {
    if (!markerData?.size) {
      dispatch(CLEAR_MARKERS())
    }
  }, [markerData])

  useEffect(() => {
    if (isEditMode) {
      setTitle(planTitle)
      setIsPublic(planIsPublic)
    }
  }, [planTitle, planIsPublic])

  return (
    <div>
      <div className='flex justify-between my-3 items-center'>
        <div className='flex flex-col w-[50%] justify-center'>
          <input
            id='title'
            name='title'
            className={`w-full bg-gray-100 rounded-md h-8 px-3 py-4 font-normal text-base ${
              isError ? 'border-2 border-red-600' : ''
            }`}
            placeholder='여행 경로 이름을 입력해 주세요.'
            onChange={(e) => {
              setTitle(e.target.value)
            }}
            value={title || ''}
          />
          {isError && (
            <span className='text-red-500 text-xs pt-2 pl-2'>
              여행 경로 이름은 필수값입니다.
            </span>
          )}
        </div>
        <button
          onClick={clearMarkers}
          className='text-sm bg-red-100 px-2 py-1 border border-red-300 rounded-md text-red-600 font-semibold h-[30px]'
        >
          전체삭제
        </button>
      </div>
      <MapComponent type='half' />

      {alert && (
        <div className='mt-3'>
          <Alert severity='warning'>순서를 변경할 수 없습니다.</Alert>
        </div>
      )}

      {pendingDatas?.length > 0 && (
        <div className='overflow-x-auto my-3'>
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
                <th scope='col' className='px-3 py-3 text-center'>
                  변경
                </th>
                <th scope='col' className='px-3 py-3 text-center'>
                  삭제
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingDatas.map((data, index) => (
                <tr
                  key={data?.id}
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
                    className='px-2 py-3 whitespace-nowrap dark:text-white w-[15%] text-center'
                  >
                    <input
                      name='hour'
                      onChange={(e) => handleInputChange(e, data?.id)}
                      className='w-[40%] mr-1 text-center bg-blue-100 rounded-md py-[6px]'
                      placeholder='시'
                      value={data?.hour}
                    ></input>
                    <input
                      name='minute'
                      onChange={(e) => handleInputChange(e, data?.id)}
                      className='w-[40%] text-center bg-blue-100 rounded-md py-[6px]'
                      placeholder='분'
                      value={data?.minute}
                    ></input>
                  </td>
                  <td className='px-2 py-2 w-[15%]'>{data?.place_name}</td>
                  <td className='px-2 py-2  w-[43%] min-h-12'>
                    <textarea
                      name='memo'
                      onChange={(e) => handleInputChange(e, data?.id)}
                      className='bg-blue-100 rounded-md w-full h-fit px-2 py-2 resize-none'
                      value={data?.memo}
                    />
                  </td>
                  <td className='px-2 py-2 w-[7%]'>
                    <div className='flex flex-col justify-center items-center gap-1'>
                      <div
                        className='border p-1 rounded-md cursor-pointer'
                        onClick={() => handleUp(index)}
                      >
                        <TiArrowSortedUp />
                      </div>
                      <div
                        className='border p-1 rounded-md cursor-pointer'
                        onClick={() => handleDown(index)}
                      >
                        <TiArrowSortedDown />
                      </div>
                    </div>
                  </td>
                  <td
                    className='px-2 py-4 w-[7%]'
                    onClick={() => handleRemove(data.id)}
                  >
                    <div className='flex justify-center'>
                      <IoMdRemoveCircle color='red' size='20' />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className='flex justify-between items-center mb-10'>
            <div className='flex items-center'>
              <Checkbox
                id='isPublic'
                sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                onChange={handleCheckboxChange}
                checked={isPublic ? false : true}
              />
              <label className='text-sm' htmlFor='isPublic'>
                나만 볼 수 있도록 하려면 체크해 주세요.
              </label>
            </div>
            <button
              onClick={isEditMode ? handleUpdate : handleSave}
              className='border border-blue-300 rounded-md px-2 py-1 bg-blue-100 font-semibold text-blue-600 text-base h-7 flex items-center'
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
