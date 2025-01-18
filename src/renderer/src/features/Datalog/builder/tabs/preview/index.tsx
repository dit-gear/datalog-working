import { Suspense } from 'react'
import { Table } from './table/index'
import { Loader2 } from 'lucide-react'

const Preview = () => {
  return (
    <Suspense
      fallback={
        <div className="animate-spin">
          <Loader2 />
        </div>
      }
    >
      <Table />
    </Suspense>
  )
}

export default Preview
