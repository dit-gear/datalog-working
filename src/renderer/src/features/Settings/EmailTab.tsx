import { ReactElement } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@components/ui/select'
import { Switch } from '@components/ui/switch'

const EmailTab = (): ReactElement => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>Project settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-white">Email Service Provider</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="resend">Resend</SelectItem>
                  <SelectItem value="sendgrid">Sendgrid</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </dd>
        </div>

        {/*<div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-white">Email API</dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary">Set API Key</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <p>
                            Opens another dialog with three inputs, Service provider, API key and
                            secret password.
                          </p>
                        </DialogContent>
                      </Dialog>
                      <p>
                        Opens another dialog with three inputs, Service provider, API key and secret
                        password.
                      </p>
                    </dd>
                  </div>*/}
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-white">API Key</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
            <Input type="password" className="w-64" />
          </dd>
        </div>
        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
          <dt className="text-sm font-medium leading-6 text-white">Encrypt?</dt>
          <dd className="mt-1 text-sm leading-6 text-gray-400 sm:col-span-2 sm:mt-0">
            <Switch />
          </dd>
        </div>
      </CardContent>
    </Card>
  )
}

export default EmailTab
