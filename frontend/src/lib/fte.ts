
import { Role, StaffGroup } from "@/lib/roles"

export interface FTEScale {
  id: string
  name: string
  type: "shifts" | "hours" | "days"
  baseValue: number
  equivalentFTE: number
}

export interface FTEAssignment {
  id: string
  scaleId: string
  targetType: "role" | "staff" | "group"
  targetId: string
  value: number
}

export const defaultFTEScales: FTEScale[] = [
  {
    id: "shift-scale",
    name: "Standard Shift",
    type: "shifts",
    baseValue: 10,
    equivalentFTE: 1.0
  },
  {
    id: "hours-scale",
    name: "Weekly Hours",
    type: "hours",
    baseValue: 40,
    equivalentFTE: 1.0
  },
  {
    id: "days-scale",
    name: "Weekly Days",
    type: "days",
    baseValue: 5,
    equivalentFTE: 1.0
  }
]
