import Image from 'next/image'

type PlanType = {
  id: string
  title: string
  data: string
  createdAt: string
  updatedAt: string
  createdById: string
}

export default function PlanListPage() {
  return (
    <div className='w-[85%] flex flex-col place-items-center mx-auto'>
      <div className='w-full mt-10 flex justify-between items-end'>
        <div className='text-2xl text-blue-700 font-bold'>나의 경로</div>
        <div
          className='flex flex-col items-center justify-end gap-1 cursor-pointer'
          onClick={() => {
            // setIsOpen((prev) => !prev)
          }}
        >
          <div className='relative inline-block text-left'>
            <button className='inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
              정렬
              <Image
                src='/icons/bars-arrow-down.svg'
                width='20'
                height='20'
                alt='정렬'
              />
            </button>
          </div>
        </div>
      </div>
      <div className='w-full place-items-center mx-auto mt-10 grid grid-cols-3 gap-4'></div>
    </div>
  )
}
