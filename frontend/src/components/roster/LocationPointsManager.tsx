
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { defaultLocations } from "@/lib/roles"
import { LocationPoints } from "@/lib/roster"
import { Slider } from "@/components/ui/slider"

interface LocationPointsManagerProps {
  onSave: (points: LocationPoints[]) => void
  initialPoints?: LocationPoints[]
}

export function LocationPointsManager({ onSave, initialPoints = [] }: LocationPointsManagerProps) {
  const [locationPoints, setLocationPoints] = useState<LocationPoints[]>(
    initialPoints.length ? initialPoints : defaultLocations.map(location => ({
      locationId: location.id,
      points: {
        clinical: 10,
        admin: 5,
        research: 5,
        emergency: 15
      }
    }))
  )

  const handlePointChange = (locationId: string, type: keyof LocationPoints["points"], value: number) => {
    setLocationPoints(points => points.map(point => 
      point.locationId === locationId
        ? { ...point, points: { ...point.points, [type]: value } }
        : point
    ))
  }

  const calculateWeeklyFTE = (points: LocationPoints["points"]): number => {
    const totalPoints = Object.values(points).reduce((sum, value) => sum + value, 0)
    return Number((totalPoints / 50).toFixed(2)) // Assuming 50 points = 1.0 FTE
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>FTE and Shift Points Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="mb-4 p-4 bg-secondary rounded-lg">
          <h3 className="font-medium mb-2">Weekly FTE Scale</h3>
          <p className="text-sm text-muted-foreground">
            1.0 FTE = 50 points per week (10 sessions)
          </p>
          <p className="text-sm text-muted-foreground">
            0.5 FTE = 25 points per week (5 sessions)
          </p>
          <p className="text-sm text-muted-foreground">
            0.2 FTE = 10 points per week (2 sessions)
          </p>
        </div>

        {locationPoints.map((point) => {
          const location = defaultLocations.find(l => l.id === point.locationId)
          const weeklyFTE = calculateWeeklyFTE(point.points)
          
          return (
            <div key={point.locationId} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{location?.name}</h3>
                <span className="text-sm font-medium">
                  Weekly FTE: {weeklyFTE}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(point.points).map(([type, value]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium capitalize">
                        {type} Points
                      </label>
                      <span className="text-sm text-muted-foreground">
                        FTE: {(value / 50).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-4 items-center">
                      <Slider
                        value={[value]}
                        min={0}
                        max={50}
                        step={5}
                        onValueChange={([newValue]) => handlePointChange(
                          point.locationId,
                          type as keyof LocationPoints["points"],
                          newValue
                        )}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => handlePointChange(
                          point.locationId,
                          type as keyof LocationPoints["points"],
                          parseInt(e.target.value) || 0
                        )}
                        min={0}
                        max={50}
                        step={5}
                        className="w-20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <Button onClick={() => onSave(locationPoints)}>
          Save FTE Configuration
        </Button>
      </CardContent>
    </Card>
  )
}
