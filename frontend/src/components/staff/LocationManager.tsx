import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Trash2 } from "lucide-react"
import { Location, defaultRoles, defaultGroups } from "@/lib/roles"
import { Staff } from "@/lib/roster"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { locationService } from "@/services/location"
import { useToast } from "@/hooks/use-toast"

interface LocationManagerProps {
  onSave?: (locations: Location[]) => void
  initialLocations?: Location[]
  staffMembers?: Staff[]
}

interface StandardShift {
  title: string
  startTime: string
  endTime: string
  isEnabled: boolean
}

const defaultShifts: StandardShift[] = [
  { title: "Morning", startTime: "08:00", endTime: "16:00", isEnabled: true },
  { title: "Afternoon", startTime: "16:00", endTime: "00:00", isEnabled: true },
  { title: "Night", startTime: "00:00", endTime: "08:00", isEnabled: true }
]

export function LocationManager({ onSave, initialLocations = [], staffMembers = [] }: LocationManagerProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [selectedStaff, setSelectedStaff] = useState<Record<number, string[]>>({})
  const [locationShifts, setLocationShifts] = useState<Record<number, StandardShift[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setIsLoading(true)
      const loadedLocations = await locationService.getAllLocations()
      setLocations(loadedLocations)
      // Initialize shifts and staff selection for each location
      const shifts: Record<number, StandardShift[]> = {}
      const staff: Record<number, string[]> = {}
      loadedLocations.forEach(location => {
        shifts[location.id] = [...defaultShifts]
        staff[location.id] = location.requiredUsers.map(u => u.userId)
      })
      setLocationShifts(shifts)
      setSelectedStaff(staff)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load locations",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLocation = async () => {
    try {
      setIsLoading(true)
      const newLocation: Omit<Location, 'id'> = {
        name: "",
        department: "",
        type: "clinical",
        requiredUsers: [],
        requiredRoles: [],
        requiredGroups: [],
        minStaffCount: 0,
        priority: locations.length + 1,
        sessions: [{
          type: "Weekday",
          sessions: [{
            title: "Default Session",
            timings: []
          }]
        }],
        dateOverrides: []
      }
      
      const createdLocation = await locationService.createLocation(newLocation)
      setLocations([...locations, createdLocation])
      setSelectedStaff({ ...selectedStaff, [createdLocation.id]: [] })
      setLocationShifts({ ...locationShifts, [createdLocation.id]: [...defaultShifts] })
      
      toast({
        title: "Success",
        description: "Location added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationChange = async (index: number, field: keyof Location, value: any) => {
    try {
      setIsLoading(true)
      const updatedLocations = [...locations]
      updatedLocations[index] = { ...updatedLocations[index], [field]: value }
      setLocations(updatedLocations)
      
      const location = updatedLocations[index]
      await locationService.updateLocation(location.id, { [field]: value })
      
      toast({
        title: "Success",
        description: "Location updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLocation = async (index: number) => {
    try {
      setIsLoading(true)
      const locationId = locations[index].id
      await locationService.deleteLocation(locationId)
      
      const updatedLocations = locations.filter((_, i) => i !== index)
      setLocations(updatedLocations)
      
      const updatedSelectedStaff = { ...selectedStaff }
      delete updatedSelectedStaff[locationId]
      const updatedLocationShifts = { ...locationShifts }
      delete updatedLocationShifts[locationId]
      setSelectedStaff(updatedSelectedStaff)
      setLocationShifts(updatedLocationShifts)
      
      toast({
        title: "Success",
        description: "Location deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStaffSelection = (locationIndex: number, staffId: string, isChecked: boolean) => {
    const updatedLocations = [...locations]
    const location = updatedLocations[locationIndex]
    const requiredUsers = location.requiredUsers.filter(u => u.userId !== staffId)
    
    if (isChecked) {
      requiredUsers.push({ userId: staffId, count: 1 })
    }
    
    updatedLocations[locationIndex] = {
      ...location,
      requiredUsers
    }
    
    setLocations(updatedLocations)
    handleLocationChange(locationIndex, 'requiredUsers', requiredUsers)
  }

  const handleShiftChange = (locationId: number, shiftIndex: number, field: keyof StandardShift, value: any) => {
    const updatedShifts = { ...locationShifts }
    if (!updatedShifts[locationId]) {
      updatedShifts[locationId] = [...defaultShifts]
    }
    
    updatedShifts[locationId] = updatedShifts[locationId].map((shift, index) => {
      if (index === shiftIndex) {
        return { ...shift, [field]: value }
      }
      return shift
    })
    
    setLocationShifts(updatedShifts)
    
    // Update the location's sessions
    const locationIndex = locations.findIndex(l => l.id === locationId)
    if (locationIndex >= 0) {
      const updatedLocations = [...locations]
      const location = updatedLocations[locationIndex]
      const enabledShifts = updatedShifts[locationId].filter(s => s.isEnabled)
      
      updatedLocations[locationIndex] = {
        ...location,
        sessions: [{
          type: location.sessions[0].type,
          sessions: [{
            title: "Standard Shifts",
            timings: enabledShifts.map(shift => ({
              startTime: shift.startTime,
              endTime: shift.endTime
            }))
          }]
        }]
      }
      
      setLocations(updatedLocations)
      handleLocationChange(locationIndex, 'sessions', updatedLocations[locationIndex].sessions)
    }
  }

  const handleSessionTypeChange = (locationIndex: number, type: string) => {
    const updatedLocations = [...locations]
    const location = updatedLocations[locationIndex]
    
    updatedLocations[locationIndex] = {
      ...location,
      sessions: [{
        type,
        sessions: location.sessions[0].sessions
      }]
    }
    
    setLocations(updatedLocations)
    handleLocationChange(locationIndex, 'sessions', updatedLocations[locationIndex].sessions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            {locations.map((location, locationIndex) => (
              <div key={location.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location Name</label>
                      <Input
                        value={location.name}
                        onChange={(e) => handleLocationChange(locationIndex, "name", e.target.value)}
                        placeholder="Enter location name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Department</label>
                      <Input
                        value={location.department}
                        onChange={(e) => handleLocationChange(locationIndex, "department", e.target.value)}
                        placeholder="Enter department"
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteLocation(locationIndex)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Input
                      type="number"
                      min={1}
                      value={location.priority}
                      onChange={(e) => handleLocationChange(locationIndex, "priority", parseInt(e.target.value))}
                      placeholder="Set priority (1 = highest)"
                      className="w-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min number of Staff</label>
                    <Input
                      type="number"
                      min={0}
                      value={location.minStaffCount}
                      onChange={(e) => handleLocationChange(locationIndex, "minStaffCount", parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Session Configuration</h4>
                    <Select
                      value={location.sessions[0].type}
                      onValueChange={(value) => handleSessionTypeChange(locationIndex, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekday">Weekday</SelectItem>
                        <SelectItem value="Weekend">Weekend</SelectItem>
                        <SelectItem value="Weekday & Weekend">Weekday & Weekend</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="space-y-4 mt-4">
                      {locationShifts[location.id]?.map((shift, shiftIndex) => (
                        <div key={shiftIndex} className="flex items-center space-x-4 p-2 border rounded">
                          <Checkbox
                            id={`${location.id}-shift-${shiftIndex}`}
                            checked={shift.isEnabled}
                            onCheckedChange={(checked) => 
                              handleShiftChange(location.id, shiftIndex, "isEnabled", checked)
                            }
                          />
                          <Label htmlFor={`${location.id}-shift-${shiftIndex}`} className="flex-1">
                            {shift.title}
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) => handleShiftChange(location.id, shiftIndex, "startTime", e.target.value)}
                              className="w-32"
                              disabled={!shift.isEnabled}
                            />
                            <span>to</span>
                            <Input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) => handleShiftChange(location.id, shiftIndex, "endTime", e.target.value)}
                              className="w-32"
                              disabled={!shift.isEnabled}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Required Staff</h4>
                    <ScrollArea className="h-[200px] border rounded-md p-4">
                      <div className="space-y-2">
                        {staffMembers.map((staff) => (
                          <div key={staff.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${location.id}-${staff.id}`}
                              checked={location.requiredUsers.some(u => u.userId === staff.id)}
                              onCheckedChange={(checked) => 
                                handleStaffSelection(locationIndex, staff.id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`${location.id}-${staff.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {staff.name} - {staff.department}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleAddLocation}
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Location
              </Button>
              {onSave && (
                <Button 
                  onClick={() => onSave(locations)}
                  disabled={isLoading}
                >
                  Save Locations
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
