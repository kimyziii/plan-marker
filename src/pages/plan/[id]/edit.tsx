import { useRouter } from 'next/router'

export default function PlanEditPage() {
  const router = useRouter()
  const { id } = router.query
  return (
    <div>
      <h1>플랜 수정 페이지: {id}</h1>
    </div>
  )
}
