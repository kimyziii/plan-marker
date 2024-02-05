import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  map: null,
}

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    SET_MAP: (state, action) => {
      state.map = action.payload
    },
  },
})

export const { SET_MAP } = mapSlice.actions

export const selectMap = (state) => state.map.map

export default mapSlice.reducer
