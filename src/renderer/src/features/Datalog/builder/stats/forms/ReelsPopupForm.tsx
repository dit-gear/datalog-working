import { useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, Form } from '@components/ui/form'
import { Textarea } from '@components/ui/textarea'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import { deepEqual } from '@renderer/utils/compare'

interface ReelsPopupFormProps {
  value: string
  defaults: string[]
  update: (data: string[]) => void
  clear: () => void
  children: React.ReactNode
}

type ReelsType = {
  reels: string
}

export const ReelsPopupForm: React.FC<ReelsPopupFormProps> = ({
  value,
  defaults,
  update,
  clear,
  children
}) => {
  const form = useForm({
    defaultValues: {
      reels: value
    }
  })
  const { handleSubmit, reset } = form

  useEffect(() => {
    reset({ reels: value })
  }, [value])

  const onSubmit: SubmitHandler<ReelsType> = (data): void => {
    let array = data.reels.split(/[\s,]+/)
    if (array.length === 1 && array[0] === '') array = []
    if (deepEqual(array, defaults)) return
    console.log('will update')
    update(array)
    reset(data)
  }

  const handleOpenChange = (open: boolean) => {
    if (open === false) {
      handleSubmit(onSubmit)()
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger className="min-w-12 min-h-10 text-left">{children}</PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Reels</h4>
              <p className="text-sm text-muted-foreground">Set the Reel names</p>
            </div>
            <div className="grid gap-2">
              <FormField
                name="reels"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                reset({ reels: defaults.join(' ') })
                clear()
              }}
            >
              Reset
            </Button>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
