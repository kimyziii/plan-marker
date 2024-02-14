import { Map as MapComponent } from '@/components/Map'
import { IoMdRemoveCircle } from 'react-icons/io'

import { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Alert from '@mui/material/Alert'
import { useSelector } from 'react-redux'
import { selectMid } from '@/redux/slice/authSlice'
import { Checkbox } from '@mui/material'
import { TiArrowSortedUp } from 'react-icons/ti'
import { TiArrowSortedDown } from 'react-icons/ti'

interface PlanFormProps {
  markerData?: Map<string, any>
  pendingDatas: any[]
  setMarkerData: Dispatch<SetStateAction<any>>
  setPendingDatas: Dispatch<SetStateAction<any[]>>
  removeMarkers: (id: string) => void
}

export default function PlanForm({
  markerData,
  setMarkerData,
  pendingDatas,
  setPendingDatas,
  removeMarkers,
}: PlanFormProps) {
  const router = useRouter()
  const mId = useSelector(selectMid)
  const [isPending, setIsPending] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)
  const [alert, setAlert] = useState<boolean>(false)
  const [isPublic, setIsPublic] = useState<boolean>(true)

  async function handleSave() {
    // 제목이 입력되지 않은 경우
    if (title.trim().length === 0) {
      setIsError(true)

      window.scrollTo(0, 0)
      return
    }

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

  function makeData() {
    const jsonData = JSON.stringify(pendingDatas)
    return jsonData
  }

  function handleInputChange(event, id) {
    const { name, value } = event.target
    const newData = pendingDatas

    if (name === 'title') {
      if (value.length > 0) setIsError(false)
      setTitle(value)
    }
    if (name === 'hour' || name === 'minute' || name === 'memo') {
      newData.forEach((data) => {
        if (data?.id === id && name === 'hour') {
          data.hour = value
        } else if (data?.id === id && name === 'minute') {
          data.minute = value
        } else if (data?.id === id && name === 'memo') {
          data.memo = value
        }
      })
    }

    setPendingDatas(newData)
  }

  function handleCheckboxChange() {
    setIsPublic((prev) => !prev)
  }

  function clearMarkers() {
    const newMap = new Map(markerData)

    newMap.forEach((value, key) => {
      value.marker.setMap(null)
      value.customOverlay.setMap(null)

      newMap.delete(key)
    })

    setMarkerData(newMap)
    setIsPending(false)
    setPendingDatas([])
  }

  function handleUp(idx: number) {
    if (idx === 0) {
      setAlert(true)
      setTimeout(() => {
        setAlert(false)
      }, 2000)
      return
    }

    let arr = [...pendingDatas]

    let temp = arr[idx]
    arr[idx] = arr[idx - 1]
    arr[idx - 1] = temp

    setPendingDatas(arr)
  }

  function handleDown(idx: number) {
    if (idx === pendingDatas.length - 1) {
      setAlert(true)
      setTimeout(() => {
        setAlert(false)
      }, 2000)
      return
    }

    let arr = [...pendingDatas]

    let temp = arr[idx]
    arr[idx] = arr[idx + 1]
    arr[idx + 1] = temp

    setPendingDatas(arr)
  }

  useEffect(() => {
    if (markerData.size > 0) setIsPending(true)
    else setIsPending(false)
  }, [markerData.size])

  useEffect(() => {}, [])

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
              handleInputChange(e, null)
            }}
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

      {isPending && (
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
                    ></input>
                    <input
                      name='minute'
                      onChange={(e) => handleInputChange(e, data?.id)}
                      className='w-[40%] text-center bg-blue-100 rounded-md py-[6px]'
                      placeholder='분'
                    ></input>
                  </td>
                  <td className='px-2 py-2 w-[15%]'>{data?.place_name}</td>
                  <td className='px-2 py-2  w-[43%] min-h-12'>
                    <textarea
                      name='memo'
                      onChange={(e) => handleInputChange(e, data?.id)}
                      className='bg-blue-100 rounded-md w-full h-fit px-2 py-2 resize-none'
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
                    onClick={() => {
                      removeMarkers(data?.id)
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
          <div className='flex justify-between items-center mb-10'>
            <div className='flex items-center'>
              <Checkbox
                id='isPublic'
                sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                onChange={handleCheckboxChange}
              />
              <label className='text-sm' htmlFor='isPublic'>
                나만 볼 수 있도록 하려면 체크해 주세요.
              </label>
            </div>
            <button
              onClick={handleSave}
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
