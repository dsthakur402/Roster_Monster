import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Trash2, ChevronDown, ChevronUp, Pencil, Check, X as XIcon } from "lucide-react"
import { Role, defaultRoles } from "@/lib/roles"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { staffService } from "@/services/staff"
import { useToast } from "@/components/ui/use-toast"
import React from "react"

interface RoleManagerProps {
  onSave: (roles: Role[]) => void
  initialRoles?: Role[]
}

interface Department {
  id: number
  name: string
  description: string
}

export function RoleManager({ onSave, initialRoles = defaultRoles }: RoleManagerProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [departments, setDepartments] = useState<Department[]>([])
  const [expandedRole, setExpandedRole] = useState<number | null>(null)
  const [editingRole, setEditingRole] = useState<number | null>(null)
  const [tempRole, setTempRole] = useState<Role | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true)
        const fetchedDepartments = await staffService.getDepartments()
        setDepartments(fetchedDepartments)
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

  useEffect(() => {
    // Ensure all role IDs are strings on mount
    setRoles(initialRoles.map(r => ({ ...r, id: r.id?.toString?.() || '' })))
  }, [initialRoles])

  const handleAddRole = () => {
    const newRole = {
      id: (roles.length + 1).toString(),
      name: "",
      department: departments.length > 0 ? departments[0].name : "",
      maxHoursPerWeek: 40,
      requiresCertification: false,
      pointsPerShift: {
        morning: 10,
        evening: 15,
        night: 20,
        weekend: 25,
        holiday: 30
      }
    }
    setRoles([...roles, newRole])
    setEditingRole(roles.length)
    setTempRole(newRole)
    setIsAdding(true)
  }

  const handleRoleChange = (index: number, field: keyof Role, value: any) => {
    if (editingRole === index) {
      setTempRole(prev => prev ? { ...prev, [field]: value } : null)
    } else {
      const updatedRoles = [...roles]
      updatedRoles[index] = { ...updatedRoles[index], [field]: value }
      setRoles(updatedRoles)
    }
  }

  const handlePointsChange = (index: number, shiftType: keyof Role["pointsPerShift"], value: number) => {
    if (editingRole === index) {
      setTempRole(prev => prev ? {
        ...prev,
        pointsPerShift: { ...prev.pointsPerShift, [shiftType]: value }
      } : null)
    } else {
      const updatedRoles = [...roles]
      updatedRoles[index].pointsPerShift[shiftType] = value
      setRoles(updatedRoles)
    }
  }

  const handleDeleteRole = async (index: number) => {
    const role = roles[index]
    try {
      setIsLoading(true)
      if (role.id && !isNaN(Number(role.id))) {
        await staffService.deleteRole(role.id.toString())
        toast({
          title: "Success",
          description: "Role deleted successfully",
        })
      }
      const updatedRoles = roles.filter((_, i) => i !== index)
      setRoles(updatedRoles)
      if (expandedRole === index) {
        setExpandedRole(null)
      } else if (expandedRole && expandedRole > index) {
        setExpandedRole(expandedRole - 1)
      }
      if (editingRole === index) {
        setEditingRole(null)
        setTempRole(null)
        setIsAdding(false)
      }
      onSave(updatedRoles)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete role",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = (index: number) => {
    setExpandedRole(expandedRole === index ? null : index)
  }

  const startEditing = (index: number) => {
    setEditingRole(index)
    setTempRole({ ...roles[index] })
    setIsAdding(false)
  }

  const saveEditing = async (index: number) => {
    if (tempRole) {
      try {
        setIsLoading(true)
        const updatedRoles = [...roles]
        updatedRoles[index] = tempRole
        setRoles(updatedRoles)
        // Convert frontend role to API role
        const roleForBackend = {
          name: tempRole.name,
          description: tempRole.department
        }
        let apiRole
        if (isAdding) {
          apiRole = await staffService.createRole(roleForBackend)
          apiRole.id = apiRole.id?.toString?.() || ''
        } else {
          apiRole = await staffService.updateRole(tempRole.id.toString(), roleForBackend)
          apiRole.id = apiRole.id?.toString?.() || ''
        }
        updatedRoles[index] = apiRole
        setRoles(updatedRoles)
        onSave(updatedRoles)
        toast({
          title: "Success",
          description: isAdding ? "Role created successfully" : "Role updated successfully"
        })
      } catch (error: any) {
        if (error?.response?.status === 404) {
          toast({
            variant: "destructive",
            title: "Role Not Found",
            description: "The role you are trying to update no longer exists.",
          })
          // Remove the role from the UI if it was deleted elsewhere
          const updatedRoles = roles.filter((_, i) => i !== index)
          setRoles(updatedRoles)
          onSave(updatedRoles)
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: isAdding ? "Failed to create role" : "Failed to update role"
          })
        }
      } finally {
        setIsLoading(false)
        setEditingRole(null)
        setTempRole(null)
        setIsAdding(false)
      }
    }
  }

  const cancelEditing = () => {
    if (isAdding) {
      const updatedRoles = roles.slice(0, -1)
      setRoles(updatedRoles)
    }
    setEditingRole(null)
    setTempRole(null)
    setIsAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Max Hours</TableHead>
              <TableHead>Certification</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role, roleIndex) => {
              const isEditing = editingRole === roleIndex
              const currentRole = isEditing ? tempRole : role
              if (!currentRole) return null

              return (
                <React.Fragment key={`role-${currentRole.id}`}>
                  <TableRow>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpand(roleIndex)}
                      >
                        {expandedRole === roleIndex ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={currentRole.name}
                          onChange={(e) => handleRoleChange(roleIndex, "name", e.target.value)}
                          placeholder="Enter role name"
                          className="border-0 focus-visible:ring-0"
                        />
                      ) : (
                        <span>{currentRole.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={currentRole.department}
                          onValueChange={(value) => handleRoleChange(roleIndex, "department", value)}
                        >
                          <SelectTrigger className="border-0 focus-visible:ring-0">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={`dept-${dept.id}`} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{currentRole.department}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={currentRole.maxHoursPerWeek}
                          onChange={(e) => handleRoleChange(roleIndex, "maxHoursPerWeek", parseInt(e.target.value))}
                          min={0}
                          max={168}
                          className="w-20 border-0 focus-visible:ring-0"
                        />
                      ) : (
                        <span>{currentRole.maxHoursPerWeek}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={currentRole.requiresCertification ? "true" : "false"}
                          onValueChange={(value) => handleRoleChange(roleIndex, "requiresCertification", value === "true")}
                        >
                          <SelectTrigger className="border-0 focus-visible:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{currentRole.requiresCertification ? "Yes" : "No"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => saveEditing(roleIndex)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={cancelEditing}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => startEditing(roleIndex)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteRole(roleIndex)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedRole === roleIndex && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="p-4 space-y-4 bg-muted/50">
                          <h4 className="text-sm font-medium">Points Per Shift</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(currentRole.pointsPerShift).map(([type, points]) => (
                              <div key={`points-${type}`} className="space-y-2">
                                <label className="text-sm font-medium capitalize">{type}</label>
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={points}
                                    onChange={(e) => handlePointsChange(roleIndex, type as keyof Role["pointsPerShift"], parseInt(e.target.value))}
                                    min={0}
                                  />
                                ) : (
                                  <span>{points}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleAddRole} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Add Role
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
