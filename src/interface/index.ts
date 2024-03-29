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

export interface planType {
  address_name: string
  category_group_code: string
  category_group_name: string
  category_name: string
  distance: string
  id: string
  phone: string
  place_name: string
  place_url: string
  road_address_name: string
  x: string
  y: string
  hour?: string
  minute?: string
  memo?: string
}

export interface dataType {
  createdAt: Date
  createdById: string
  createdByName: string
  data: string
  isPublic: boolean
  modifiedAt: Date
  title: string
  city: string
  __v: number
  _id: string
}

export interface DataTypeGroup {
  city: string
  data: dataType[]
}

export interface prevMapDataType {
  id: string
  x: string
  y: string
  place_name?: string
}

export interface mapDataType extends prevMapDataType {
  marker: any
  customOverlay: any
}
