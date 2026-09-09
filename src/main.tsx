import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './styles/tailwind.css'
// FullCalendar CSS loaded via CDN in index.html to avoid package export issues

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={createBrowserRouter(
          [
            {
              path: '/*',
              element: <App />,
            },
          ],
          { future: { v7_relativeSplatPath: true } }
        )}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
