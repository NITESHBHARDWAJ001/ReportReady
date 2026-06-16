import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { TooltipProvider } from '@/components/ui/tooltip'

/** Root layout: sidebar + header + scrollable content area + footer */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6 animate-fade-in">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
