import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Check, X as XIcon, Pencil } from "lucide-react"
import { departmentService } from "@/services/department"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Department {
  id: string
  name: string
  description: string
}

interface DepartmentManagerProps {
  onSave: (departments: Department[]) => void
  initialDepartments?: Department[]
}

export function DepartmentManager({ onSave, initialDepartments = [] }: DepartmentManagerProps) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [isLoading, setIsLoading] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<number | null>(null)
  const [tempDepartment, setTempDepartment] = useState<Department | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true)
        const fetchedDepartments = await departmentService.getDepartments()
        setDepartments(fetchedDepartments.map(d => ({ ...d, id: d.id.toString() })))
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch departments",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [toast])

  const handleAddDepartment = () => {
    const newDepartment = {
      id: `temp-${Date.now()}`,
      name: "",
      description: ""
    }
    setDepartments([...departments, newDepartment])
    setEditingDepartment(departments.length)
    setTempDepartment(newDepartment)
    setIsAdding(true)
  }

  const handleDepartmentChange = (index: number, field: keyof Department, value: string) => {
    if (editingDepartment === index) {
      setTempDepartment(prev => prev ? { ...prev, [field]: value } : null)
    } else {
      const updatedDepartments = [...departments]
      updatedDepartments[index] = { ...updatedDepartments[index], [field]: value }
      setDepartments(updatedDepartments)
    }
  }

  const handleDeleteDepartment = async (index: number) => {
    const department = departments[index]
    try {
      setIsLoading(true)
      console.log('Attempting to delete department:', department)
      if (department.id.startsWith('temp-')) {
        // Local department, just remove from state
        const updatedDepartments = departments.filter((_, i) => i !== index)
        setDepartments(updatedDepartments)
      } else {
        // Existing department, delete from server
        await departmentService.deleteDepartment(department.id)
        console.log('Deleted department from server:', department.id)
        const updatedDepartments = departments.filter((_, i) => i !== index)
        setDepartments(updatedDepartments)
        onSave(updatedDepartments)
        toast({
          title: "Success",
          description: "Department deleted successfully",
        })
      }
    } catch (error) {
      console.error('Delete department error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete department",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (index: number) => {
    setEditingDepartment(index)
    setTempDepartment({ ...departments[index] })
    setIsAdding(false)
  }

  const saveEditing = async (index: number) => {
    if (!tempDepartment) return

    try {
      setIsLoading(true)
      const department = departments[index]
      let updatedDepartment: Department
      console.log('Attempting to save department:', tempDepartment)
      if (department.id.startsWith('temp-')) {
        // Create new department
        const { id, ...departmentData } = tempDepartment
        updatedDepartment = await departmentService.createDepartment(departmentData)
        updatedDepartment.id = updatedDepartment.id.toString()
        console.log('Created department:', updatedDepartment)
      } else {
        // Update existing department
        const { id, ...departmentData } = tempDepartment
        updatedDepartment = await departmentService.updateDepartment(department.id, departmentData)
        updatedDepartment.id = updatedDepartment.id.toString()
        console.log('Updated department:', updatedDepartment)
      }

      const updatedDepartments = [...departments]
      updatedDepartments[index] = updatedDepartment
      setDepartments(updatedDepartments)
      onSave(updatedDepartments)
      toast({
        title: "Success",
        description: "Department saved successfully",
      })
    } catch (error) {
      console.error('Save department error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save department",
      })
    } finally {
      setIsLoading(false)
      setEditingDepartment(null)
      setTempDepartment(null)
      setIsAdding(false)
    }
  }

  const cancelEditing = () => {
    if (isAdding) {
      const updatedDepartments = departments.slice(0, -1)
      setDepartments(updatedDepartments)
    }
    setEditingDepartment(null)
    setTempDepartment(null)
    setIsAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department, index) => {
              const isEditing = editingDepartment === index
              const currentDepartment = isEditing ? tempDepartment : department
              if (!currentDepartment) return null

              return (
                <TableRow key={department.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={currentDepartment.name}
                        onChange={(e) => handleDepartmentChange(index, "name", e.target.value)}
                        placeholder="Enter department name"
                        className="border-0 focus-visible:ring-0"
                        disabled={isLoading}
                      />
                    ) : (
                      <span>{currentDepartment.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={currentDepartment.description}
                        onChange={(e) => handleDepartmentChange(index, "description", e.target.value)}
                        placeholder="Enter department description"
                        className="border-0 focus-visible:ring-0"
                        disabled={isLoading}
                      />
                    ) : (
                      <span>{currentDepartment.description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => saveEditing(index)}
                            disabled={isLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={cancelEditing}
                            disabled={isLoading}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => startEditing(index)}
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteDepartment(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={handleAddDepartment}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
