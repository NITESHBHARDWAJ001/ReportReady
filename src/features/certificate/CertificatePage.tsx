import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, Award, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/useAppStore'
import { exportSinglePage } from '@/lib/docxGenerator'
import { CertificatePreview } from '@/components/shared/CertificatePreview'
import type { CertificateData, CertificateType, CertificateDesign } from '@/types'

const CERT_TYPES: { id: CertificateType; label: string; desc: string }[] = [
  { id: 'completion', label: 'Completion', desc: 'Certifies project completion' },
  { id: 'appreciation', label: 'Appreciation', desc: 'Outstanding contribution' },
  { id: 'participation', label: 'Participation', desc: 'Event/workshop attendance' },
  { id: 'achievement', label: 'Achievement', desc: 'Award / rank winner' },
]

const DESIGNS: { id: CertificateDesign; label: string }[] = [
  { id: 'classic', label: 'Classic (ornate border)' },
  { id: 'modern', label: 'Modern (sidebar accent)' },
]

const schema = z.object({
  studentName: z.string().min(2, 'Required'),
  projectTitle: z.string().min(3, 'Required'),
  eventName: z.string().optional(),
  rank: z.string().optional(),
  guideName: z.string().min(2, 'Required'),
  collegeName: z.string().min(2, 'Required'),
  department: z.string().min(2, 'Required'),
  academicYear: z.string().min(4, 'Required'),
  date: z.string().min(4, 'Required'),
})

type FormValues = z.infer<typeof schema>

export default function CertificatePage() {
  const { certificateData, setCertificateData } = useAppStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: certificateData,
  })

  const watched = watch()
  const previewData: CertificateData = {
    ...certificateData,
    studentName: watched.studentName || certificateData.studentName,
    projectTitle: watched.projectTitle || certificateData.projectTitle,
    eventName: watched.eventName || certificateData.eventName,
    rank: watched.rank || certificateData.rank,
    guideName: watched.guideName || certificateData.guideName,
    collegeName: watched.collegeName || certificateData.collegeName,
    department: watched.department || certificateData.department,
    academicYear: watched.academicYear || certificateData.academicYear,
    date: watched.date || certificateData.date,
  }

  const onSave = (data: FormValues) => setCertificateData(data as Partial<CertificateData>)

  const handleDownload = handleSubmit(async (data) => {
    setCertificateData(data as Partial<CertificateData>)
    await exportSinglePage('certificate', { ...certificateData, ...data } as CertificateData)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificate Generator</h1>
        <p className="text-muted-foreground mt-1">
          Choose a certificate type and design, then download a ready-to-submit certificate.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: Form ── */}
        <div className="space-y-6">
          {/* Type + design picker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certificate Type</CardTitle>
              <CardDescription>What kind of certificate do you need?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {CERT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCertificateData({ type: t.id })}
                    className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                      certificateData.type === t.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-muted/40'
                    }`}
                  >
                    <div className="font-medium text-sm">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                  </button>
                ))}
              </div>

              {/* Design */}
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Design</Label>
                <div className="flex gap-2">
                  {DESIGNS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setCertificateData({ design: d.id })}
                      className={`flex-1 text-sm rounded-lg border px-3 py-2 transition-colors ${
                        certificateData.design === d.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent colour */}
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                <Label className="shrink-0 text-sm">Accent colour</Label>
                <input
                  type="color"
                  value={certificateData.accentColor}
                  onChange={(e) => setCertificateData({ accentColor: e.target.value })}
                  className="h-8 w-16 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="text-xs text-muted-foreground font-mono">{certificateData.accentColor}</span>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Certificate Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Student Name" error={errors.studentName?.message}>
                  <Input {...register('studentName')} placeholder="e.g. A. Priya" />
                </Field>
                <Field label="Project Title" error={errors.projectTitle?.message} className="sm:col-span-2">
                  <Input {...register('projectTitle')} placeholder="e.g. Smart Water Quality Monitor" />
                </Field>

                {(certificateData.type === 'participation' || certificateData.type === 'achievement') && (
                  <Field label={certificateData.type === 'achievement' ? 'Event / Competition Name' : 'Event Name'} className="sm:col-span-2">
                    <Input {...register('eventName')} placeholder="e.g. National Tech Fest 2024" />
                  </Field>
                )}

                {certificateData.type === 'achievement' && (
                  <Field label="Rank / Position">
                    <Input {...register('rank')} placeholder="e.g. 1st" />
                  </Field>
                )}

                <Field label="Guide Name" error={errors.guideName?.message}>
                  <Input {...register('guideName')} placeholder="e.g. Dr. R. Kumar" />
                </Field>
                <Field label="College Name" error={errors.collegeName?.message}>
                  <Input {...register('collegeName')} placeholder="e.g. Anna University" />
                </Field>
                <Field label="Department" error={errors.department?.message}>
                  <Input {...register('department')} placeholder="e.g. Computer Science" />
                </Field>
                <Field label="Academic Year" error={errors.academicYear?.message}>
                  <Input {...register('academicYear')} placeholder="e.g. 2024–2025" />
                </Field>
                <Field label="Date" error={errors.date?.message}>
                  <Input {...register('date')} placeholder="e.g. 15 June 2025" />
                </Field>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit">
                <Award className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button type="button" variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download Certificate
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="space-y-3">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Live Preview</h2>
              <span className="text-xs text-muted-foreground capitalize">{certificateData.type} · {certificateData.design}</span>
            </div>
            <div className="overflow-hidden rounded-xl border bg-zinc-100 dark:bg-zinc-900 p-3">
              <CertificatePreview data={previewData} scale={0.55} />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              A4 landscape preview — updates as you type
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
