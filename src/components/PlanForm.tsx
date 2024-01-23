import { Map as MapComponent } from '@/components/Map'
import { IoMdRemoveCircle } from 'react-icons/io'

import { Dispatch, SetStateAction } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Alert from '@mui/material/Alert'

type MarkerData = {}

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
  const { data: session } = useSession()
  const [isPending, setIsPending] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)
  const [alert, setAlert] = useState<boolean>(false)

  async function handleSave() {
    // 제목이 입력되지 않은 경우
    if (title.trim().length === 0) {
      setIsError(true)

      window.scrollTo(0, 0)
      return
    }

    const userId = await getUserId()
    const data = makeData()

    const createRes = await axios.post('/api/plan', {
      title,
      createdById: userId,
      data,
    })

    const recordId = createRes.data?.result.id
    router.replace(`/plan/${recordId}`)
  }

  function makeData() {
    const jsonData = JSON.stringify(pendingDatas)
    return jsonData
  }

  async function getUserId() {
    const userEmail = session.user.email
    const userRes = await axios(`/api/user?email=${userEmail}`)
    const userId = userRes.data?.result.id
    return userId
  }

  function handleInputChange(event, id) {
    const { name, value } = event.target

    if (name === 'title') {
      if (value.length > 0) setIsError(false)
      setTitle(value)
    }
    if (name === 'hour' || name === 'minute' || name === 'memo') {
      const newData = pendingDatas
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

    setPendingDatas(pendingDatas)
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
                        <Image
                          src='/icons/arrow-up.svg'
                          width='20'
                          height='20'
                          alt='순서 올리기'
                        />
                      </div>
                      <div
                        className='border p-1 rounded-md cursor-pointer'
                        onClick={() => handleDown(index)}
                      >
                        <Image
                          src='/icons/arrow-down.svg'
                          width='20'
                          height='20'
                          alt='순서 내리기'
                        />
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
          <div className='flex justify-end'>
            <button
              onClick={handleSave}
              className='border border-blue-300 rounded-md px-2 py-1 bg-blue-100 font-semibold text-blue-600 text-xs'
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
