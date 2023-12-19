import Link from '../../node_modules/next/link'

export default function Home() {
  return (
    <>
      <div>
        <div>
          <Link href='/plan/new'>경로 생성 페이지</Link>
        </div>
        <div>
          <Link href='/plan/list'>경로 리스트 페이지</Link>
        </div>
        <div>
          <Link href='/plan/1'>경로 상세 페이지</Link>
        </div>
        <div>
          <Link href='/plan/1/edit'>경로 수정 페이지</Link>
        </div>
        <div>
          <Link href='/login'>로그인</Link>
        </div>
        <div>
          <Link href='/user/1'>마이페이지</Link>
        </div>
        <div>
          <Link href='/user/1/likes'>찜한 경로</Link>
        </div>

        <div>
          <h2>경로 리스트 컴포넌트</h2>
        </div>
      </div>
    </>
  )
}
