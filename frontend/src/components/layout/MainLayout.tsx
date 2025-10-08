import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MenuIcon, X, Calendar, Users, MapPin, CreditCard, Settings, CalendarDays, CalendarRange, BarChart, LogOut, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Link, useNavigate } from 'react-router-dom'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Calendar },
    { name: "Staff", href: "/staff", icon: Users },
    { name: "FTE", href: "/fte", icon: BarChart },
    { name: "Locations", href: "/locations", icon: MapPin },
    { name: "Requests", href: "/leave", icon: CalendarRange },
    { name: "Roster", href: "/roster", icon: CalendarDays },
    { name: "Subscription", href: "/subscribe", icon: CreditCard }
    ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-background'>
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className='lg:hidden'>
          <Button variant='ghost' size='icon' className='fixed top-4 left-4'>
            <MenuIcon className='h-6 w-6' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-72'>
          <div className='flex h-full flex-col'>
            <div className='flex items-center justify-between border-b px-4 py-4'>
              <span className='text-lg font-semibold'>HealthRoster</span>
            </div>
            <nav className="flex-1 space-y-2 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className='flex'>
        <div className='hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0'>
          <div className='flex flex-col h-full border-r bg-card'>
            <div className='flex items-center justify-between h-16 px-6 border-b'>
              <span className='text-lg font-semibold'>HealthRoster</span>
            </div>
            <nav className="flex-1 space-y-2 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex-1 lg:pl-72">
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}