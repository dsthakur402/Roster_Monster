import type { AppProps } from 'next/app'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/providers/QueryProvider'
import { Layout } from '@/components/layout/Layout'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </QueryProvider>
  )
}