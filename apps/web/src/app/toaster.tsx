'use client'

import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '10px',
          background: '#1f2937',
          color: '#f9fafb',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
      }}
    />
  )
}
