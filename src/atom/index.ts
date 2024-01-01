import { LocationType, StoreType } from '@/interface'
import { atom } from 'recoil'

const DEFAULT_LAT = 37.497625203
const DEFAULT_LNG = 127.03088379
const DEFAULT_ZOOM = 3

export const mapState = atom<any | null>({
  key: 'map',
  default: null,

  // 리코일: 상태 불변성, 변경을 감지하고 렌더링하게 됨.
  // 근데 카카오 맵의 함수는 직접 변경을 하기 때문에 읽기전용도 수정을 할 수 있도록
  dangerouslyAllowMutability: true,
})

export const currentStoreState = atom<StoreType | null>({
  key: 'store',
  default: null,
})

export const locationState = atom<LocationType>({
  key: 'location',
  default: {
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    zoom: DEFAULT_ZOOM,
  },
})

export const placesState = atom<any>({
  key: 'places',
  default: null,
})

export const searchState = atom<string>({
  key: 'search',
  default: '',
})
