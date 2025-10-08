
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Streamline Your Healthcare Staffing
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Efficiently manage your healthcare facility&apos;s roster and staff scheduling. Save time, reduce errors, and ensure optimal coverage with our intelligent roster management system.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">View pricing</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
