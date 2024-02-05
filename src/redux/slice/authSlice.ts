import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  nickname: null,
  mid: null,
  email: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SET_ACTIVE: (state) => {
      state.isLoggedIn = true
    },
    SET_ACTIVE_USER: (state, action) => {
      const { nickname, mid, email } = action.payload
      state.nickname = nickname
      state.mid = mid
      state.email = email
    },
    REMOVE_ACTIVE_USER: (state) => {
      state.isLoggedIn = false
      state.nickname = null
      state.mid = null
      state.email = null
    },
  },
})

export const { SET_ACTIVE, SET_ACTIVE_USER, REMOVE_ACTIVE_USER } =
  authSlice.actions

export const selectAuth = (state) => state.auth
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn
export const selectNickname = (state) => state.auth.nickname
export const selectMid = (state) => state.auth.mid
export const selectEmail = (state) => state.auth.email

export default authSlice.reducer
