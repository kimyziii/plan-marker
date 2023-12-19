import { useRouter } from 'next/router'

export default function PlanDetailPage() {
  const router = useRouter()
  const { id } = router.query
  return (
    <div>
      <h1>플랜 상세 페이지: {id}</h1>
    </div>
  )
}
