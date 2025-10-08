
import { Staff } from "@/lib/roster"
import { defaultRoles } from "@/lib/roles"

export const sampleStaffMembers: Staff[] = [
  {
    id: "staff-1",
    name: "Dr. Sarah Chen",
    department: "Medical",
    roles: [
      {
        roleId: "senior-doctor",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.7 },
          { type: "admin", fte: 0.2 },
          { type: "research", fte: 0.1 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening"]
    }]
  },
  {
    id: "staff-2",
    name: "Dr. James Wilson",
    department: "Medical",
    roles: [
      {
        roleId: "junior-doctor",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.8 },
          { type: "admin", fte: 0.1 },
          { type: "research", fte: 0.1 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening", "night"]
    }]
  },
  {
    id: "staff-3",
    name: "Nurse Maria Rodriguez",
    department: "Nursing",
    roles: [
      {
        roleId: "senior-nurse",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.9 },
          { type: "admin", fte: 0.1 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening"]
    }]
  },
  {
    id: "staff-4",
    name: "Nurse David Lee",
    department: "Nursing",
    roles: [
      {
        roleId: "staff-nurse",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 1.0 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening", "night"]
    }]
  },
  {
    id: "staff-5",
    name: "John Smith",
    department: "Nursing",
    roles: [
      {
        roleId: "healthcare-assistant",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 1.0 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening", "night"]
    }]
  },
  {
    id: "staff-6",
    name: "Emma Thompson",
    department: "Allied Health",
    roles: [
      {
        roleId: "physiotherapist",
        fte: 0.8,
        sessions: [
          { type: "clinical", fte: 0.7 },
          { type: "admin", fte: 0.1 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening"]
    }]
  },
  {
    id: "staff-7",
    name: "Dr. Michael Chang",
    department: "Medical",
    roles: [
      {
        roleId: "senior-doctor",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.6 },
          { type: "admin", fte: 0.2 },
          { type: "research", fte: 0.2 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening"]
    }]
  },
  {
    id: "staff-8",
    name: "Sarah Johnson",
    department: "Nursing",
    roles: [
      {
        roleId: "senior-nurse",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.8 },
          { type: "admin", fte: 0.2 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening", "night"]
    }]
  },
  {
    id: "staff-9",
    name: "Robert Williams",
    department: "Medical",
    roles: [
      {
        roleId: "junior-doctor",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.9 },
          { type: "admin", fte: 0.1 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening", "night"]
    }]
  },
  {
    id: "staff-10",
    name: "Lisa Anderson",
    department: "Allied Health",
    roles: [
      {
        roleId: "physiotherapist",
        fte: 1,
        sessions: [
          { type: "clinical", fte: 0.8 },
          { type: "admin", fte: 0.1 },
          { type: "research", fte: 0.1 }
        ]
      }
    ],
    points: { monthly: 0, total: 0 },
    availability: [{
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      availableShifts: ["morning", "evening"]
    }]
  }
]
