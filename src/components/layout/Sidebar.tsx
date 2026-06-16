import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  CheckSquare,
  BookOpen,
  Award,
  FileText,
  Quote,
  Download,
  BookMarked,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload Report' },
  { to: '/format-requirements', icon: SlidersHorizontal, label: 'Format Requirements' },
  { to: '/format-checker', icon: CheckSquare, label: 'Format Checker' },
  { to: '/cover-generator', icon: BookOpen, label: 'Cover Generator' },
  { to: '/certificate', icon: Award, label: 'Certificate' },
  { to: '/declaration', icon: FileText, label: 'Declaration' },
  { to: '/references', icon: Quote, label: 'References' },
  { to: '/export', icon: Download, label: 'Export Center' },
] as const

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <BookMarked className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">ReportReady</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer badge */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground text-center">Academic Report Formatter</p>
          <p className="text-xs text-muted-foreground text-center">v1.0.0 · Fully Client-Side</p>
        </div>
      </aside>
    </>
  )
}
