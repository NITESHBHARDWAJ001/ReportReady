/**
 * Formatting Requirements Page
 * Per-element TextStyle controls + all document formatting rules.
 */
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save, RotateCcw, Type, AlignLeft, Columns, FileType,
  Hash, BookMarked, CheckSquare, Info, Bold, Italic,
  Underline, AlignCenter, AlignJustify, AlignRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppStore, DEFAULT_FORMAT_REQUIREMENTS } from '@/store/useAppStore'
import type { FormatRequirements, TextStyle } from '@/types'

// ── Flat schema (maps to/from nested TextStyle) ───────────────
const textStyleSchema = z.object({
  fontFamily: z.string().min(1),
  fontSize: z.coerce.number().min(6).max(72),
  bold: z.boolean(),
  italic: z.boolean(),
  underline: z.boolean(),
  allCaps: z.boolean(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  alignment: z.enum(['left', 'center', 'right', 'justify']),
  spacingBefore: z.coerce.number().min(0).max(72),
  spacingAfter: z.coerce.number().min(0).max(72),
})

const schema = z.object({
  bodyStyle: textStyleSchema,
  h1Style: textStyleSchema,
  h2Style: textStyleSchema,
  h3Style: textStyleSchema,
  captionStyle: textStyleSchema,
  footerStyle: textStyleSchema,

  h1Numbering: z.enum(['none', 'numeric', 'chapter']),
  h2Numbering: z.enum(['none', 'numeric', 'alpha']),
  h3Numbering: z.enum(['none', 'numeric']),

  bodyLineSpacing: z.coerce.number(),
  firstLineIndent: z.boolean(),
  blockQuoteIndent: z.coerce.number().min(0).max(2),

  marginTop: z.coerce.number().min(0.5).max(3),
  marginBottom: z.coerce.number().min(0.5).max(3),
  marginLeft: z.coerce.number().min(0.5).max(3),
  marginRight: z.coerce.number().min(0.5).max(3),
  paperSize: z.enum(['A4', 'Letter']),

  pageNumberEnabled: z.boolean(),
  pageNumberFormat: z.enum(['arabic', 'roman', 'ROMAN', 'alpha']),
  pageNumberPosition: z.enum(['bottom-center', 'bottom-right', 'bottom-left', 'top-center', 'top-right']),
  pageNumberStartFrom: z.coerce.number().min(1),

  headerEnabled: z.boolean(),
  headerText: z.string(),
  footerEnabled: z.boolean(),
  footerText: z.string(),

  abstractMinWords: z.coerce.number().min(50).max(1000),
  abstractMaxWords: z.coerce.number().min(100).max(2000),
  referenceStyle: z.enum(['IEEE', 'APA', 'MLA']),

  requireCoverPage: z.boolean(),
  requireAbstract: z.boolean(),
  requireTableOfContents: z.boolean(),
  requireIntroduction: z.boolean(),
  requireConclusion: z.boolean(),
  requireReferences: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const FONTS = ['Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Garamond', 'Cambria', 'Palatino', 'Helvetica']
const LINE_SPACINGS = [
  { label: 'Single (1.0)', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5 (recommended)', value: '1.5' },
  { label: 'Double (2.0)', value: '2' },
]
const PAGE_NUMBER_FORMATS = [
  { label: '1, 2, 3 … (Arabic)', value: 'arabic' },
  { label: 'i, ii, iii … (Roman lower)', value: 'roman' },
  { label: 'I, II, III … (Roman upper)', value: 'ROMAN' },
  { label: 'a, b, c … (Alpha)', value: 'alpha' },
]
const PAGE_NUMBER_POSITIONS = [
  { label: 'Bottom Centre', value: 'bottom-center' },
  { label: 'Bottom Right', value: 'bottom-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Top Centre', value: 'top-center' },
  { label: 'Top Right', value: 'top-right' },
]

export default function FormatRequirementsPage() {
  const { formatRequirements, setFormatRequirements, setFormatOptions } = useAppStore()

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isDirty, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: formatRequirements as FormValues,
  })

  const pageNumEnabled = watch('pageNumberEnabled')
  const headerEnabled = watch('headerEnabled')
  const footerEnabled = watch('footerEnabled')

  const onSave = (values: FormValues) => {
    setFormatRequirements(values as FormatRequirements)
    setFormatOptions({
      fontFamily: values.bodyStyle.fontFamily,
      fontSize: values.bodyStyle.fontSize,
      lineSpacing: values.bodyLineSpacing,
      marginPreset:
        values.marginLeft >= 1.25 ? 'wide' : values.marginLeft <= 0.6 ? 'narrow' : 'normal',
    })
  }

  const handleReset = () => {
    reset(DEFAULT_FORMAT_REQUIREMENTS as FormValues)
    setFormatRequirements(DEFAULT_FORMAT_REQUIREMENTS)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Formatting Requirements</h1>
          <p className="text-muted-foreground mt-1">
            Specify your institution's exact formatting rules for every element.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset Defaults
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Set these once. The Format Checker uses them to validate your document, and Export applies
          them when generating the final DOCX.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">

        {/* ── 1. Body Text style ───────────────────────────── */}
        <Section icon={Type} title="Body Text" description="Main paragraph formatting rules">
          <div className="space-y-4">
            <TextStyleFields prefix="bodyStyle" control={control} register={register} watch={watch} />
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Line Spacing</Label>
                <Controller
                  name="bodyLineSpacing"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={v => field.onChange(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LINE_SPACINGS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5 flex flex-col justify-end">
                <Label>First-line Indent</Label>
                <div className="flex items-center gap-3 h-10">
                  <Controller
                    name="firstLineIndent"
                    control={control}
                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                  />
                  <span className="text-sm text-muted-foreground">
                    {watch('firstLineIndent') ? '0.5" indent' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. Heading 1 ─────────────────────────────────── */}
        <Section icon={AlignLeft} title="Heading 1 — Chapter Title" description="Style for top-level chapter headings">
          <TextStyleFields prefix="h1Style" control={control} register={register} watch={watch} />
          <Separator className="my-4" />
          <div className="space-y-1.5">
            <Label>Chapter numbering</Label>
            <Controller
              name="h1Numbering"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="numeric">Numeric (1. 2. 3.)</SelectItem>
                    <SelectItem value="chapter">Chapter (Chapter 1)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Section>

        {/* ── 3. Heading 2 ─────────────────────────────────── */}
        <Section icon={AlignLeft} title="Heading 2 — Section" description="Style for section headings within chapters">
          <TextStyleFields prefix="h2Style" control={control} register={register} watch={watch} />
          <Separator className="my-4" />
          <div className="space-y-1.5">
            <Label>Section numbering</Label>
            <Controller
              name="h2Numbering"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="numeric">Numeric (1.1 1.2)</SelectItem>
                    <SelectItem value="alpha">Alpha (A. B. C.)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Section>

        {/* ── 4. Heading 3 ─────────────────────────────────── */}
        <Section icon={AlignLeft} title="Heading 3 — Subsection" description="Style for sub-section headings">
          <TextStyleFields prefix="h3Style" control={control} register={register} watch={watch} />
        </Section>

        {/* ── 5. Captions ──────────────────────────────────── */}
        <Section icon={Type} title="Figure & Table Captions" description="Style used for image/table captions">
          <TextStyleFields prefix="captionStyle" control={control} register={register} watch={watch} />
        </Section>

        {/* ── 6. Margins ───────────────────────────────────── */}
        <Section icon={Columns} title="Page Margins" description="All values in inches">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['marginTop', 'marginBottom', 'marginLeft', 'marginRight'] as const).map((name, i) => (
              <div key={name} className="space-y-1.5">
                <Label>{['Top', 'Bottom', 'Left (binding)', 'Right'][i]} (in)</Label>
                <div className="flex items-center gap-1">
                  <Input type="number" step="0.25" min={0.5} max={3} {...register(name)} className="w-24" />
                  <span className="text-sm text-muted-foreground">"</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5">
            <Label>Paper Size</Label>
            <Controller
              name="paperSize"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Section>

        {/* ── 7. Page Numbers ──────────────────────────────── */}
        <Section icon={Hash} title="Page Numbering" description="Format, position, and starting page">
          <div className="flex items-center gap-3 mb-4">
            <Controller
              name="pageNumberEnabled"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} id="pn-en" />}
            />
            <Label htmlFor="pn-en">Enable page numbers</Label>
          </div>
          {pageNumEnabled && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Format</Label>
                <Controller
                  name="pageNumberFormat"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAGE_NUMBER_FORMATS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Controller
                  name="pageNumberPosition"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAGE_NUMBER_POSITIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Start from</Label>
                <Input type="number" min={1} {...register('pageNumberStartFrom')} className="w-24" />
              </div>
            </div>
          )}
        </Section>

        {/* ── 8. Header & Footer ───────────────────────────── */}
        <Section icon={FileType} title="Header & Footer" description="Running text above/below each page">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <Controller
                name="headerEnabled"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} id="hdr-en" />}
              />
              <Label htmlFor="hdr-en">Running header</Label>
            </div>
            {headerEnabled && (
              <Input {...register('headerText')} placeholder="e.g. Department of Computer Science — Project Report" />
            )}
          </div>
          <Separator />
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3">
              <Controller
                name="footerEnabled"
                control={control}
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} id="ftr-en" />}
              />
              <Label htmlFor="ftr-en">Running footer text</Label>
            </div>
            {footerEnabled && (
              <Input {...register('footerText')} placeholder="e.g. Anna University — B.E. Computer Science" />
            )}
          </div>
        </Section>

        {/* ── 9. Abstract ──────────────────────────────────── */}
        <Section icon={BookMarked} title="Abstract & References" description="Word count limits and citation style">
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="space-y-1.5">
              <Label>Min words</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={50} {...register('abstractMinWords')} className="w-28" />
                <span className="text-sm text-muted-foreground">words</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Max words</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={100} {...register('abstractMaxWords')} className="w-28" />
                <span className="text-sm text-muted-foreground">words</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reference style</Label>
            <Controller
              name="referenceStyle"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IEEE">IEEE</SelectItem>
                    <SelectItem value="APA">APA 7th ed.</SelectItem>
                    <SelectItem value="MLA">MLA 9th ed.</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </Section>

        {/* ── 10. Required Sections ────────────────────────── */}
        <Section icon={CheckSquare} title="Required Sections" description="Which sections must be present for the report to be submission-ready">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ['requireCoverPage', 'Cover Page'],
              ['requireAbstract', 'Abstract'],
              ['requireTableOfContents', 'Table of Contents'],
              ['requireIntroduction', 'Introduction'],
              ['requireConclusion', 'Conclusion'],
              ['requireReferences', 'References'],
            ] as const).map(([name, label]) => (
              <div key={name} className="flex items-center gap-3 rounded-lg border p-3">
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id={name} />
                  )}
                />
                <Label htmlFor={name} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
        </Section>

        {/* Sticky save bar */}
        <div className="sticky bottom-0 -mx-4 lg:-mx-6 bg-background/95 backdrop-blur border-t px-4 lg:px-6 py-3 flex items-center gap-3 z-10">
          <Button type="submit" size="lg">
            <Save className="mr-2 h-4 w-4" /> Save Requirements
          </Button>
          {isSubmitSuccessful && !isDirty && (
            <Badge variant="success" className="text-sm">
              ✓ Saved — Format Checker will use these rules
            </Badge>
          )}
          <p className="ml-auto text-xs text-muted-foreground hidden sm:block">
            Stored in your browser · Used by Format Checker &amp; Export
          </p>
        </div>
      </form>
    </div>
  )
}

