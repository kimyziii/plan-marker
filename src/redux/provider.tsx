'use client'
import { Provider } from 'react-redux'
import React from 'react'
import store from './store'

const Providers = ({ children }) => {
  return <Provider store={store}>{children}</Provider>
}

export default Providers
