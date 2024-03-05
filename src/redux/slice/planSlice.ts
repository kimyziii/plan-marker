import { mapDataType, planType, prevMapDataType } from '@/interface'
import { createSlice } from '@reduxjs/toolkit'

interface PlanState {
  // any: 카카오 지도 marker, customOverlay, {위도, 경도}
  mapDatas: mapDataType[]
  pendingDatas: planType[]
}

const initialState = {
  mapDatas: [],
  pendingDatas: [],
}

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    SET_EDIT_DATA: (
      state: PlanState,
      action: {
        payload: {
          pendingDatas: planType[]
          mapDatas: prevMapDataType[]
          map?: any
        }
      },
    ) => {
      const { pendingDatas, mapDatas, map } = action.payload
      state.pendingDatas = pendingDatas

      let idx = 1
      state.mapDatas = []
      mapDatas.forEach((data) => {
        const { marker, customOverlay } = addMapData(data, idx)

        marker.setMap(map)
        customOverlay.setMap(map)

        state.mapDatas.push({
          ...data,
          marker,
          customOverlay,
        })

        handleBounds(state.mapDatas, map)

        idx += 1
      })
    },

    ADD_MARKER: (
      state: PlanState,
      action: {
        payload: {
          data: planType
          map: any
        }
      },
    ) => {
      const { data, map } = action.payload
      const idx = state.mapDatas?.length || 0

      state.pendingDatas = [...state.pendingDatas, data]
      state.mapDatas = state.mapDatas
        ? [
            ...state.mapDatas,
            { id: data.id, x: data.x, y: data.y, ...addMapData(data, idx + 1) },
          ]
        : [{ id: data.id, x: data.x, y: data.y, ...addMapData(data, idx + 1) }]

      state.mapDatas.forEach((data) => {
        const { marker, customOverlay } = data
        marker.setMap(map)
        customOverlay.setMap(map)
      })

      handleBounds(state.mapDatas, map)
    },

    REMOVE_MARKERS: (
      state: PlanState,
      action: { payload: { id: string; map: any } },
    ) => {
      const { id, map } = action.payload
      state.pendingDatas = state.pendingDatas.filter((item) => item.id !== id)

      state.mapDatas.forEach((data) => {
        if (data.id === id) {
          const { marker, customOverlay } = data
          marker.setMap(null)
          customOverlay.setMap(null)
        }
      })

      let newMapData = state.mapDatas.filter((data) => data.id !== id)
      state.mapDatas = newMapData

      handleBounds(state.mapDatas, map)
    },

    CLEAR_MARKERS: (state: PlanState, action: { payload: { map: any } }) => {
      const map = action.payload?.map
      if (map) {
        state.pendingDatas = []

        state.mapDatas.forEach((data) => {
          const { marker, customOverlay } = data
          marker.setMap(null)
          customOverlay.setMap(null)
        })

        handleBounds(state.mapDatas, map)
        state.mapDatas = []
      }
    },

    UPDATE_PENDING_DATAS: (
      state: PlanState,
      action: {
        payload: {
          name: string
          value: string
          id: string
        }
      },
    ) => {
      const { name, value, id } = action.payload
      const planToUpdate = state.pendingDatas.find((plan) => plan.id === id)
      planToUpdate[name] = value
    },

    SORT_PENDING_DATAS: (
      state: PlanState,
      action: { payload: { idx: number; type: string; map: any } },
    ) => {
      const { idx, type, map } = action.payload
      let arr = [...state.pendingDatas]
      let temp = arr[idx]

      if (type === 'up') {
        arr[idx] = arr[idx - 1]
        arr[idx - 1] = temp
      } else if (type === 'down') {
        arr[idx] = arr[idx + 1]
        arr[idx + 1] = temp
      }

      state.pendingDatas = arr

      // 기존 mapDatas 마커 초기화
      state.mapDatas.forEach((data) => {
        const { marker, customOverlay } = data
        marker.setMap(null)
        customOverlay.setMap(null)
      })
      state.mapDatas = []

      // 새로운 배열로 마커 찍기
      let markerImageIdx = 1
      arr.forEach((data) => {
        const { marker, customOverlay } = addMapData(data, markerImageIdx)

        marker.setMap(map)
        customOverlay.setMap(map)

        state.mapDatas.push({
          ...data,
          marker,
          customOverlay,
        })

        handleBounds(state.mapDatas, map)
        markerImageIdx += 1
      })
    },
  },
})

export const {
  SET_EDIT_DATA,
  ADD_MARKER,
  REMOVE_MARKERS,
  CLEAR_MARKERS,
  UPDATE_PENDING_DATAS,
  SORT_PENDING_DATAS,
} = planSlice.actions

export const selectMapDatas = (state) => state.plan.mapDatas
export const selectPendingDatas = (state) => state.plan.pendingDatas

export default planSlice.reducer

function addMapData(data, idx: number) {
  var imageSrc = `/icons/markers/marker-${idx}.png`
  var imageSize = new window.kakao.maps.Size(35, 35)
  var markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize)

  const latlng = new window.kakao.maps.LatLng(data.y, data.x)

  var marker = new window.kakao.maps.Marker({
    position: latlng,
    title: data.place_name,
    image: markerImage,
    draggable: true,
  })

  var content =
    '<div className="customoverlay" style="padding: 3px 8px; background-color: #EEF6FF; border-radius: 14px; border: 1px solid #EDF2FD; color: #2E5BDC; font-size: small;">' +
    `    <span className="title">${data.place_name}</span>` +
    '</div>'

  var customOverlay = new window.kakao.maps.CustomOverlay({
    position: latlng,
    content: content,
    xAnchor: 0.5,
    yAnchor: 0,
  })

  window.kakao.maps.event.addListener(marker, 'mouseover', function () {
    marker.setZIndex(100)
    customOverlay.setZIndex(100)
  })

  window.kakao.maps.event.addListener(marker, 'mouseout', function () {
    marker.setZIndex(1)
    customOverlay.setZIndex(1)
  })

  return {
    marker,
    customOverlay,
  }
}

function handleBounds(data, map) {
  const points = []

  if (data?.length > 0) {
    data.forEach((value) => {
      const latlng = new window.kakao.maps.LatLng(value.y, value.x)
      points.push(latlng)
    })
    var bounds = new window.kakao.maps.LatLngBounds()

    for (let i = 0; i < points.length; i++) {
      bounds.extend(points[i])
    }

    map.setBounds(bounds)
  }
}
