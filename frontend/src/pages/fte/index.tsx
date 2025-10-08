import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { FTEManager } from "@/components/fte/FTEManager"
import { fteService } from "@/services/fte"
import type { FTEScale, FTEAssignment } from "@/services/fte"
import { useToast } from "@/components/ui/use-toast"

export default function FTEPage() {
  const { toast } = useToast()
  const [scales, setScales] = useState<FTEScale[]>([])
  const [assignments, setAssignments] = useState<FTEAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchData()
  }, [pagination.page, pagination.size])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [scalesData, assignmentsData] = await Promise.all([
        fteService.getFTEScales(),
        fteService.getFTEAssignments(pagination.page, pagination.size)
      ])
      setScales(scalesData)
      setAssignments(assignmentsData.items)
      setPagination(prev => ({
        ...prev,
        total: assignmentsData.total,
        pages: assignmentsData.pages
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch FTE data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveScales = async (updatedScales: FTEScale[]) => {
    try {
      // TODO: Implement batch update when backend supports it
      for (const scale of updatedScales) {
        if (scale.id) {
          await fteService.updateFTEScale(scale.id, {
            name: scale.name,
            type: scale.type,
            baseValue: scale.baseValue,
            equivalentFTE: scale.equivalentFTE
          })
        } else {
          await fteService.createFTEScale({
            name: scale.name,
            type: scale.type,
            baseValue: scale.baseValue,
            equivalentFTE: scale.equivalentFTE
          })
        }
      }
      setScales(updatedScales)
      toast({
        title: "Success",
        description: "FTE scales saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save FTE scales",
        variant: "destructive"
      })
    }
  }

  const handleSaveAssignments = async (updatedAssignments: FTEAssignment[]) => {
    try {
      // TODO: Implement batch update when backend supports it
      for (const assignment of updatedAssignments) {
        if (assignment.id) {
          await fteService.updateFTEAssignment(assignment.id, {
            scaleId: assignment.scaleId,
            targetType: assignment.targetType,
            targetId: assignment.targetId,
            value: assignment.value
          })
        } else {
          await fteService.createFTEAssignment({
            scaleId: assignment.scaleId,
            targetType: assignment.targetType,
            targetId: assignment.targetId,
            value: assignment.value
          })
        }
      }
      setAssignments(updatedAssignments)
      toast({
        title: "Success",
        description: "FTE assignments saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save FTE assignments",
        variant: "destructive"
      })
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSizeChange = (size: number) => {
    setPagination(prev => ({ ...prev, size, page: 1 }))
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">FTE Management</h1>
        </div>

        <FTEManager
          scales={scales}
          assignments={assignments}
          onSaveScales={handleSaveScales}
          onSaveAssignments={handleSaveAssignments}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSizeChange={handleSizeChange}
          isLoading={isLoading}
        />
      </div>
    </MainLayout>
  )
}
