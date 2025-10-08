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
import { ShiftDialog } from '@/components/shifts/ShiftDialog'

interface Shift {
  id: number
  user: string
  startTime: string
  endTime: string
  status: string
}

const shifts: Shift[] = [
  {
    id: 1,
    user: 'John Doe',
    startTime: '2024-03-22 09:00',
    endTime: '2024-03-22 17:00',
    status: 'scheduled',
  },
  // Add more mock data as needed
]

export default function ShiftsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift)
    setIsDialogOpen(true)
  }

  const handleDelete = async (shiftId: number) => {
    // Implement delete functionality
    console.log('Delete shift:', shiftId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shifts</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>{shift.user}</TableCell>
                <TableCell>{shift.startTime}</TableCell>
                <TableCell>{shift.endTime}</TableCell>
                <TableCell>{shift.status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(shift)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(shift.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ShiftDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        shift={selectedShift}
      />
    </div>
  )
}