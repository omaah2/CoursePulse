import React from 'react'

type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any, info: any) {
    // In a real app send to telemetry here
    // console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-lg p-6 bg-white rounded shadow text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600">An unexpected error occurred. Try reloading the page.</p>
            <div className="mt-4">
              <button onClick={() => location.reload()} className="px-4 py-2 bg-green-600 text-white rounded">Reload</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
