import { Component, ReactNode, ErrorInfo } from 'react'
import { CircleX } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to render the fallback UI
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error or send it to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI when an error is caught
      return (
        <div className="flex h-full justify-center items-center">
          <div className="flex flex-col gap-10 items-center">
            <CircleX className="h-20 w-20" />
            <h1 className="text-xl">Something went wrong. Please reload window</h1>
          </div>
        </div>
      )
    }

    // Render the children if no error
    return this.props.children
  }
}

export default ErrorBoundary
