
import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format, addDays } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateRoster, RosterEntry, Shift, Staff } from "@/lib/roster"
import { defaultRoles, defaultGroups, defaultLocations } from "@/lib/roles"
import { getSingaporeHolidays } from "@/lib/holidays"

type ViewType = "all" | "assigned"

export default function DashboardPage() {
  const [viewDays, setViewDays] = useState<"1" | "2" | "3" | "4" | "5">("1")
  const [viewType, setViewType] = useState<ViewType>("all")
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null)

  const holidays = getSingaporeHolidays(new Date().getFullYear())

  const getDaysToShow = () => {
    const days: Date[] = []
    const numDays = parseInt(viewDays)
    for (let i = 0; i < numDays; i++) {
      days.push(addDays(new Date(), i))
    }
    return days
  }

  const generateCurrentRoster = () => {
    const startDate = new Date()
    const endDate = addDays(startDate, parseInt(viewDays))
    
    const { roster: generatedRoster } = generateRoster(
      startDate,
      endDate,
      [], // This would come from actual staff data
      defaultRoles,
      defaultGroups,
      defaultLocations,
      [],
      holidays
    )
    
    setRoster(generatedRoster)
  }

  const getShiftsForDate = (date: Date): Shift[] => {
    const shifts = roster.find(r => 
      r.date.getDate() === date.getDate() &&
      r.date.getMonth() === date.getMonth() &&
      r.date.getFullYear() === date.getFullYear()
    )?.shifts || []

    if (viewType === "assigned" && currentStaff) {
      return shifts.filter(shift => shift.staffIds.includes(currentStaff.id))
    }
    
    return shifts
  }

  const daysToShow = getDaysToShow()

  const handleViewTypeChange = (value: string) => {
    setViewType(value as ViewType)
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={viewDays} onValueChange={(value: "1" | "2" | "3" | "4" | "5") => setViewDays(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select days to view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Today only</SelectItem>
                <SelectItem value="2">Next 2 days</SelectItem>
                <SelectItem value="3">Next 3 days</SelectItem>
                <SelectItem value="4">Next 4 days</SelectItem>
                <SelectItem value="5">Next 5 days</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={viewType} onValueChange={handleViewTypeChange}>
              <TabsList>
                <TabsTrigger value="all">All Locations</TabsTrigger>
                <TabsTrigger value="assigned">My Shifts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {daysToShow.map((day) => (
            <Card key={day.toISOString()}>
              <CardHeader>
                <CardTitle>{format(day, "EEEE, MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getShiftsForDate(day).map((shift, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Badge>{shift.department}</Badge>
                        <span className="capitalize">{shift.type} shift</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">View Staff</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assigned Staff</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            {shift.staffIds.map((staffId) => (
                              <div key={staffId} className="p-2 border rounded">
                                Staff ID: {staffId}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                  {getShiftsForDate(day).length === 0 && (
                    <div className="text-muted-foreground text-center py-4">
                      No shifts scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
