import { useRouter } from 'next/router'

export default function LikeListPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <div>
      <h1>찜한 경로 리스트 페이지</h1>
      <h2>ID: {id}</h2>
    </div>
  )
}
