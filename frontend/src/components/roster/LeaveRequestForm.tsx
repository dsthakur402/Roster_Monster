
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LeaveType, LeaveRequest } from "@/lib/leave"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LeaveRequestFormProps {
  onSubmit: (request: Partial<LeaveRequest>) => void
  isUrgent?: boolean
  isAdminResearch?: boolean
  maxForecastWeeks?: number
}

export function LeaveRequestForm({ 
  onSubmit, 
  isUrgent = false,
  isAdminResearch = false,
  maxForecastWeeks = 26 // Default to 6 months
}: LeaveRequestFormProps) {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [leaveType, setLeaveType] = useState<LeaveType>()
  const [reason, setReason] = useState("")

  const leaveTypes: LeaveType[] = ["Annual", "Medical", "Emergency", "Maternity", "Paternity"]

  const handleSubmit = () => {
    if (!startDate || !endDate || !leaveType || !reason) return

    onSubmit({
      type: leaveType,
      startDate,
      endDate,
      reason
    })
  }

  const today = new Date()
  const maxForecastDate = new Date()
  maxForecastDate.setDate(today.getDate() + (maxForecastWeeks * 7))

  return (
    <div className="space-y-4">
      {isUrgent && (
        <Alert>
          <AlertDescription>
            Urgent leave requests affect immediate roster changes and require priority processing
          </AlertDescription>
        </Alert>
      )}

      {isAdminResearch && (
        <Alert>
          <AlertDescription>
            Admin/Research requests can be made up to 2 weeks in advance
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Leave Type</label>
        <Select onValueChange={(value) => setLeaveType(value as LeaveType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            {leaveTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            disabled={(date) => 
              isUrgent 
                ? date < today
                : date < today || date > maxForecastDate
            }
            className="rounded-md border"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            disabled={(date) => 
              isUrgent
                ? date < (startDate || today)
                : date < (startDate || today) || date > maxForecastDate
            }
            className="rounded-md border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Reason</label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for request"
        />
      </div>

      <Button 
        className="w-full" 
        onClick={handleSubmit}
        disabled={!startDate || !endDate || !leaveType || !reason}
      >
        Submit {isUrgent ? "Urgent" : isAdminResearch ? "Admin/Research" : "Forecast"} Request
      </Button>
    </div>
  )
}
