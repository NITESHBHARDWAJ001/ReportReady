import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          {/* Author info */}
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            <p className="font-medium text-foreground">Built by a Developer</p>
            <p className="font-medium text-foreground">Nitesh Sharma</p>
            
            <p>niteshsharmans775@gmail.com</p>
          </div>

          {/* CTA button */}
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built for Digital Heroes
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} ReportReady · Fully client-side · No data leaves your browser
          </p>
        </div>
      </div>
    </footer>
  )
}
