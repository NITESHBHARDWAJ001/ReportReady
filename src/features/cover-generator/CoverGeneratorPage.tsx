import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Download, Image, X, Building2, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppStore } from '@/store/useAppStore'
import { exportSinglePage } from '@/lib/docxGenerator'
import { CoverPreview } from '@/components/shared/CoverPreview'
import type { CoverPageData, CoverTemplate } from '@/types'

const TEMPLATES: { id: CoverTemplate; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classic Academic', desc: 'Centered layout with horizontal rules' },
  { id: 'modern-banner', label: 'Modern Banner', desc: 'Color header band, clean typography' },
  { id: 'bordered', label: 'Bordered Box', desc: 'Double-border with decorative corners' },
  { id: 'split', label: 'Split Layout', desc: 'Vertical accent sidebar with main content' },
  { id: 'minimal', label: 'Minimal Clean', desc: 'Whitespace-first, editorial style' },
]

const schema = z.object({
  collegeName: z.string().min(2, 'Required'),
  department: z.string().min(2, 'Required'),
  projectTitle: z.string().min(3, 'Required'),
  studentName: z.string().min(2, 'Required'),
  rollNumber: z.string().min(1, 'Required'),
  registrationNumber: z.string().min(1, 'Required'),
  guideName: z.string().min(2, 'Required'),
  academicYear: z.string().min(4, 'Required'),
})

type FormValues = z.infer<typeof schema>

export default function CoverGeneratorPage() {
  const { coverPageData, setCoverPageData, setUserProfile } = useAppStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: coverPageData,
  })

  const watched = watch()
  const previewData: CoverPageData = {
    ...coverPageData,
    collegeName: watched.collegeName || coverPageData.collegeName,
    department: watched.department || coverPageData.department,
    projectTitle: watched.projectTitle || coverPageData.projectTitle,
    studentName: watched.studentName || coverPageData.studentName,
    rollNumber: watched.rollNumber || coverPageData.rollNumber,
    registrationNumber: watched.registrationNumber || coverPageData.registrationNumber,
    guideName: watched.guideName || coverPageData.guideName,
    academicYear: watched.academicYear || coverPageData.academicYear,
  }

  const onLogoDrop = useCallback(
    (files: File[]) => {
      const file = files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setCoverPageData({ logoBase64: base64 })
        setUserProfile({ logoBase64: base64 })
      }
      reader.readAsDataURL(file)
    },
    [setCoverPageData, setUserProfile],
  )

  const { getRootProps: getLogoProps, getInputProps: getLogoInput } = useDropzone({
    onDrop: onLogoDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
  })

  const onSave = (values: FormValues) => {
    setCoverPageData(values)
    setUserProfile({
      collegeName: values.collegeName,
      department: values.department,
      guideName: values.guideName,
      academicYear: values.academicYear,
    })
  }

  const handleDownload = handleSubmit(async (values) => {
    setCoverPageData(values)
    await exportSinglePage('cover', { ...coverPageData, ...values } as CoverPageData)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cover Page Generator</h1>
        <p className="text-muted-foreground mt-1">
          Choose a template, fill in details, and download a submission-ready cover page.
        </p>
      </div>

      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          Your college information is saved locally and auto-filled on future visits.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: Form ── */}
        <div className="space-y-6">
          {/* Template picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template</CardTitle>
              <CardDescription>Pick a layout style for your cover page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCoverPageData({ template: t.id })}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                    coverPageData.template === t.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/40'
                  }`}
                >
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.desc}</div>
                </button>
              ))}

              {/* Accent colour */}
              <div className="flex items-center gap-3 pt-2">
                <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                <Label className="shrink-0">Accent colour</Label>
                <input
                  type="color"
                  value={coverPageData.accentColor}
                  onChange={(e) => setCoverPageData({ accentColor: e.target.value })}
                  className="h-8 w-16 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="text-xs text-muted-foreground font-mono">{coverPageData.accentColor}</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">College Logo</CardTitle>
                <CardDescription>Upload once, stored in your browser</CardDescription>
              </CardHeader>
              <CardContent>
                {coverPageData.logoBase64 ? (
                  <div className="flex items-center gap-4">
                    <img src={coverPageData.logoBase64} alt="logo" className="h-20 w-20 object-contain rounded border" />
                    <div>
                      <p className="text-sm font-medium">Logo uploaded</p>
                      <p className="text-xs text-muted-foreground">Stored locally</p>
                      <Button
                        type="button" variant="ghost" size="sm"
                        className="mt-2 text-destructive"
                        onClick={() => setCoverPageData({ logoBase64: undefined })}
                      >
                        <X className="mr-1 h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getLogoProps()}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <input {...getLogoInput()} />
                    <Image className="h-7 w-7 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Upload college logo</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG · Max 2 MB</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Institution */}
            <Card>
              <CardHeader><CardTitle className="text-base">Institution Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="College Name" error={errors.collegeName?.message}>
                  <Input placeholder="e.g. Anna University" {...register('collegeName')} />
                </Field>
                <Field label="Department" error={errors.department?.message}>
                  <Input placeholder="e.g. Computer Science & Engineering" {...register('department')} />
                </Field>
                <Field label="Guide Name" error={errors.guideName?.message}>
                  <Input placeholder="e.g. Dr. R. Kumar" {...register('guideName')} />
                </Field>
                <Field label="Academic Year" error={errors.academicYear?.message}>
                  <Input placeholder="e.g. 2024–2025" {...register('academicYear')} />
                </Field>
              </CardContent>
            </Card>

            {/* Student */}
            <Card>
              <CardHeader><CardTitle className="text-base">Student Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Project Title" error={errors.projectTitle?.message} className="sm:col-span-2">
                  <Input placeholder="e.g. Smart Water Quality Monitoring System" {...register('projectTitle')} />
                </Field>
                <Field label="Student Name" error={errors.studentName?.message}>
                  <Input placeholder="e.g. A. Priya" {...register('studentName')} />
                </Field>
                <Field label="Roll Number" error={errors.rollNumber?.message}>
                  <Input placeholder="e.g. 21CS001" {...register('rollNumber')} />
                </Field>
                <Field label="Registration Number" error={errors.registrationNumber?.message}>
                  <Input placeholder="e.g. 711521104001" {...register('registrationNumber')} />
                </Field>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Save Details
              </Button>
              <Button type="button" variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download Cover Page
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="space-y-3">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Live Preview</h2>
              <span className="text-xs text-muted-foreground">Updates as you type</span>
            </div>
            <div className="overflow-hidden rounded-xl border bg-zinc-100 dark:bg-zinc-900 p-3">
              <div style={{ transformOrigin: 'top center' }}>
                <CoverPreview data={previewData} scale={0.55} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Approximate A4 preview — actual PDF may differ slightly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, error, children, className,
}: {
  label: string; error?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
