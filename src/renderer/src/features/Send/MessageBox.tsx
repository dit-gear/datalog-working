import { Button } from '@components/ui/button'

const MessageBox = () => {
  return (
    <div className="fixed bottom-0 left-0 p-4 border-t z-30">
      <p className="text-xs text-blue-400">Message from today's sponsor:</p>
      <span className="text-sm">
        {
          [
            'Tech.store: Raid X20 just dropped. Amazing speeds of 2500MB/s!',
            'GadgetHub: 30% off all label printers today!',
            'SpeedyMart: Free shipping on orders over $500!'
          ][Math.floor(Math.random() * 3)]
        }
        <Button
          variant="link"
          className="h-auto  py-0 pl-1 text-xs font-normal text-blue-400 underline"
        >
          {['Read more', 'Visit store', 'Press release', ''][Math.floor(Math.random() * 3)]}
        </Button>
      </span>
    </div>
  )
}

export default MessageBox
