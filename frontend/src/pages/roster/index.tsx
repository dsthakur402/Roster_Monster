
import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { RosterCalendar } from "@/components/roster/RosterCalendar"
import { sampleStaffMembers } from "@/lib/sample-data"

export default function RosterPage() {
  return (
    <MainLayout>
      <div className="container max-sm:!w-full mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Roster Management</h1>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <RosterCalendar staff={sampleStaffMembers} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
