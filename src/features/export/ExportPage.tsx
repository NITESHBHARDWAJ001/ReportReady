import { useState } from 'react'
import {
  Download,
  FileText,
  BookOpen,
  Award,
  Quote,
  List,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/useAppStore'
import { exportFullReport, exportFormattedReport } from '@/lib/docxGenerator'

interface SectionToggle {
  id: 'cover' | 'certificate' | 'declaration' | 'toc' | 'mainReport' | 'references'
  label: string
  icon: React.ElementType
  description: string
}

const SECTIONS: SectionToggle[] = [
  { id: 'cover', label: 'Cover Page', icon: BookOpen, description: 'Title, college, and student info' },
  { id: 'certificate', label: 'Certificate Page', icon: Award, description: 'Bonafide certificate' },
  { id: 'declaration', label: 'Declaration Page', icon: FileText, description: 'Student declaration' },
  { id: 'toc', label: 'Table of Contents', icon: List, description: 'Auto-generated from headings' },
  { id: 'mainReport', label: 'Main Report Body', icon: FileText, description: 'Extracted document text' },
  { id: 'references', label: 'References', icon: Quote, description: 'IEEE formatted bibliography' },
]

const FONTS = ['Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Garamond']
const SPACINGS = [
  { label: 'Single (1.0)', value: '1' },
  { label: '1.15 spacing', value: '1.15' },
  { label: '1.5 spacing (recommended)', value: '1.5' },
  { label: 'Double (2.0)', value: '2' },
]

export default function ExportPage() {
  const {
    parsedDoc,
    coverPageData,
    certificateData,
    declarationData,
    references,
    formatOptions,
    setFormatOptions,
  } = useAppStore()

  const [sections, setSections] = useState<Record<string, boolean>>({
    cover: true,
    certificate: true,
    declaration: true,
    toc: !!parsedDoc,
    mainReport: !!parsedDoc,
    references: references.length > 0,
  })

  const [exporting, setExporting] = useState(false)
  const [formattingOnly, setFormattingOnly] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleSection = (id: string) =>
    setSections((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleExport = async () => {
    setExporting(true)
    setSuccess(false)
    try {
      await exportFullReport({
        coverPageData,
        certificateData,
        declarationData,
        headings: parsedDoc?.headings ?? [],
        references,
        mainContent: parsedDoc?.text ?? '',
        formatOptions,
        includeSections: sections as Parameters<typeof exportFullReport>[0]['includeSections'],
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e) {
      console.error(e)
    } finally {
      setExporting(false)
    }
  }

  const handleFormatOnly = async () => {
    if (!parsedDoc) return
    setFormattingOnly(true)
    try {
      await exportFormattedReport(parsedDoc.text, parsedDoc.headings, formatOptions)
    } catch (e) {
      console.error(e)
    } finally {
      setFormattingOnly(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export Center</h1>
        <p className="text-muted-foreground mt-1">
          Combine all sections into one submission-ready DOCX file.
        </p>
      </div>

      {success && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Download started!</strong> Check your downloads folder for{' '}
            <code>ReportReady_Export.docx</code>.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Include Sections</CardTitle>
            <CardDescription>Toggle which parts to include in the exported DOCX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SECTIONS.map(({ id, label, icon: Icon, description }) => {
              const enabled = sections[id] ?? false
              return (
                <div key={id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleSection(id)}
                    aria-label={`Toggle ${label}`}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Formatting options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Formatting Options
            </CardTitle>
            <CardDescription>Applied to the main report body</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Font Family</Label>
              <Select
                value={formatOptions.fontFamily}
                onValueChange={(v) => setFormatOptions({ fontFamily: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Font Size</Label>
              <Select
                value={String(formatOptions.fontSize)}
                onValueChange={(v) => setFormatOptions({ fontSize: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 11, 12, 13, 14].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}pt
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Line Spacing</Label>
              <Select
                value={String(formatOptions.lineSpacing)}
                onValueChange={(v) => setFormatOptions({ lineSpacing: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPACINGS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Page Margins</Label>
              <Select
                value={formatOptions.marginPreset}
                onValueChange={(v) =>
                  setFormatOptions({ marginPreset: v as 'narrow' | 'normal' | 'wide' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Narrow (0.5")</SelectItem>
                  <SelectItem value="normal">Normal (1" — recommended)</SelectItem>
                  <SelectItem value="wide">Wide (1.25" left)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Export actions */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {exporting ? 'Generating…' : 'Export Full Report'}
        </Button>

        {parsedDoc && (
          <Button size="lg" variant="outline" onClick={handleFormatOnly} disabled={formattingOnly}>
            {formattingOnly ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sliders className="mr-2 h-5 w-5" />
            )}
            {formattingOnly ? 'Formatting…' : 'Export Formatted Body Only'}
          </Button>
        )}
      </div>

      {!parsedDoc && !coverPageData.collegeName && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            For best results, upload your report and fill in cover page details before exporting.
            You can still export with just the pages you've filled in.
          </AlertDescription>
        </Alert>
      )}

      {/* What's included summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Export Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SECTIONS.map(({ id, label }) => (
              <div
                key={id}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm border ${
                  sections[id]
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
                    : 'border-border text-muted-foreground line-through'
                }`}
              >
                {sections[id] ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full border border-current shrink-0" />
                )}
                {label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
