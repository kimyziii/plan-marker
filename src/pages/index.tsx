import PlanList from '@/components/PlanList'
import { InferGetServerSidePropsType } from 'next'

export const getServerSideProps = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  const result = await response.json()
  const data = result.plans
  if (!data) return { props: { status: 400 } }
  return { props: { status: 200, data } }
}

export default function Home({
  status,
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (status === 200) return <PlanList data={data} />
  else return <div>로딩에 실패했습니다. 다시 시도해주세요.</div>
}
