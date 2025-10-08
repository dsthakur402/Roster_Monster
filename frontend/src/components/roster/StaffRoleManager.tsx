import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/lib/roles"
import { StaffRole } from "@/lib/roster"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface StaffRoleManagerProps {
  onSave: (roles: StaffRole[], hasAdminFTE: boolean) => void
  initialRoles?: StaffRole[]
  availableRoles?: Role[]
}

export function StaffRoleManager({ onSave, initialRoles = [], availableRoles = [] }: StaffRoleManagerProps) {
  const [roles, setRoles] = useState<StaffRole[]>(initialRoles)
  const [enableFTE, setEnableFTE] = useState(false)
  const [hasAdminFTE, setHasAdminFTE] = useState(false)

  useEffect(() => {
    const adminFTEExists = roles.some(role => 
      role.sessions.some(session => session.type === "admin" && session.fte > 0)
    )
    setHasAdminFTE(adminFTEExists)
  }, [roles])

  const handleAddRole = () => {
    if (!enableFTE) return
    
    setRoles([...roles, {
      roleId: "",
      fte: 1,
      sessions: [
        { type: "clinical", fte: 0.8 },
        { type: "admin", fte: 0.2 },
        { type: "research", fte: 0 }
      ]
    }])
  }

  const handleRoleChange = (index: number, field: keyof StaffRole, value: string) => {
    const updatedRoles = [...roles]
    updatedRoles[index] = { ...updatedRoles[index], [field]: value }
    setRoles(updatedRoles)
    onSave(updatedRoles, hasAdminFTE)
  }

  const handleSessionChange = (roleIndex: number, sessionIndex: number, values: number[]) => {
    const updatedRoles = [...roles]
    const session = updatedRoles[roleIndex].sessions[sessionIndex]
    session.fte = values[0] / 100
    setRoles(updatedRoles)
    onSave(updatedRoles, hasAdminFTE)
  }

  const calculateRemainingFTE = (roleIndex: number) => {
    const role = roles[roleIndex]
    const totalFTE = role.sessions.reduce((sum, session) => sum + session.fte, 0)
    return Math.round((1 - totalFTE) * 100) / 100
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2 p-4 border rounded-lg">
          <Checkbox 
            id="enable-fte"
            checked={enableFTE}
            onCheckedChange={(checked) => setEnableFTE(checked as boolean)}
          />
          <Label htmlFor="enable-fte">Enable FTE</Label>
        </div>

        {roles.map((role, roleIndex) => (
          <div key={roleIndex} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Select
                value={role.roleId}
                onValueChange={(value) => handleRoleChange(roleIndex, "roleId", value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">
                  Remaining FTE: {calculateRemainingFTE(roleIndex)}
                </span>
              </div>
            </div>

            {enableFTE && (
              <div className="space-y-4">
                {role.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="space-y-2">
                    <label className="text-sm font-medium">
                      {session.type} FTE ({session.fte})
                    </label>
                    <Slider
                      value={[session.fte * 100]}
                      onValueChange={(values) => handleSessionChange(roleIndex, sessionIndex, values)}
                      max={100}
                      step={10}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleAddRole} disabled={!enableFTE}>
            Add Role
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
