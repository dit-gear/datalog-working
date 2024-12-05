import React, { useEffect, useRef, createContext, useState, ReactNode } from 'react'

interface PreviewContainerProps {
  children: ReactNode
}

interface WorkerContextType {
  sendToWorker: (task: any) => Promise<any>
}

export const WorkerContext = createContext<WorkerContextType | null>(null)

let messageIdCounter = 0

export const PreviewContainer: React.FC<PreviewContainerProps> = ({ children }) => {
  const workerRef = useRef<Worker | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pendingRequests = useRef<Map<number, { resolve: Function; reject: Function }>>(new Map())

  // Initialize the worker when the parent component mounts
  useEffect(() => {
    const worker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    workerRef.current = worker

    worker.onmessage = (event) => {
      const { id, html, error } = event.data
      const pending = pendingRequests.current.get(id)
      if (pending) {
        if (error) {
          pending.reject(new Error(error))
        } else {
          pending.resolve(html)
        }
        pendingRequests.current.delete(id)
      }
    }

    worker.onerror = (error) => {
      console.error('Worker error:', error.message)
      setError(error.message)
    }

    // Terminate the worker when the component unmounts
    return () => {
      worker.terminate()
    }
  }, [])

  const sendToWorker = (task: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      const messageId = messageIdCounter++
      pendingRequests.current.set(messageId, { resolve, reject })
      workerRef.current.postMessage({ ...task, id: messageId })
    })
  }

  return (
    <WorkerContext.Provider value={{ sendToWorker }}>
      {children}
      {error && (
        <div className="bg-red-100 p-8 text-black">
          <p>Error:</p>
          {error}
        </div>
      )}
    </WorkerContext.Provider>
  )
}
