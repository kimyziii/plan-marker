import PlanForm from "@/components/PlanForm";
import SearchSide from "@/components/SearchSide";
import axios from "axios";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

export default function PlanEditPage() {
    const { id } = useRouter().query

    const { data } = useQuery(
        `plan-edit-${id}`,
        async () => {
          const { data } = await axios(`/api/plan?pId=${id}`)
          if (data.plans.length > 0) {
            const markerData = JSON.parse(data?.plans[0].data)
            console.log(markerData)
            // setIsNull(false)
            
            return { plan: data.plans[0], markerData: markerData }
          } else {
            // setIsNull(true)
            return null
          }
    
        },
        {
          refetchOnWindowFocus: false,
          enabled: !!id,
        },
      )

    function handleSelect() {
        //
    }

    function removeMarkers() {
        //
    }

    const markerData = []


    return (<div className='flex w-full'>
                <div className='w-1/3 p-4 rounded-md flex flex-col gap-2'>
                    <div className='mx-2 text-xl text-blue-800 font-semibold'>
                    장소 검색하기
                    </div>
                    <SearchSide handleSelect={handleSelect} removeMarkers={removeMarkers} />
                </div>

                <div className='w-2/3 mr-4'>
                    <PlanForm
                    markerData={markerData}
                    removeMarkers={removeMarkers}
                    pendingDatas={markerData}
                    />
                </div>
            </div>)
}