
import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { LocationManager } from "@/components/staff/LocationManager"
import { Location } from "@/lib/roles"
import { Staff } from "@/lib/roster"
import { sampleStaffMembers } from "@/lib/sample-data"

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])

  const handleSaveLocations = (updatedLocations: Location[]) => {
    setLocations(updatedLocations)
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Location Management</h1>
        </div>

        <LocationManager
          onSave={handleSaveLocations}
          initialLocations={locations}
          staffMembers={sampleStaffMembers}
        />
      </div>
    </MainLayout>
  )
}
