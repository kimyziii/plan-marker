import { dataType, planType } from '@/interface'
import { createSlice } from '@reduxjs/toolkit'
import { enableMapSet } from 'immer'

enableMapSet()

interface PlanState {
  // any: 카카오 지도 marker, customOverlay, {위도, 경도}
  pendingDatas: planType[]
  title: string
}

const initialState = {
  markerDatas: null,
  pendingDatas: null,
  title: null,
  isPublic: true,
}

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    SET_EDIT_DATA: (state: PlanState, action: { payload: dataType }) => {
      const data = action.payload
      state.title = data.title
      state.pendingDatas = JSON.parse(data.data)
    },

    ADD_MARKER: (
      state: PlanState,
      action: {
        payload: {
          data: planType
          marker: any
          customOverlay: any
        }
      },
    ) => {
      const { data } = action.payload
      state.pendingDatas = [...state.pendingDatas, data]
    },

    REMOVE_MARKERS: (state: PlanState, action: { payload: string }) => {
      const id = action.payload
      state.pendingDatas = state.pendingDatas.filter((item) => item.id !== id)
    },

    CLEAR_MARKERS: (state: PlanState) => {
      state.pendingDatas = []
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
      action: { payload: { idx: number; type: string } },
    ) => {
      const { idx, type } = action.payload
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

export const selectMarkerDatas = (state) => state.plan.markerData
export const selectPendingDatas = (state) => state.plan.pendingDatas

export default planSlice.reducer
