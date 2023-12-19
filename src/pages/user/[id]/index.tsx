import { useRouter } from 'next/router'

export default function MyPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <div>
      <h1>마이페이지</h1>
      <h2>ID: {id}</h2>
    </div>
  )
}
