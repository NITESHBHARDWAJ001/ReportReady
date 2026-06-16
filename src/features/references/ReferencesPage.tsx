import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Copy, Quote } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/store/useAppStore'
import type { Reference } from '@/types'

const schema = z.object({
  authors: z.string().min(1, 'Required'),
  title: z.string().min(1, 'Required'),
  year: z.string().min(4, 'Required'),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  url: z.string().optional(),
  type: z.enum(['journal', 'book', 'website', 'conference']),
})

type FormValues = z.infer<typeof schema>

function formatIEEE(ref: Reference, i: number): string {
  if (ref.type === 'journal')
    return `[${i}] ${ref.authors}, "${ref.title}," ${ref.journal || 'Journal'}, vol. ${ref.volume || 'X'}, no. ${ref.issue || 'X'}, pp. ${ref.pages || 'X–X'}, ${ref.year}.`
  if (ref.type === 'book')
    return `[${i}] ${ref.authors}, ${ref.title}. ${ref.publisher || 'Publisher'}, ${ref.year}.`
  if (ref.type === 'website')
    return `[${i}] ${ref.authors}, "${ref.title}," [Online]. Available: ${ref.url || 'URL'}. [Accessed ${ref.year}].`
  return `[${i}] ${ref.authors}, "${ref.title}," in Proc. Conference, ${ref.year}, pp. ${ref.pages || 'X–X'}.`
}

function formatAPA(ref: Reference): string {
  if (ref.type === 'journal')
    return `${ref.authors} (${ref.year}). ${ref.title}. *${ref.journal || 'Journal'}*, *${ref.volume || 'X'}*(${ref.issue || 'X'}), ${ref.pages || 'X–X'}.`
  if (ref.type === 'book')
    return `${ref.authors} (${ref.year}). *${ref.title}*. ${ref.publisher || 'Publisher'}.`
  if (ref.type === 'website')
    return `${ref.authors} (${ref.year}). ${ref.title}. Retrieved from ${ref.url || 'URL'}`
  return `${ref.authors} (${ref.year}). ${ref.title}. Paper presented at Conference.`
}

function formatMLA(ref: Reference): string {
  if (ref.type === 'journal')
    return `${ref.authors}. "${ref.title}." *${ref.journal || 'Journal'}* ${ref.volume || 'X'}.${ref.issue || 'X'} (${ref.year}): ${ref.pages || 'X–X'}.`
  if (ref.type === 'book')
    return `${ref.authors}. *${ref.title}*. ${ref.publisher || 'Publisher'}, ${ref.year}.`
  if (ref.type === 'website')
    return `${ref.authors}. "${ref.title}." Web. ${ref.year}. <${ref.url || 'URL'}>.`
  return `${ref.authors}. "${ref.title}." Conference (${ref.year}): ${ref.pages || 'X–X'}.`
}

export default function ReferencesPage() {
  const { references, addReference, removeReference } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'journal' },
  })

  const refType = watch('type')

  const onSubmit = (data: FormValues) => {
    addReference({ id: crypto.randomUUID(), ...data } as Reference)
    reset({ type: 'journal' })
    setShowForm(false)
  }

  const copyAll = async (style: 'ieee' | 'apa' | 'mla') => {
    const text = references
      .map((r, i) =>
        style === 'ieee' ? formatIEEE(r, i + 1) : style === 'apa' ? formatAPA(r) : formatMLA(r),
      )
      .join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(style)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">References Helper</h1>
          <p className="text-muted-foreground mt-1">
            Add references and export in IEEE, APA, or MLA format.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Reference
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Reference Type</Label>
                <Select
                  defaultValue="journal"
                  onValueChange={(v) => setValue('type', v as FormValues['type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">Journal Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="conference">Conference Paper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Authors" error={errors.authors?.message} className="sm:col-span-2">
                  <Input {...register('authors')} placeholder="e.g. J. Smith, A. Kumar" />
                </Field>
                <Field label="Title" error={errors.title?.message} className="sm:col-span-2">
                  <Input {...register('title')} placeholder="Paper / book title" />
                </Field>
                <Field label="Year" error={errors.year?.message}>
                  <Input {...register('year')} placeholder="e.g. 2024" />
                </Field>

                {(refType === 'journal' || refType === 'conference') && (
                  <>
                    <Field label={refType === 'journal' ? 'Journal' : 'Conference'}>
                      <Input {...register('journal')} placeholder="Publication name" />
                    </Field>
                    {refType === 'journal' && (
                      <>
                        <Field label="Volume">
                          <Input {...register('volume')} placeholder="e.g. 12" />
                        </Field>
                        <Field label="Issue">
                          <Input {...register('issue')} placeholder="e.g. 3" />
                        </Field>
                      </>
                    )}
                    <Field label="Pages">
                      <Input {...register('pages')} placeholder="e.g. 45–52" />
                    </Field>
                  </>
                )}

                {refType === 'book' && (
                  <Field label="Publisher">
                    <Input {...register('publisher')} placeholder="e.g. Springer" />
                  </Field>
                )}

                {refType === 'website' && (
                  <Field label="URL" className="sm:col-span-2">
                    <Input {...register('url')} placeholder="https://example.com" />
                  </Field>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Reference</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* References list with formatted previews */}
      {references.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {references.length} Reference{references.length !== 1 ? 's' : ''}
                </CardTitle>
                <CardDescription>Click a style tab to see formatted output</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ieee">
              <TabsList className="mb-4">
                <TabsTrigger value="ieee">IEEE</TabsTrigger>
                <TabsTrigger value="apa">APA</TabsTrigger>
                <TabsTrigger value="mla">MLA</TabsTrigger>
              </TabsList>

              {(['ieee', 'apa', 'mla'] as const).map((style) => (
                <TabsContent key={style} value={style}>
                  <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                    {references.map((ref, i) => (
                      <div key={ref.id} className="flex items-start gap-2 group">
                        <p className="text-sm flex-1 font-mono leading-relaxed">
                          {style === 'ieee'
                            ? formatIEEE(ref, i + 1)
                            : style === 'apa'
                              ? formatAPA(ref)
                              : formatMLA(ref)}
                        </p>
                        <button
                          onClick={() => removeReference(ref.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 shrink-0"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => copyAll(style)}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    {copied === style ? 'Copied!' : `Copy All ${style.toUpperCase()}`}
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Quote className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-medium">No references yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Add Reference" to start building your bibliography.
            </p>
          </CardContent>
        </Card>
      )}
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
