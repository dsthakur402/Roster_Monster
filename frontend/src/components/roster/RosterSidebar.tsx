import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { defaultGroups, defaultRoles } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/contexts/AuthContext'

interface Roster {
  id: string
  name: string
  permissions: {
    userId: string
    canEdit: boolean
  }[]
}

interface RosterPermissionDialogProps {
  roster: Roster
  onSave: (roster: Roster) => void
}

function RosterPermissionDialog({ roster, onSave }: RosterPermissionDialogProps) {
  const [permissions, setPermissions] = useState(roster.permissions)

  const handleTogglePermission = (userId: string) => {
    setPermissions(perms => 
      perms.map(p => 
        p.userId === userId ? { ...p, canEdit: !p.canEdit } : p
      )
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Roster Permissions - {roster.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {permissions.map((permission) => (
          <div key={permission.userId} className="flex items-center justify-between">
            <Label>User {permission.userId}</Label>
            <Switch
              checked={permission.canEdit}
              onCheckedChange={() => handleTogglePermission(permission.userId)}
            />
          </div>
        ))}
        <Button onClick={() => onSave({ ...roster, permissions })}>
          Save Permissions
        </Button>
      </div>
    </DialogContent>
  )
}

export function RosterSidebar() {
  const { user } = useAuth()

  return (
    <div className="w-80 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Important Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add any important updates or notifications here */}
        </CardContent>
      </Card>
    </div>
  )
}
