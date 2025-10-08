import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StaffForm } from "@/components/staff/StaffForm"
import { StaffGroupManager } from "@/components/staff/StaffGroupManager"
import { RoleManager } from "@/components/staff/RoleManager"
import { DepartmentManager } from "@/components/staff/DepartmentManager"
import { DataTable } from "@/components/ui/data-table"
import { Staff, StaffRole } from "@/lib/roster"
import { Role, defaultRoles, Location, StaffGroup, Session } from "@/lib/roles"
import { staffService, StaffMember as APIStaffMember, StaffGroup as APIStaffGroup, Department as APIDepartment } from "@/services/staff"
import { useToast } from "@/hooks/use-toast"

interface Department {
  id: string
  name: string
  description: string
}

type Column<T> = {
  header: string
  accessorKey: keyof T
  cell?: (row: T) => React.ReactNode
}

export default function StaffPage() {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([])
  const [groups, setGroups] = useState<StaffGroup[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [isEditingStaff, setIsEditingStaff] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [isEditingGroup, setIsEditingGroup] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<StaffGroup | null>(null)

  const staffColumns: Column<Staff>[] = [
    { header: "Name", accessorKey: "name" as keyof Staff },
    { 
      header: "Roles", 
      accessorKey: "roles" as keyof Staff,
      cell: (row: Staff) => Array.isArray(row.roles) && row.roles.length > 0 && typeof row.roles[0] === 'object' && 'name' in row.roles[0]
        ? row.roles.map((role: any) => role.name).join(", ")
        : ''
    },
    { 
      header: "Department", 
      accessorKey: "department" as keyof Staff,
      cell: (row: Staff) => (row.department as any)?.name ?? ''
    },
    { 
      header: "Points (Monthly)", 
      accessorKey: "points" as keyof Staff,
      cell: (row: Staff) => row.points?.monthly?.toString() || "0"
    },
    { 
      header: "Points (Total)", 
      accessorKey: "points" as keyof Staff,
      cell: (row: Staff) => row.points?.total?.toString() || "0"
    },
  ]

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff)
    setIsEditingStaff(true)
  }

  const handleSaveStaff = async (staff: Staff, hasAdminFTE: boolean) => {
    try {
      if (selectedStaff) {
        const staffId = Number(selectedStaff.id)
        const updatedStaff = await staffService.updateStaffMember(staffId, {
          name: staff.name,
          department: staff.department,
          email: staff.email || '',
          roles: staff.roles,
          is_active: true
        })
        setStaffMembers(prev => prev.map(s => s.id === updatedStaff.id.toString() ? {
          ...s,
          name: updatedStaff.name,
          department: updatedStaff.department,
          roles: updatedStaff.roles,
          email: updatedStaff.email
        } : s))
        setIsEditingStaff(false)
        setSelectedStaff(null)
        toast({
          title: "Success",
          description: "Staff member updated successfully",
        })
      } else {
        const newStaff = await staffService.createStaffMember({
          name: staff.name,
          department: staff.department,
          email: staff.email || '',
          roles: staff.roles,
          is_active: true
        })
        setStaffMembers(prev => [...prev, {
          id: newStaff.id.toString(),
          name: newStaff.name,
          department: newStaff.department,
          roles: newStaff.roles,
          email: newStaff.email,
          points: { monthly: 0, total: 0 },
          availability: []
        }])
        setIsAddingStaff(false)
        toast({
          title: "Success",
          description: "Staff member added successfully",
        })
      }

      if (hasAdminFTE) {
        createOrUpdateAdminLocation(staffMembers)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: selectedStaff ? "Failed to update staff member. Please try again." : "Failed to add staff member. Please try again.",
      })
    }
  }

  // Convert API StaffMember to frontend Staff type
  const convertToStaff = (staffMember: APIStaffMember): Staff => ({
    id: staffMember.id.toString(),
    name: staffMember.name,
    department: staffMember.department,
    roles: staffMember.roles,
    points: { monthly: 0, total: 0 },
    availability: []
  })

  // Convert API StaffGroup to frontend StaffGroup type
  const convertToFrontendStaffGroup = (group: any): StaffGroup => ({
    id: group.id.toString(),
    name: group.name,
    members: group.members?.map((m: any) => m.toString()) || [],
    roles: group.roles?.map((r: any) => ({
      id: r.id.toString(),
      name: r.name,
      department: r.department,
      maxHoursPerWeek: r.maxHoursPerWeek || 0,
      requiresCertification: r.requiresCertification || false,
      pointsPerShift: r.pointsPerShift || { morning: 0, evening: 0, night: 0, weekend: 0, holiday: 0 }
    })) || [],
    locations: group.locations?.map((l: any) => ({
      id: l.id.toString(),
      name: l.name,
      department: l.department,
      type: l.type || "clinical",
      requiredUsers: l.requiredUsers?.map((u: any) => u.toString()) || [],
      requiredRoles: l.requiredRoles?.map((r: any) => r.toString()) || [],
      requiredGroups: l.requiredGroups?.map((g: any) => g.toString()) || [],
      minStaffCount: l.minStaffCount || 0,
      priority: l.priority || 0,
      sessions: l.sessions || [{
        type: "Weekday",
        sessions: [{
          title: "Default Session",
          timings: [{
            title: "Default Timing",
            type: "AM",
            startTime: "09:00",
            endTime: "17:00",
            fteValue: 0.1
          }]
        }]
      }],
      dateOverrides: l.dateOverrides || []
    })) || [],
    shiftPreferences: group.shiftPreferences || {
      preferredShiftLength: 12,
      maxConsecutiveDays: 4,
      minRestBetweenShifts: 11
    }
  })

  // Convert API Department to frontend Department type
  const convertToFrontendDepartment = (dept: APIDepartment): Department => ({
    id: dept.id.toString(),
    name: dept.name,
    description: dept.description
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [staffData, groupsData, deptsData, rolesData] = await Promise.all([
          staffService.getStaffMembers(),
          staffService.getStaffGroups(),
          staffService.getDepartments(),
          staffService.getRoles()
        ])
        setStaffMembers(staffData.map(convertToStaff))
        setGroups(groupsData.map(convertToFrontendStaffGroup))
        setDepartments(deptsData.map(convertToFrontendDepartment))
        setRoles(rolesData.map(role => ({
          ...role,
          id: role.id.toString()
        })))
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const createOrUpdateAdminLocation = (currentStaff: Staff[]) => {
    const staffWithAdminFTE = currentStaff.filter(staff => 
      staff.roles.some(role => role.name.toLowerCase().includes('admin'))
    )

    if (staffWithAdminFTE.length > 0) {
      const existingAdminLocation = locations.find(l => l.id === "1")
      const adminLocation: Location = {
        id: "1",
        name: "Administrative Work",
        department: "Administration",
        type: "admin",
        requiredUsers: staffWithAdminFTE.map(staff => ({
          userId: staff.id,
          count: 1
        })),
        requiredRoles: [],
        requiredGroups: [],
        minStaffCount: staffWithAdminFTE.length,
        priority: Math.max(...locations.map(l => Number(l.priority)), 0) + 1,
        sessions: [{
          type: "Weekday",
          sessions: [{
            title: "Admin Session",
            timings: [] as Session[]
          }]
        }],
        dateOverrides: []
      }

      if (existingAdminLocation) {
        setLocations(locations.map(l => l.id === "1" ? adminLocation : l))
      } else {
        setLocations([...locations, adminLocation])
      }
    }
  }

  const handleDeleteStaff = async (staff: Staff) => {
    try {
      await staffService.deleteStaffMember(Number(staff.id))
      setStaffMembers(prev => prev.filter(s => s.id !== staff.id))
      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      })
      createOrUpdateAdminLocation(staffMembers.filter(s => s.id !== staff.id))
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
      })
    }
  }

  const handleEditGroup = (group: StaffGroup) => {
    setSelectedGroup(group)
    setIsEditingGroup(true)
  }

  const handleDeleteGroup = async (group: StaffGroup) => {
    try {
      await staffService.deleteStaffGroup(Number(group.id))
      setGroups(prev => prev.filter(g => g.id !== group.id))
      toast({
        title: "Success",
        description: "Group deleted successfully",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete group. Please try again.",
      })
    }
  }

  const handleSaveSingleGroup = async (group: StaffGroup) => {
    try {
      const backendGroup = {
        name: group.name,
        members: (group.members || []).map(id => Number(id)),
        roles: (group.roles || []).filter(r => r && r.id !== undefined && r.id !== null).map(role => Number(role.id)),
        locations: (group.locations || []).filter(l => l && l.id !== undefined && l.id !== null).map(location => Number(location.id))
      }
      if (group.id && groups.some(g => g.id === group.id)) {
        await staffService.updateStaffGroup(Number(group.id), backendGroup)
      } else {
        await staffService.createStaffGroup(backendGroup)
      }
      // Refresh the groups list from backend
      const refreshedGroups = await staffService.getStaffGroups()
      setGroups(refreshedGroups.map(convertToFrontendStaffGroup))
      setIsAddingGroup(false)
      setIsEditingGroup(false)
      setSelectedGroup(null)
      toast({
        title: "Success",
        description: "Group saved successfully",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save group. Please try again.",
      })
    }
  }

  const handleSaveRoles = async (updatedRoles: Role[]) => {
    try {
      // TODO: Implement role update API call
      setRoles(updatedRoles)
      toast({
        title: "Success",
        description: "Roles updated successfully",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update roles. Please try again.",
      })
    }
  }

  const handleSaveDepartments = async (updatedDepartments: Department[]) => {
    try {
      // TODO: Implement department update API call
      setDepartments(updatedDepartments)
      toast({
        title: "Success",
        description: "Departments updated successfully",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update departments. Please try again.",
      })
    }
  }

  const departmentColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
  ]

  const groupColumns: Column<StaffGroup>[] = [
    { header: "Name", accessorKey: "name" as keyof StaffGroup },
    { header: "Members", accessorKey: "members" as keyof StaffGroup, cell: (row: StaffGroup) => {
      if (!row.members || row.members.length === 0) return '';
      return row.members
        .map(memberId => {
          const member = staffMembers.find(s => s.id === memberId);
          return member ? member.name : memberId;
        })
        .join(", ");
    } },
    { header: "Roles", accessorKey: "roles" as keyof StaffGroup, cell: (row: StaffGroup) => {
      if (!row.roles || row.roles.length === 0) return '';
      return row.roles
        .map(role => typeof role === 'object' ? role.name : role)
        .join(", ");
    } },
    { header: "Locations", accessorKey: "locations" as keyof StaffGroup, cell: (row: StaffGroup) => {
      if (!row.locations || row.locations.length === 0) return '';
      return row.locations
        .map(location => typeof location === 'object' ? location.name : location)
        .join(", ");
    } },
    {
      header: "Actions",
      accessorKey: "actions" as keyof StaffGroup,
      cell: (row: StaffGroup) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEditGroup(row)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(row)}>Delete</Button>
        </div>
      )
    }
  ]

  const roleColumns = [
    { header: "Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
  ]

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </MainLayout>
    )
  }

  

  return (
    <MainLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Staff Management</h1>
        </div>

        <Tabs defaultValue="staff" className="space-y-6">
          <TabsList>
            <TabsTrigger value="staff">Staff Members</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="staff">
            <Dialog open={isAddingStaff || isEditingStaff} onOpenChange={(Open) => {
              if (!Open) {
                setIsAddingStaff(false)
                setIsEditingStaff(false)
                setSelectedStaff(null)
              }
            }}>
              <DialogTrigger asChild>
                <Button className="mb-4" onClick={() => setIsAddingStaff(true)}>
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{selectedStaff ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
                </DialogHeader>
                <StaffForm 
                  onSave={handleSaveStaff} 
                  roles={roles} 
                  departments={departments}
                  initialStaff={selectedStaff}
                />
              </DialogContent>
            </Dialog>
            <DataTable
              data={staffMembers}
              columns={staffColumns}
              onDelete={handleDeleteStaff}
              onEdit={handleEditStaff}
              searchPlaceholder="Search staff members..."
            />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManager onSave={handleSaveRoles} initialRoles={roles} />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManager
              onSave={handleSaveDepartments}
              initialDepartments={departments}
            />
          </TabsContent>

          <TabsContent value="groups">
            <div className="flex justify-between mb-4">
              <Dialog open={isAddingGroup || isEditingGroup} onOpenChange={(open) => {
                if (!open) {
                  setIsAddingGroup(false)
                  setIsEditingGroup(false)
                  setSelectedGroup(null)
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAddingGroup(true)}>
                    Add Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{selectedGroup ? "Edit Group" : "Add Group"}</DialogTitle>
                  </DialogHeader>
                  <StaffGroupManager
                    onSave={handleSaveSingleGroup}
                    initialGroups={selectedGroup ? [selectedGroup] : [{
                      id: '',
                      name: '',
                      members: [],
                      roles: [],
                      locations: [],
                      shiftPreferences: {
                        preferredShiftLength: 12,
                        maxConsecutiveDays: 4,
                        minRestBetweenShifts: 11
                      }
                    }]}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <DataTable
              data={groups}
              columns={groupColumns}
              searchPlaceholder="Search groups..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
