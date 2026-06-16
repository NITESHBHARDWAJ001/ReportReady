import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Upload,
  TrendingUp,
  Sliders,
  Settings2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppStore } from '@/store/useAppStore'
import { runFormatCheck } from '@/lib/formatChecker'
import { scoreColor } from '@/lib/utils'
import type { FormatIssue } from '@/types'

export default function FormatCheckerPage() {
  const navigate = useNavigate()
  const { parsedDoc, formatCheckResult, setFormatCheckResult } = useAppStore()
  const [running, setRunning] = useState(false)

  const { formatRequirements } = useAppStore()

  const handleRun = async () => {
    if (!parsedDoc) return
    setRunning(true)
    await new Promise((r) => setTimeout(r, 400))
    const result = runFormatCheck(parsedDoc, formatRequirements)
    setFormatCheckResult(result)
    setRunning(false)
  }

  if (!parsedDoc) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Format Checker</h1>
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            No document uploaded yet.{' '}
            <button className="underline text-primary" onClick={() => navigate('/upload')}>
              Upload a report
            </button>{' '}
            first.
          </AlertDescription>
        </Alert>
        <div className="rounded-lg border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-medium text-sm">Format Requirements</p>
            <p className="text-sm text-muted-foreground">
              Specify your institution's font, spacing, margin, and section rules before checking.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/format-requirements')}>
            <Settings2 className="mr-2 h-4 w-4" />
            Set Requirements
          </Button>
        </div>
      </div>
    )
  }

  const score = formatCheckResult?.score ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Format Checker</h1>
          <p className="text-muted-foreground mt-1">
            Validate your report against academic formatting requirements.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/format-requirements')}>
            <Settings2 className="mr-2 h-4 w-4" />
            Edit Requirements
          </Button>
        <Button onClick={handleRun} disabled={running}>
          {running ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="mr-2 h-4 w-4" />
          )}
          {running ? 'Checking…' : formatCheckResult ? 'Re-run Check' : 'Run Format Check'}
        </Button>
      </div>

      {formatCheckResult && (
        <>
          {/* Score card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Submission Readiness Score</CardTitle>
                  <CardDescription>
                    {formatCheckResult.issues.filter((i) => i.passed).length} of{' '}
                    {formatCheckResult.issues.length} checks passed
                  </CardDescription>
                </div>
                <Badge
                  variant={formatCheckResult.submissionReady ? 'success' : 'destructive'}
                  className="text-sm px-3 py-1"
                >
                  {formatCheckResult.submissionReady ? '✓ Ready to Submit' : '✗ Not Ready'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className={`text-5xl font-black tabular-nums ${scoreColor(score)}`}
                >
                  {score}
                </div>
                <div className="flex-1">
                  <Progress value={score} className="h-4" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>50 (Minimum)</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {!formatCheckResult.submissionReady && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => navigate('/cover-generator')}>
                    Fix Missing Pages
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/export')}>
                    <Sliders className="mr-2 h-4 w-4" />
                    Auto-Format
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues table */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formatCheckResult.issues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!formatCheckResult && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium">Click "Run Format Check" to analyse your document</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll check structure, headings, sections, and content length.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function IssueRow({ issue }: { issue: FormatIssue }) {
  const icons = {
    error: <XCircle className="h-4 w-4 text-destructive shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
  }

  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      {issue.passed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <span className="mt-0.5">{icons[issue.severity]}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {issue.category}
          </Badge>
          <span className={`text-sm font-medium ${issue.passed ? 'text-foreground' : 'text-destructive dark:text-red-400'}`}>
            {issue.message}
          </span>
        </div>
        {!issue.passed && (
          <p className="text-xs text-muted-foreground mt-1">{issue.suggestion}</p>
        )}
      </div>
      <Badge variant={issue.passed ? 'success' : issue.severity === 'error' ? 'destructive' : 'warning'} className="shrink-0">
        {issue.passed ? 'Pass' : issue.severity === 'error' ? 'Fail' : 'Warn'}
      </Badge>
    </div>
  )
}
