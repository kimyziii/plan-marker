import { useState } from 'react'

import Map from '@/components/Map'
import Markers from '@/components/Markers'

import StoreBox from '@/components/StoreBox'

export default function Home() {
  const [map, setMap] = useState(null)
  const [currentStore, setCurrentStore] = useState(null)

  const storeDatas = stores['DATA']

  return (
    <>
      <Map setMap={setMap} />
      <StoreBox store={currentStore} setStore={setCurrentStore} />
    </>
  )
}
