type CityArrType = [string, number][]

export const CITY_ARRAY: CityArrType = [
  ['서울/경기', 0],
  ['부산', 1],
  ['대구', 2],
  ['인천', 3],
  ['광주', 4],
  ['대전/세종', 5],
  ['울산', 6],
  ['강원도', 7],
  ['충청북도', 8],
  ['충청남도', 9],
  ['전라북도', 10],
  ['전라남도', 11],
  ['경상북도', 12],
  ['경상남도', 13],
  ['제주도', 14],
]

export const CITY_NAME_ARRAY = CITY_ARRAY.map((item) => item[0])

export const CITY_MAP = new Map(CITY_ARRAY)
