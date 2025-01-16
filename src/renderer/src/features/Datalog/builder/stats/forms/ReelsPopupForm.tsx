import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import { FormControl, FormField, FormItem, Form } from '@components/ui/form'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Button } from '@components/ui/button'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import MultiSelectTextInput from '@components/MultiSelectTextInput'

interface ReelsPopupFormProps {
  value: string[]
  update: (data: string[]) => void
  clear: () => void
  children: React.ReactNode
}

const reelsForm = z.object({
  reels: z.array(z.string()).nullable()
})

type ReelsType = z.infer<typeof reelsForm>

export const ReelsPopupForm: React.FC<ReelsPopupFormProps> = ({
  value,
  update,
  clear,
  children
}) => {
  const [open, setOpen] = useState(false)
  const form = useForm({
    defaultValues: {
      reels: value
    },
    resolver: zodResolver(reelsForm)
  })
  const {
    handleSubmit,
    reset,
    formState: { isValid }
  } = form

  useEffect(() => {
    reset({ reels: value })
  }, [value])

  const onSubmit: SubmitHandler<ReelsType> = (data): void => {
    if (data.reels && data.reels.slice().sort().join() !== value.slice().sort().join()) {
      update(data.reels)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={(v) => setOpen(v)}>
      <PopoverTrigger className="min-w-12 min-h-10 text-left rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {children}
      </PopoverTrigger>
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
                      <MultiSelectTextInput {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={!isValid}>
                Set
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  clear()
                  setOpen(false)
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
