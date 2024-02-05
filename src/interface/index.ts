export interface UserType {
  email: string
  providerId: string
  uid: string
}

export interface StoreType {
  id: number
  phone?: string | null
  address?: string | null
  lat?: string | null
  lng?: string | null
  name?: string | null
  category?: string | null
  storeType?: string | null
  foodCertifyName?: string | null
}

export interface StoreApiResponse {
  data?: StoreType[]
  totalPage?: number
  totalCount?: number
  page?: number
}

export interface LocationType {
  lat: number
  lng: number
  zoom: number
}

export interface searchResultType {
  id: string
  place_name: string
  x?: string
  y?: string
  road_address_name?: string
  address_name?: string
  place_url?: string
  category_name?: string
}

export interface paginationType {
  current: number
  gotoFirst: () => {}
  gotoLast: () => {}
  gotoPage: (a: number) => {}
  hasNextPage: boolean
  hasPrevPage: boolean
  last: number
  nextPage: () => {}
  prevPage: () => {}
}
