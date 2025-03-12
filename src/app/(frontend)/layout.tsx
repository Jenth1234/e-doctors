import { ReactNode } from 'react'
import './globals.css'
import { Providers } from '@/providers'
import NavBar from '@/components/NavBar'
import { Toaster } from 'sonner'

type LayoutProps = {
  children: ReactNode
}

export const metadata = {
  description: 'eDoctors - Your online doctor',
  title: 'eDoctors',
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html>
      <head>
        <link href="/favicon.png" rel="icon" />
      </head>
      <body>
        <Providers>
          <NavBar />
          <main className="min-h-[calc(100vh-4rem)] mt-16">{children}</main>
          <Toaster position='top-left' />
        </Providers>
      </body>
    </html>
  )
}
