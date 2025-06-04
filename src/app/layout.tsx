import './globals.css';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from "react";
import SessionWrapper from '@/components/SessionWrapper'; // ✅ Adjust path as needed

export const metadata = {
  title: 'Post App',
  description: 'Create and manage posts',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
