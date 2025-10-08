import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Pencil, Check, X as XIcon, Search, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FTEScale, FTEAssignment } from "@/lib/fte"
import { defaultRoles, defaultGroups } from "@/lib/roles"
import { Staff } from "@/lib/roster"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface FTEManagerProps {
  scales: FTEScale[]
  assignments: FTEAssignment[]
  onSaveScales: (scales: FTEScale[]) => Promise<void>
  onSaveAssignments: (assignments: FTEAssignment[]) => Promise<void>
  pagination: {
    page: number
    size: number
    total: number
    pages: number
  }
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  isLoading: boolean
}

type SortField = "name" | "type" | "baseValue" | "equivalentFTE"
type SortDirection = "asc" | "desc"

export function FTEManager({
  scales,
  assignments,
  onSaveScales,
  onSaveAssignments,
  pagination,
  onPageChange,
  onSizeChange,
  isLoading
}: FTEManagerProps) {
  const { toast } = useToast()
  const [editingScale, setEditingScale] = useState<string | null>(null)
  const [tempScale, setTempScale] = useState<FTEScale | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [localScales, setLocalScales] = useState<FTEScale[]>(scales)
  const [selectedTargetType, setSelectedTargetType] = useState<"role" | "staff" | "group">("role")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setLocalScales(scales)
  }, [scales])

  const validateScale = (scale: FTEScale): boolean => {
    const errors: Record<string, string> = {}

    if (!scale.name.trim()) {
      errors.name = "Name is required"
    }

    if (scale.baseValue <= 0) {
      errors.baseValue = "Base value must be greater than 0"
    }

    if (scale.equivalentFTE <= 0) {
      errors.equivalentFTE = "Equivalent FTE must be greater than 0"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddScale = () => {
    const newScale: FTEScale = {
      id: "",
      name: "",
      type: "hours",
      baseValue: 0,
      equivalentFTE: 0
    }
    setLocalScales(prev => [...prev, newScale])
    setEditingScale(newScale.id)
    setTempScale(newScale)
    setIsAdding(true)
    setValidationErrors({})
  }

  const handleScaleChange = (field: keyof FTEScale, value: string | number) => {
    if (tempScale) {
      setTempScale(prev => ({
        ...prev!,
        [field]: value
      }))
      // Clear validation error for the field being edited
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const startEditing = (scale: FTEScale) => {
    setEditingScale(scale.id)
    setTempScale({ ...scale })
    setIsAdding(false)
    setValidationErrors({})
  }

  const saveEditing = async () => {
    if (!tempScale) return

    if (!validateScale(tempScale)) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive"
      })
      return
    }

    try {
      const updatedScales = localScales.map(scale =>
        scale.id === tempScale.id ? tempScale : scale
      )

      await onSaveScales(updatedScales)
      setLocalScales(updatedScales)
      setEditingScale(null)
      setTempScale(null)
      setIsAdding(false)
      setValidationErrors({})

      toast({
        title: "Success",
        description: "Scale saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scale",
        variant: "destructive"
      })
    }
  }

  const cancelEditing = () => {
    if (isAdding) {
      setLocalScales(prev => prev.filter(scale => scale.id !== tempScale?.id))
    }
    setEditingScale(null)
    setTempScale(null)
    setIsAdding(false)
    setValidationErrors({})
  }

  const handleAddAssignment = (scaleId: string, targetType: "role" | "staff" | "group", targetId: string) => {
    const newAssignment: FTEAssignment = {
      id: `assignment-${assignments.length + 1}`,
      scaleId,
      targetType,
      targetId,
      value: 1.0
    }
    setAssignments([...assignments, newAssignment])
  }

  const handleAssignmentChange = (id: string, value: number) => {
    setAssignments(assignments.map(assignment =>
      assignment.id === id ? { ...assignment, value } : assignment
    ))
  }

  const renderAssignmentSection = (scale: FTEScale) => {
    switch (selectedTargetType) {
      case "role":
        return defaultRoles.map((role) => {
          const assignment = assignments.find(
            a => a.scaleId === scale.id && a.targetType === "role" && a.targetId === role.id
          )
          return (
            <div key={role.id} className="flex items-center gap-4">
              <span className="w-48">{role.name}</span>
              {assignment ? (
                <div className="flex-1">
                  <Slider
                    value={[assignment.value]}
                    min={0}
                    max={scale.baseValue}
                    step={scale.type === "shifts" ? 1 : 0.5}
                    onValueChange={([value]) => handleAssignmentChange(assignment.id, value)}
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleAddAssignment(scale.id, "role", role.id)}
                >
                  Add Assignment
                </Button>
              )}
            </div>
          )
        })

      case "staff":
        return staffMembers.map((staff) => {
          const assignment = assignments.find(
            a => a.scaleId === scale.id && a.targetType === "staff" && a.targetId === staff.id
          )
          return (
            <div key={staff.id} className="flex items-center gap-4">
              <span className="w-48">{staff.name}</span>
              {assignment ? (
                <div className="flex-1">
                  <Slider
                    value={[assignment.value]}
                    min={0}
                    max={scale.baseValue}
                    step={scale.type === "shifts" ? 1 : 0.5}
                    onValueChange={([value]) => handleAssignmentChange(assignment.id, value)}
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleAddAssignment(scale.id, "staff", staff.id)}
                >
                  Add Assignment
                </Button>
              )}
            </div>
          )
        })

      case "group":
        return defaultGroups.map((group) => {
          const assignment = assignments.find(
            a => a.scaleId === scale.id && a.targetType === "group" && a.targetId === group.id
          )
          return (
            <div key={group.id} className="flex items-center gap-4">
              <span className="w-48">{group.name}</span>
              {assignment ? (
                <div className="flex-1">
                  <Slider
                    value={[assignment.value]}
                    min={0}
                    max={scale.baseValue}
                    step={scale.type === "shifts" ? 1 : 0.5}
                    onValueChange={([value]) => handleAssignmentChange(assignment.id, value)}
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleAddAssignment(scale.id, "group", group.id)}
                >
                  Add Assignment
                </Button>
              )}
            </div>
          )
        })
    }
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedScales = localScales
    .filter(scale => 
      scale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scale.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1
      if (sortField === "name" || sortField === "type") {
        return direction * String(a[sortField]).localeCompare(String(b[sortField]))
      }
      return direction * (Number(a[sortField]) - Number(b[sortField]))
    })

  return (
    <Tabs defaultValue="scales" className="space-y-6">
      <TabsList>
        <TabsTrigger value="scales">FTE Scales</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
      </TabsList>

      <TabsContent value="scales">
        <Card>
          <CardHeader>
            <CardTitle>FTE Scale Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">FTE Scales</h2>
              <Button onClick={handleAddScale}>
                <Plus className="w-4 h-4 mr-2" />
                Add Scale
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search scales..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center">
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("baseValue")}
                  >
                    <div className="flex items-center">
                      Base Value
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("equivalentFTE")}
                  >
                    <div className="flex items-center">
                      Equivalent FTE
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedScales.map(scale => (
                  <TableRow key={scale.id}>
                    <TableCell>
                      {editingScale === scale.id ? (
                        <div className="space-y-1">
                          <Input
                            value={tempScale?.name || ""}
                            onChange={e => handleScaleChange("name", e.target.value)}
                            className={`border-0 focus-visible:ring-0 ${validationErrors.name ? "border-red-500" : ""}`}
                          />
                          {validationErrors.name && (
                            <p className="text-sm text-red-500">{validationErrors.name}</p>
                          )}
                        </div>
                      ) : (
                        scale.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingScale === scale.id ? (
                        <Select
                          value={tempScale?.type || "hours"}
                          onValueChange={value => handleScaleChange("type", value)}
                        >
                          <SelectTrigger className="border-0 focus-visible:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        scale.type
                      )}
                    </TableCell>
                    <TableCell>
                      {editingScale === scale.id ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={tempScale?.baseValue || 0}
                            onChange={e => handleScaleChange("baseValue", Number(e.target.value))}
                            className={`border-0 focus-visible:ring-0 ${validationErrors.baseValue ? "border-red-500" : ""}`}
                          />
                          {validationErrors.baseValue && (
                            <p className="text-sm text-red-500">{validationErrors.baseValue}</p>
                          )}
                        </div>
                      ) : (
                        scale.baseValue
                      )}
                    </TableCell>
                    <TableCell>
                      {editingScale === scale.id ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            value={tempScale?.equivalentFTE || 0}
                            onChange={e => handleScaleChange("equivalentFTE", Number(e.target.value))}
                            className={`border-0 focus-visible:ring-0 ${validationErrors.equivalentFTE ? "border-red-500" : ""}`}
                          />
                          {validationErrors.equivalentFTE && (
                            <p className="text-sm text-red-500">{validationErrors.equivalentFTE}</p>
                          )}
                        </div>
                      ) : (
                        scale.equivalentFTE
                      )}
                    </TableCell>
                    <TableCell>
                      {editingScale === scale.id ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={saveEditing}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditing}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(scale)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // TODO: Implement delete
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Label>Show</Label>
                <Select
                  value={pagination.size.toString()}
                  onValueChange={value => onSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <Label>entries</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assignments">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>FTE Assignments</CardTitle>
              <Select value={selectedTargetType} onValueChange={(value: "role" | "staff" | "group") => setSelectedTargetType(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Roles</SelectItem>
                  <SelectItem value="staff">Staff Members</SelectItem>
                  <SelectItem value="group">Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {localScales.map((scale) => (
                <div key={scale.id} className="space-y-4">
                  <h3 className="font-medium">{scale.name}</h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {renderAssignmentSection(scale)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => onSaveAssignments(assignments)}>
              Save Assignments
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
