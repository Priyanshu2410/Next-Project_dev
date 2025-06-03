// src/app/layout.tsx
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Post App',
  description: 'Create and manage posts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  )
}


