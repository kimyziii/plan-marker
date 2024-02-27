import '/src/styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { QueryClient, QueryClientProvider } from 'react-query'

import { RecoilRoot } from 'recoil'
import { persistor } from '@/redux/store'

import Providers from '@/redux/provider'
import { PersistGate } from 'redux-persist/integration/react'

const queryClient = new QueryClient()
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <Providers>
      <PersistGate loading={null} persistor={persistor}>
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </QueryClientProvider>
        </RecoilRoot>
      </PersistGate>
    </Providers>
  )
}
