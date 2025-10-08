import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { leaveService, LeaveRequest } from '@/services/leave'

const leaveRequestSchema = z.object({
  userId: z.string().min(1, 'Please select a staff member'),
  type: z.enum(['forecast', 'non_urgent', 'urgent']),
  startDate: z.string().min(1, 'Please select a start date'),
  endDate: z.string().min(1, 'Please select an end date'),
  notes: z.string().optional(),
})

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>

interface LeaveRequestDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  request?: {
    id: number
    staff_id: number
    leave_type: 'forecast' | 'non_urgent' | 'urgent'
    start_date: string
    end_date: string
    notes?: string
  } | null
  onSave?: (leaveRequest: LeaveRequest) => void
}

export function LeaveRequestDialog({
  isOpen,
  onOpenChange,
  request,
  onSave,
}: LeaveRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      userId: request?.staff_id.toString() || '',
      type: request?.leave_type || 'non_urgent',
      startDate: request?.start_date || '',
      endDate: request?.end_date || '',
      notes: request?.notes || '',
    },
  })

  const onSubmit = async (data: LeaveRequestFormValues) => {
    console.log('Form submitted with data:', data)
    setIsLoading(true)
    try {
      let response: LeaveRequest
      const requestData = {
        staff_id: parseInt(data.userId),
        leave_type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
      }
      console.log('Sending request data:', requestData)

      if (request) {
        // Update existing leave request
        console.log('Updating leave request:', request.id)
        response = await leaveService.updateLeaveRequest(request.id, requestData)
      } else {
        // Create new leave request
        console.log('Creating new leave request')
        response = await leaveService.createLeaveRequest(requestData)
      }
      
      console.log('API response:', response)
      toast({
        title: "Success",
        description: `Leave request ${request ? 'updated' : 'created'} successfully`,
      })
      
      onOpenChange(false)
      onSave?.(response)
    } catch (error) {
      console.error('Error submitting leave request:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save leave request. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{request ? 'Edit Leave Request' : 'New Leave Request'}</DialogTitle>
          <DialogDescription>
            {request ? 'Update the leave request details below.' : 'Fill in the details to create a new leave request.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">John Doe</SelectItem>
                      <SelectItem value="2">Jane Smith</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="forecast">Forecast</SelectItem>
                      <SelectItem value="non_urgent">Non-Urgent</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes..." 
                      {...field} 
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isValid}
                onClick={() => console.log('Submit button clicked')}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}