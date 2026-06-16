import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  List,
  Hash,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/useAppStore'
import { parseDocxFile } from '@/lib/documentParser'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'parsing' | 'done' | 'error'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setUploadedFile, setParsedDoc, resetDocument, parsedDoc } = useAppStore()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [localFile, setLocalFile] = useState<File | null>(null)

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return

      setLocalFile(file)
      setStatus('parsing')
      setError('')
      resetDocument()

      try {
        const doc = await parseDocxFile(file)
        setUploadedFile(file)
        setParsedDoc(doc)
        setStatus('done')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse document')
        setStatus('error')
      }
    },
    [resetDocument, setUploadedFile, setParsedDoc],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20 MB
  })

  const handleClear = () => {
    setLocalFile(null)
    setStatus('idle')
    setError('')
    resetDocument()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Report</h1>
        <p className="text-muted-foreground mt-1">
          Upload your DOCX project report to analyse its structure and content.
        </p>
      </div>

      {/* Drop zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer',
              isDragActive
                ? 'border-primary bg-primary/5'
                : status === 'done'
                  ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
                  : status === 'error'
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-primary hover:bg-primary/5',
            )}
          >
            <input {...getInputProps()} />

            {status === 'parsing' && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                <p className="font-medium">Parsing document…</p>
                <p className="text-sm text-muted-foreground">Extracting headings and content</p>
              </>
            )}

            {status === 'done' && localFile && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
                <p className="font-medium text-green-700 dark:text-green-400">{localFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(localFile.size / 1024).toFixed(1)} KB · Parsed successfully
                </p>
              </>
            )}

            {status === 'idle' && (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium">
                  {isDragActive ? 'Drop your DOCX here' : 'Drag & drop your DOCX file'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse · Max 20 MB</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 text-destructive mb-3" />
                <p className="font-medium text-destructive">Upload failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </>
            )}
          </div>

          {status === 'done' && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => navigate('/format-checker')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Run Format Check
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parsed document summary */}
      {parsedDoc && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MetaCard icon={Hash} label="Words" value={parsedDoc.wordCount.toLocaleString()} />
          <MetaCard icon={FileText} label="Est. Pages" value={String(parsedDoc.estimatedPages)} />
          <MetaCard icon={List} label="Headings" value={String(parsedDoc.headings.length)} />
        </div>
      )}

      {/* Sections detected */}
      {parsedDoc && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mandatory Sections</CardTitle>
            <CardDescription>Auto-detected from document content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <SectionBadge label="Cover Page" present={parsedDoc.hasCoverPage} />
              <SectionBadge label="Abstract" present={parsedDoc.hasAbstract} />
              <SectionBadge label="References" present={parsedDoc.hasReferences} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Headings list */}
      {parsedDoc && parsedDoc.headings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Document Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 rounded-md border p-3">
              {parsedDoc.headings.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1"
                  style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
                >
                  <Badge variant="outline" className="text-xs font-mono shrink-0">
                    H{h.level}
                  </Badge>
                  <span className={cn('text-sm truncate', h.level === 1 && 'font-medium')}>
                    {h.text}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Supported format</AlertTitle>
        <AlertDescription>
          Only <strong>.docx</strong> files are supported. Your file is processed entirely in your
          browser — it is never uploaded to any server.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function MetaCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <Icon className="h-8 w-8 text-primary" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SectionBadge({ label, present }: { label: string; present: boolean }) {
  return (
    <Badge variant={present ? 'success' : 'destructive'} className="gap-1 text-sm px-3 py-1">
      {present ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {label}
    </Badge>
  )
}
