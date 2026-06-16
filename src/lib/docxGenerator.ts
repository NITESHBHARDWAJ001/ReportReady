/**
 * Generates DOCX files using the docx library.
 * All generation is done client-side in the browser.
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  ImageRun,
  Footer,
  PageNumber,
  NumberFormat,
  SectionType,
  convertInchesToTwip,
} from 'docx'
import { saveAs } from 'file-saver'
import type { CoverPageData, CertificateData, DeclarationData, Reference, Heading, FormatOptions } from '@/types'

// ── Margin presets (in twips – 1 inch = 1440 twips) ────────
const MARGIN_PRESETS = {
  narrow: { top: 720, right: 720, bottom: 720, left: 720 },
  normal: { top: 1440, right: 1080, bottom: 1440, left: 1440 },
  wide: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
} as const

// ── Font size helper (docx uses half-points) ─────────────────
const pt = (size: number) => size * 2

/** Build the cover page section paragraphs */
function buildCoverPage(data: CoverPageData, logoBase64?: string): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({ text: '', spacing: { before: pt(36) } }),
  ]

  // Logo
  if (logoBase64) {
    try {
      const base64Data = logoBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: base64Data,
              transformation: { width: 100, height: 100 },
            } as ConstructorParameters<typeof ImageRun>[0]),
          ],
        }),
      )
    } catch {
      // Skip logo if base64 is invalid
    }
  }

  paragraphs.push(
    new Paragraph({
      text: data.collegeName || 'College Name',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: data.department || 'Department',
      alignment: AlignmentType.CENTER,
      spacing: { after: pt(12) },
      children: [new TextRun({ text: data.department || 'Department', size: pt(14), bold: false })],
    }),
    new Paragraph({ text: '', spacing: { before: pt(36) } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'PROJECT REPORT', size: pt(16), bold: true, allCaps: true })],
    }),
    new Paragraph({ text: '', spacing: { before: pt(12) } }),
    new Paragraph({
      text: data.projectTitle || 'Project Title',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: pt(48) } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Submitted by', size: pt(12), italics: true })],
    }),
    new Paragraph({ text: '', spacing: { before: pt(6) } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.studentName || 'Student Name', size: pt(14), bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Roll No: ${data.rollNumber || '—'}`, size: pt(12) })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Reg. No: ${data.registrationNumber || '—'}`, size: pt(12) })],
    }),
    new Paragraph({ text: '', spacing: { before: pt(24) } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Under the guidance of', size: pt(12), italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.guideName || 'Guide Name', size: pt(13), bold: true })],
    }),
    new Paragraph({ text: '', spacing: { before: pt(48) } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: data.academicYear || 'Academic Year', size: pt(12) })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  )

  return paragraphs
}

