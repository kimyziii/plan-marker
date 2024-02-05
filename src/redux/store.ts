import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import authReducer from './slice/authSlice'
import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'

const rootReducer = combineReducers({
  auth: authReducer,
})

const persistConfig = {
  key: 'root',
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store
export const persistor = persistStore(store)
