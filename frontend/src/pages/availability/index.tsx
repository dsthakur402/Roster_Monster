import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { AvailabilityDialog } from '@/components/availability/AvailabilityDialog'

interface Availability {
  id: number
  userId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const availability: Availability[] = [
  {
    id: 1,
    userId: '1',
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  },
  // Add more mock data as needed
]

export default function AvailabilityPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null)

  const handleEdit = (availability: Availability) => {
    setSelectedAvailability(availability)
    setIsDialogOpen(true)
  }

  const handleDelete = async (availabilityId: number) => {
    // Implement delete functionality
    console.log('Delete availability:', availabilityId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Availability</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Availability
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daysOfWeek.map((day, index) => {
              const dayAvailability = availability.find(
                (a) => a.dayOfWeek === index
              )
              return (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  <TableCell>
                    {dayAvailability?.startTime || 'Not set'}
                  </TableCell>
                  <TableCell>
                    {dayAvailability?.endTime || 'Not set'}
                  </TableCell>
                  <TableCell>
                    {dayAvailability?.isAvailable ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell className="text-right">
                    {dayAvailability && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(dayAvailability)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(dayAvailability.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AvailabilityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        availability={selectedAvailability}
      />
    </div>
  )
}