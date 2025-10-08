
import { CalendarCheck, Users, Shield, Clock, ChartBar, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function Features() {
  const features = [
    {
      name: "Smart Scheduling",
      description: "Automatically generate optimal schedules based on staff availability and requirements.",
      icon: CalendarCheck,
    },
    {
      name: "Staff Management",
      description: "Easily manage staff profiles, qualifications, and availability in one place.",
      icon: Users,
    },
    {
      name: "Compliance Tracking",
      description: "Ensure scheduling compliance with healthcare regulations and staff certifications.",
      icon: Shield,
    },
    {
      name: "Real-time Updates",
      description: "Get instant notifications for schedule changes and shift updates.",
      icon: Clock,
    },
    {
      name: "Analytics Dashboard",
      description: "Track key metrics and optimize your workforce management with detailed insights.",
      icon: ChartBar,
    },
    {
      name: "Team Communication",
      description: "Built-in messaging system for seamless team coordination.",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage your healthcare staff
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our comprehensive platform provides all the tools you need for efficient healthcare workforce management.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-x-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <h3 className="text-lg font-semibold">{feature.name}</h3>
                  </div>
                  <p className="mt-4 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
