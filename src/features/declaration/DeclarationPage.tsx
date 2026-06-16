import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/useAppStore'
import { exportSinglePage } from '@/lib/docxGenerator'
import type { DeclarationData } from '@/types'

const schema = z.object({
  studentName: z.string().min(2, 'Required'),
  rollNumber: z.string().min(1, 'Required'),
  projectTitle: z.string().min(3, 'Required'),
  collegeName: z.string().min(2, 'Required'),
  department: z.string().min(2, 'Required'),
  guideName: z.string().min(2, 'Required'),
  date: z.string().min(4, 'Required'),
})

type FormValues = z.infer<typeof schema>

export default function DeclarationPage() {
  const { declarationData, setDeclarationData } = useAppStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: declarationData,
  })

  const values = watch()

  const onSave = (data: FormValues) => setDeclarationData(data)

  const handleDownload = handleSubmit(async (data) => {
    setDeclarationData(data)
    await exportSinglePage('declaration', data as DeclarationData)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Declaration Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate a student declaration page for your project report.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Declaration Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Student Name" error={errors.studentName?.message}>
              <Input {...register('studentName')} placeholder="e.g. A. Priya" />
            </Field>
            <Field label="Roll Number" error={errors.rollNumber?.message}>
              <Input {...register('rollNumber')} placeholder="e.g. 21CS001" />
            </Field>
            <Field label="Project Title" error={errors.projectTitle?.message} className="sm:col-span-2">
              <Input {...register('projectTitle')} placeholder="Project title" />
            </Field>
            <Field label="College Name" error={errors.collegeName?.message}>
              <Input {...register('collegeName')} placeholder="e.g. Anna University" />
            </Field>
            <Field label="Department" error={errors.department?.message}>
              <Input {...register('department')} placeholder="e.g. Computer Science" />
            </Field>
            <Field label="Guide Name" error={errors.guideName?.message}>
              <Input {...register('guideName')} placeholder="e.g. Dr. R. Kumar" />
            </Field>
            <Field label="Date" error={errors.date?.message}>
              <Input {...register('date')} placeholder="e.g. 16 June 2026" />
            </Field>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Declaration
          </Button>
        </div>
      </form>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white dark:bg-zinc-900 p-8 font-serif space-y-6 shadow-inner">
            <h2 className="text-xl font-bold text-center uppercase tracking-wider">Declaration</h2>
            <p className="text-sm leading-relaxed">
              I, <strong>{values.studentName || 'Student Name'}</strong> (Roll No:{' '}
              <strong>{values.rollNumber || '——'}</strong>), hereby declare that the project entitled{' '}
              <strong>"{values.projectTitle || 'Project Title'}"</strong> submitted in partial
              fulfilment of the requirements for the completion of the course in the Department of{' '}
              <strong>{values.department || 'Department'}</strong>,{' '}
              <strong>{values.collegeName || 'College Name'}</strong>, is a record of original work
              carried out by me under the supervision of{' '}
              <strong>{values.guideName || 'Guide Name'}</strong>.
            </p>
            <p className="text-sm leading-relaxed">
              I further declare that this project has not been submitted, either in full or in part,
              to any other university or institution for the award of any degree or diploma.
            </p>
            <div className="flex justify-between pt-6 text-sm">
              <div>
                <p>Place: ___________</p>
                <p className="mt-2">Date: {values.date || '——'}</p>
              </div>
              <div className="text-right">
                <div className="border-b border-foreground/40 w-36 mb-1" />
                <p className="font-semibold">Signature</p>
                <p className="text-muted-foreground">{values.studentName || 'Student Name'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
