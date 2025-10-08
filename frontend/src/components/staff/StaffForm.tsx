import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { sendStaffInvite } from '@/services/email'
import { StaffRoleManager } from "@/components/roster/StaffRoleManager"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role, Location } from "@/lib/roles"
import { Staff, StaffRole } from "@/lib/roster"
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { staffService } from "@/services/staff"
import { useToast } from "@/components/ui/use-toast"

interface Department {
  id: string
  name: string
  description: string
}

interface StaffFormProps {
  onSave: (staff: Staff, hasAdminFTE: boolean) => void
  initialStaff?: Staff
  roles?: Role[]
  locations?: Location[]
  departments?: Department[]
}

export function StaffForm({ onSave, initialStaff, roles: initialRoles = [], locations = [], departments: initialDepartments = [] }: StaffFormProps) {
  const [staff, setStaff] = useState<Partial<Staff>>({
    name: initialStaff?.name || '',
    roles: initialStaff?.roles || [],
    department: typeof initialStaff?.department === 'string' ? initialStaff?.department : (initialStaff?.department as any)?.name || '',
    points: initialStaff?.points || { monthly: 0, total: 0 },
    availability: initialStaff?.availability || []
  })
  const [email, setEmail] = useState(initialStaff?.email || '')
  const [error, setError] = useState('')
  const [hasAdminFTE, setHasAdminFTE] = useState(false)
  const [isEditor, setIsEditor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        const [depts, roles] = await Promise.all([
          staffService.getDepartments(),
          staffService.getRoles()
        ])
        setDepartments(depts.map(d => ({ ...d, id: d.id.toString() })))
        setRoles(roles)
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load departments or roles."
        })
      }
    }
    fetchData()
  }, [toast])

  const handleSave = () => {
    setIsLoading(true)
    setError('')
    const savedStaff = { ...staff, email } as Staff
    onSave(savedStaff, hasAdminFTE)
    setIsLoading(false)
  }

  const handleSaveRoles = (newRoles: StaffRole[], hasAdmin: boolean) => {
    setStaff({ ...staff, roles: newRoles })
    setHasAdminFTE(hasAdmin)
  }

  const handleChange = (field: keyof Staff, value: any) => {
    setStaff({ ...staff, [field]: value })
  }

  const getDepartmentName = (department: string) => department || ''

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Staff Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Name</label>
            <Input
              placeholder='Staff member name'
              value={staff.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>Email</label>
            <Input
              type='email'
              placeholder='Staff member email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='editor-role'
              checked={isEditor}
              onCheckedChange={setIsEditor}
            />
            <Label htmlFor='editor-role'>Assign Editor Role</Label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select 
              value={getDepartmentName(staff.department as string)}
              onValueChange={(value) => handleChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" >
                  {getDepartmentName(staff.department as string)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.name}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <StaffRoleManager
        onSave={handleSaveRoles}
        initialRoles={staff.roles || []}
        availableRoles={roles}
      />

      <div className='flex justify-end'>
        <Button 
          onClick={handleSave}
          disabled={!staff.name || !staff.department || !staff.roles?.length || isLoading}
        >
          {isLoading ? "Saving..." : "Save Staff Member"}
        </Button>
      </div>
    </div>
  )
}