// ── TextStyle block (reused for each element) ─────────────────
type StylePrefix = 'bodyStyle' | 'h1Style' | 'h2Style' | 'h3Style' | 'captionStyle' | 'footerStyle'

function TextStyleFields({
  prefix,
  control,
  register,
  watch,
}: {
  prefix: StylePrefix
  control: ReturnType<typeof useForm<FormValues>>['control']
  register: ReturnType<typeof useForm<FormValues>>['register']
  watch: ReturnType<typeof useForm<FormValues>>['watch']
}) {
  const p = prefix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentColor = ((watch as any)(`${p}.color`) as string) || '#000000'

  return (
    <div className="space-y-4">
      {/* Row 1: Font family + size */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Font Family</Label>
          <Controller
            name={`${p}.fontFamily` as Parameters<typeof control.register>[0]}
            control={control}
            render={({ field }) => (
              <Select value={field.value as string} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Size (pt)</Label>
          <Input
            type="number" min={6} max={72}
            {...register(`${p}.fontSize` as Parameters<typeof register>[0])}
            className="w-24"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Colour</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...register(`${p}.color` as Parameters<typeof register>[0])}
              className="h-9 w-14 cursor-pointer rounded border border-border bg-transparent"
            />
            <span className="text-xs font-mono text-muted-foreground">{currentColor}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Bold / Italic / Underline / ALL CAPS toggles */}
      <div className="flex flex-wrap gap-2">
        {([
          ['bold', 'B', Bold],
          ['italic', 'I', Italic],
          ['underline', 'U', Underline],
          ['allCaps', 'AA', null],
        ] as [keyof TextStyle, string, React.ElementType | null][]).map(([key, label, Icon]) => (
          <Controller
            key={key}
            name={`${p}.${key}` as Parameters<typeof control.register>[0]}
            control={control}
            render={({ field }) => (
              <button
                type="button"
                onClick={() => field.onChange(!field.value)}
                className={`h-9 w-10 rounded border text-sm font-medium transition-colors
                  ${field.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/50'
                  }`}
                title={String(key)}
              >
                {Icon ? <Icon className="h-3.5 w-3.5 mx-auto" /> : label}
              </button>
            )}
          />
        ))}

        {/* Alignment */}
        <div className="flex gap-1 ml-2">
          {([
            ['left', AlignLeft],
            ['center', AlignCenter],
            ['right', AlignRight],
            ['justify', AlignJustify],
          ] as [TextStyle['alignment'], React.ElementType][]).map(([val, Icon]) => (
            <Controller
              key={val}
              name={`${p}.alignment` as Parameters<typeof control.register>[0]}
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(val)}
                  className={`h-9 w-9 rounded border transition-colors flex items-center justify-center
                    ${field.value === val
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-primary/50'
                    }`}
                  title={val}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )}
            />
          ))}
        </div>
      </div>

      {/* Row 3: Spacing before / after */}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Space Before (pt)</Label>
          <Input type="number" min={0} max={72}
            {...register(`${p}.spacingBefore` as Parameters<typeof register>[0])}
            className="w-20 h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Space After (pt)</Label>
          <Input type="number" min={0} max={72}
            {...register(`${p}.spacingAfter` as Parameters<typeof register>[0])}
            className="w-20 h-8 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// ── Layout helpers ────────────────────────────────────────────
function Section({ icon: Icon, title, description, children }: {
  icon: React.ElementType; title: string; description: string; children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