/** Build certificate page */
function buildCertificate(data: CertificateData): Paragraph[] {
  return [
    new Paragraph({ text: '', spacing: { before: pt(24) } }),
    new Paragraph({
      text: 'CERTIFICATE',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: pt(24) } }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 480, before: pt(12) }, // double spacing
      children: [
        new TextRun({
          text: `This is to certify that the project entitled "${data.projectTitle || 'Project Title'}" is a bonafide record of work done by `,
          size: pt(12),
        }),
        new TextRun({ text: data.studentName || 'Student Name', size: pt(12), bold: true }),
        new TextRun({
          text: ` in partial fulfilment of the requirements for the award of the degree from the Department of ${data.department || 'Department'}, ${data.collegeName || 'College Name'}, during the academic year ${data.academicYear || '——'}.`,
          size: pt(12),
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { before: pt(48) } }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Project Guide', size: pt(12), bold: true }),
        new TextRun({ text: '                                                         ', size: pt(12) }),
        new TextRun({ text: 'Head of Department', size: pt(12), bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: data.guideName || '——', size: pt(12) }),
        new TextRun({ text: '                                                              ', size: pt(12) }),
        new TextRun({ text: data.department || '——', size: pt(12) }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

/** Build declaration page */
function buildDeclaration(data: DeclarationData): Paragraph[] {
  return [
    new Paragraph({ text: '', spacing: { before: pt(24) } }),
    new Paragraph({
      text: 'DECLARATION',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: pt(24) } }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 480, before: pt(12) },
      children: [
        new TextRun({
          text: `I, ${data.studentName || 'Student Name'} (Roll No: ${data.rollNumber || '——'}), hereby declare that the project entitled "${data.projectTitle || 'Project Title'}" submitted in partial fulfilment of the requirements for the completion of the course in the Department of ${data.department || 'Department'}, ${data.collegeName || 'College Name'}, is a record of original work carried out by me under the supervision of ${data.guideName || 'Guide Name'}.`,
          size: pt(12),
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { line: 480, before: pt(12) },
      children: [
        new TextRun({
          text: 'I further declare that this project has not been submitted, either in full or in part, to any other university or institution for the award of any degree or diploma.',
          size: pt(12),
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { before: pt(48) } }),
    new Paragraph({
      children: [
        new TextRun({ text: `Place: `, size: pt(12) }),
        new TextRun({ text: '                            ', size: pt(12) }),
        new TextRun({ text: 'Signature of Student', size: pt(12), bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Date: ${data.date || '——'}`, size: pt(12) }),
        new TextRun({ text: '                           ', size: pt(12) }),
        new TextRun({ text: data.studentName || '——', size: pt(12) }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

/** Build Table of Contents from headings */
function buildTOC(headings: Heading[]): Paragraph[] {
  const items: Paragraph[] = [
    new Paragraph({
      text: 'TABLE OF CONTENTS',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: pt(12) } }),
  ]

  headings.forEach((h, idx) => {
    const indent = (h.level - 1) * 360 // 0.25-inch per level
    const prefix = h.level === 1 ? `${idx + 1}. ` : ''
    items.push(
      new Paragraph({
        indent: { left: indent },
        children: [
          new TextRun({
            text: `${prefix}${h.text}`,
            size: pt(h.level === 1 ? 12 : 11),
            bold: h.level === 1,
          }),
        ],
      }),
    )
  })

  items.push(new Paragraph({ children: [new PageBreak()] }))
  return items
}

/** Format references in IEEE style */
function formatIEEEReference(ref: Reference, index: number): string {
  const authors = ref.authors || 'Unknown Author'
  if (ref.type === 'journal') {
    return `[${index}] ${authors}, "${ref.title}," ${ref.journal || 'Journal'}, vol. ${ref.volume || 'X'}, no. ${ref.issue || 'X'}, pp. ${ref.pages || 'X–X'}, ${ref.year}.`
  }
  if (ref.type === 'book') {
    return `[${index}] ${authors}, ${ref.title}. ${ref.publisher || 'Publisher'}, ${ref.year}.`
  }
  if (ref.type === 'website') {
    return `[${index}] ${authors}, "${ref.title}," [Online]. Available: ${ref.url || 'URL'}. [Accessed ${ref.year}].`
  }
  return `[${index}] ${authors}, "${ref.title}," ${ref.year}.`
}

/** Build references section */
function buildReferences(refs: Reference[]): Paragraph[] {
  if (!refs.length) return []
  return [
    new Paragraph({
      text: 'REFERENCES',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: pt(12) } }),
    ...refs.map(
      (ref, i) =>
        new Paragraph({
          spacing: { before: pt(6), after: pt(6) },
          children: [new TextRun({ text: formatIEEEReference(ref, i + 1), size: pt(11) })],
        }),
    ),
  ]
}

/** Full export: combine all sections into one DOCX */
export async function exportFullReport(options: {
  coverPageData?: CoverPageData
  certificateData?: CertificateData
  declarationData?: DeclarationData
  headings?: Heading[]
  references?: Reference[]
  mainContent?: string
  formatOptions?: FormatOptions
  includeSections: {
    cover: boolean
    certificate: boolean
    declaration: boolean
    toc: boolean
    mainReport: boolean
    references: boolean
  }
}): Promise<void> {
  const {
    coverPageData,
    certificateData,
    declarationData,
    headings = [],
    references = [],
    mainContent = '',
    formatOptions,
    includeSections,
  } = options

  const margins = MARGIN_PRESETS[formatOptions?.marginPreset ?? 'normal']
  const fontSize = pt(formatOptions?.fontSize ?? 12)
  const fontFamily = formatOptions?.fontFamily ?? 'Times New Roman'

  const frontMatterParagraphs: Paragraph[] = []

  if (includeSections.cover && coverPageData) {
    frontMatterParagraphs.push(...buildCoverPage(coverPageData, coverPageData.logoBase64))
  }
  if (includeSections.certificate && certificateData) {
    frontMatterParagraphs.push(...buildCertificate(certificateData))
  }
  if (includeSections.declaration && declarationData) {
    frontMatterParagraphs.push(...buildDeclaration(declarationData))
  }
  if (includeSections.toc && headings.length > 0) {
    frontMatterParagraphs.push(...buildTOC(headings))
  }

  // Main report body paragraphs
  const bodyParagraphs: Paragraph[] = []
  if (includeSections.mainReport && mainContent) {
    const lines = mainContent.split('\n')
    for (const line of lines) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { line: Math.round((formatOptions?.lineSpacing ?? 1.5) * 240) },
          children: [new TextRun({ text: line, size: fontSize, font: fontFamily })],
        }),
      )
    }
  }

  if (includeSections.references && references.length > 0) {
    bodyParagraphs.push(...buildReferences(references))
  }

  const doc = new Document({
    sections: [
      // Front matter section (no page numbers)
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: { margin: margins },
        },
        children: frontMatterParagraphs.length > 0 ? frontMatterParagraphs : [new Paragraph('')],
      },
      // Main body with page numbers
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            margin: margins,
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: bodyParagraphs.length > 0 ? bodyParagraphs : [new Paragraph('')],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, 'ReportReady_Export.docx')
}

/** Export only a single page (cover/cert/decl) for preview */
export async function exportSinglePage(
  type: 'cover' | 'certificate' | 'declaration',
  data: CoverPageData | CertificateData | DeclarationData,
): Promise<void> {
  let paragraphs: Paragraph[] = []
  let filename = 'page.docx'

  if (type === 'cover') {
    paragraphs = buildCoverPage(data as CoverPageData, (data as CoverPageData).logoBase64)
    filename = 'cover_page.docx'
  } else if (type === 'certificate') {
    paragraphs = buildCertificate(data as CertificateData)
    filename = 'certificate.docx'
  } else {
    paragraphs = buildDeclaration(data as DeclarationData)
    filename = 'declaration.docx'
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

/** Generate a formatted version of the uploaded document */
export async function exportFormattedReport(
  content: string,
  _headings: Heading[],
  formatOptions: FormatOptions,
): Promise<void> {
  const margins = MARGIN_PRESETS[formatOptions.marginPreset]
  const fontSize = pt(formatOptions.fontSize)
  const fontFamily = formatOptions.fontFamily
  const lineSpacing = Math.round(formatOptions.lineSpacing * 240)

  const paragraphs: Paragraph[] = content.split('\n').map(
    (line) =>
      new Paragraph({
        spacing: { line: lineSpacing },
        children: [new TextRun({ text: line, size: fontSize, font: fontFamily })],
      }),
  )

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: margins } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ children: [PageNumber.CURRENT] })],
              }),
            ],
          }),
        },
        children: paragraphs,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, 'ReportReady_Formatted.docx')
}

// Re-export for convenience
export { convertInchesToTwip }
