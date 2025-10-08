
import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LeaveRequest } from "@/lib/leave"
import { Badge } from "@/components/ui/badge"
import { LeaveRequestForm } from "@/components/roster/LeaveRequestForm"

export default function LeavePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [showForecastForm, setShowForecastForm] = useState(false)
  const [showUrgentForm, setShowUrgentForm] = useState(false)
  const [showAdminResearchForm, setShowAdminResearchForm] = useState(false)

  const getLeaveRequestsForDate = (date: Date) => {
    return leaveRequests.filter(request => 
      request.startDate <= date && request.endDate >= date
    )
  }

  const handleLeaveRequest = (request: Partial<LeaveRequest>, isUrgent: boolean) => {
    const newRequest: LeaveRequest = {
      id: `leave-${leaveRequests.length + 1}`,
      staffId: "1", // This would come from auth context in a real app
      startDate: request.startDate!,
      endDate: request.endDate!,
      type: request.type!,
      status: "Pending",
      reason: request.reason!,
      createdAt: new Date()
    }
    
    setLeaveRequests([...leaveRequests, newRequest])
    isUrgent ? setShowUrgentForm(false) : setShowForecastForm(false)
    setShowAdminResearchForm(false)
  }

  const selectedDateRequests = getLeaveRequestsForDate(selectedDate)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Request Management</h1>
          <div className="space-x-4">
            <Dialog open={showForecastForm} onOpenChange={setShowForecastForm}>
              <DialogTrigger asChild>
                <Button variant="outline">Request Forecast Leave</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Forecast Leave Request</DialogTitle>
                </DialogHeader>
                <LeaveRequestForm onSubmit={(request) => handleLeaveRequest(request, false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={showUrgentForm} onOpenChange={setShowUrgentForm}>
              <DialogTrigger asChild>
                <Button variant="destructive">Request Urgent Leave</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Urgent Leave Request</DialogTitle>
                </DialogHeader>
                <LeaveRequestForm onSubmit={(request) => handleLeaveRequest(request, true)} isUrgent />
              </DialogContent>
            </Dialog>

            <Dialog open={showAdminResearchForm} onOpenChange={setShowAdminResearchForm}>
              <DialogTrigger asChild>
                <Button variant="secondary">Request Admin/Research</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Admin/Research Request</DialogTitle>
                </DialogHeader>
                <LeaveRequestForm 
                  onSubmit={(request) => handleLeaveRequest(request, false)} 
                  maxForecastWeeks={2}
                  isAdminResearch
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  hasLeave: (date) => getLeaveRequestsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasLeave: {
                    backgroundColor: "var(--primary)",
                    color: "white",
                    fontWeight: "500"
                  }
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests for {selectedDate.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDateRequests.length > 0 ? (
                  selectedDateRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <Badge variant={request.status === "Pending" ? "outline" : "default"}>
                          {request.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {request.type}
                        </span>
                      </div>
                      <p className="text-sm">{request.reason}</p>
                      <div className="text-sm text-muted-foreground">
                        {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No requests for this date</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
