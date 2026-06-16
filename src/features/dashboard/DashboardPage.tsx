import { useNavigate } from 'react-router-dom'
import {
  Upload,
  CheckSquare,
  BookOpen,
  Award,
  FileText,
  Quote,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/useAppStore'
import { scoreColor } from '@/lib/utils'

const QUICK_ACTIONS = [
  { to: '/upload', icon: Upload, label: 'Upload Report', desc: 'Parse your DOCX file', color: 'bg-blue-500' },
  { to: '/format-requirements', icon: SlidersHorizontal, label: 'Format Rules', desc: 'Set institution requirements', color: 'bg-violet-500' },
  { to: '/format-checker', icon: CheckSquare, label: 'Format Check', desc: 'Validate formatting rules', color: 'bg-purple-500' },
  { to: '/cover-generator', icon: BookOpen, label: 'Cover Page', desc: 'Generate cover page', color: 'bg-emerald-500' },
  { to: '/certificate', icon: Award, label: 'Certificate', desc: 'Certification page', color: 'bg-orange-500' },
  { to: '/declaration', icon: FileText, label: 'Declaration', desc: 'Student declaration', color: 'bg-pink-500' },
  { to: '/references', icon: Quote, label: 'References', desc: 'IEEE / APA / MLA', color: 'bg-teal-500' },
  { to: '/export', icon: Download, label: 'Export', desc: 'Download final DOCX', color: 'bg-indigo-500' },
] as const

export default function DashboardPage() {
  const navigate = useNavigate()
  const { parsedDoc, formatCheckResult, references, coverPageData } = useAppStore()

  const score = formatCheckResult?.score ?? 0
  const submissionReady = formatCheckResult?.submissionReady ?? false
  const issueCount = formatCheckResult?.issues.filter((i) => !i.passed).length ?? 0

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6 lg:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
              Welcome to ReportReady
            </h1>
            <p className="mt-1 text-muted-foreground max-w-xl">
              Automatically format your academic project report, generate mandatory pages, validate
              requirements, and export a submission-ready DOCX — entirely in your browser.
            </p>
            {!parsedDoc && (
              <Button className="mt-4" onClick={() => navigate('/upload')}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Your Report
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submission Readiness Dashboard */}
      {formatCheckResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Submission Readiness
                </CardTitle>
                <CardDescription>Based on your uploaded document analysis</CardDescription>
              </div>
              <Badge variant={submissionReady ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                {submissionReady ? '✓ Ready' : '✗ Not Ready'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}/100</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                label="Issues Found"
                value={issueCount}
                icon={issueCount > 0 ? AlertTriangle : CheckCircle2}
                color={issueCount > 0 ? 'text-yellow-600' : 'text-green-600'}
              />
              <StatCard
                label="Pages (est.)"
                value={parsedDoc?.estimatedPages ?? '—'}
                icon={FileText}
                color="text-blue-600"
              />
              <StatCard
                label="Word Count"
                value={parsedDoc?.wordCount.toLocaleString() ?? '—'}
                icon={TrendingUp}
                color="text-purple-600"
              />
              <StatCard
                label="References"
                value={references.length}
                icon={Quote}
                color="text-teal-600"
              />
            </div>

            {/* Missing sections */}
            {!formatCheckResult.submissionReady && (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 p-4">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Issues to resolve:
                </p>
                <ul className="space-y-1">
                  {formatCheckResult.issues
                    .filter((i) => !i.passed && i.severity !== 'info')
                    .map((issue) => (
                      <li key={issue.id} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        {issue.message}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document info if uploaded */}
      {parsedDoc && !formatCheckResult && (
        <Card>
          <CardHeader>
            <CardTitle>Document Uploaded</CardTitle>
            <CardDescription>Run the Format Checker to get your submission score.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Headings</p>
                <p className="font-medium">{parsedDoc.headings.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Words</p>
                <p className="font-medium">{parsedDoc.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Est. Pages</p>
                <p className="font-medium">{parsedDoc.estimatedPages}</p>
              </div>
            </div>
            <Button className="mt-4" variant="outline" onClick={() => navigate('/format-checker')}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Run Format Check
            </Button>
          </CardContent>
        </Card>
      )}

      {/* College profile reminder */}
      {!coverPageData.collegeName && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-full bg-primary/10 p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Set your college profile</p>
              <p className="text-sm text-muted-foreground">
                Fill in once — ReportReady auto-fills all pages.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/cover-generator')}>
              Set Up
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick actions grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group flex flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`rounded-md ${color} p-2`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
