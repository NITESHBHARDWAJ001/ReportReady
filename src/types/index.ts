/** Core domain types for ReportReady */

// ── Text style per element type ───────────────────────────────
export interface TextStyle {
  fontFamily: string
  fontSize: number        // pt
  bold: boolean
  italic: boolean
  underline: boolean
  allCaps: boolean
  color: string           // '#rrggbb'
  alignment: 'left' | 'center' | 'right' | 'justify'
  spacingBefore: number   // pt
  spacingAfter: number    // pt
}

// ── Full formatting specification ─────────────────────────────
export interface FormatRequirements {
  // Element styles
  bodyStyle: TextStyle
  h1Style: TextStyle
  h2Style: TextStyle
  h3Style: TextStyle
  captionStyle: TextStyle
  footerStyle: TextStyle

  // Heading numbering
  h1Numbering: 'none' | 'numeric' | 'chapter'   // e.g. "1." or "Chapter 1"
  h2Numbering: 'none' | 'numeric' | 'alpha'      // e.g. "1.1" or "A."
  h3Numbering: 'none' | 'numeric'

  // Line spacing (body)
  bodyLineSpacing: number

  // Paragraph
  firstLineIndent: boolean
  blockQuoteIndent: number   // inches

  // Margins (inches)
  marginTop: number
  marginBottom: number
  marginLeft: number
  marginRight: number

  // Page
  paperSize: 'A4' | 'Letter'

  // Page numbers
  pageNumberEnabled: boolean
  pageNumberFormat: 'arabic' | 'roman' | 'ROMAN' | 'alpha'
  pageNumberPosition: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right'
  pageNumberStartFrom: number

  // Header / Footer text
  headerEnabled: boolean
  headerText: string
  footerEnabled: boolean
  footerText: string

  // Abstract
  abstractMinWords: number
  abstractMaxWords: number

  // References
  referenceStyle: 'IEEE' | 'APA' | 'MLA'

  // Required sections
  requireCoverPage: boolean
  requireAbstract: boolean
  requireTableOfContents: boolean
  requireIntroduction: boolean
  requireConclusion: boolean
  requireReferences: boolean
}

// ── Document parsing ──────────────────────────────────────────
export interface ParsedDocument {
  text: string
  headings: Heading[]
  estimatedPages: number
  wordCount: number
  hasCoverPage: boolean
  hasAbstract: boolean
  hasReferences: boolean
  htmlContent: string
  sections: DocumentSection[]    // text broken into sections by heading
}

export interface DocumentSection {
  heading: Heading | null         // null = preamble before first heading
  text: string
  wordCount: number
  estimatedPage: number
}

export interface Heading {
  text: string
  level: number
  page?: number
}

// ── Format checker ────────────────────────────────────────────
export interface FormatIssue {
  id: string
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
  suggestion: string
  passed: boolean
  /** Which section / page this relates to (optional) */
  sectionLabel?: string
  estimatedPage?: number
  /** What was required vs what was found */
  required?: string
  found?: string
}

export interface ScoreBreakdown {
  structure: number    // 0–40
  formatting: number   // 0–30
  content: number      // 0–30
}

export interface FormatCheckResult {
  score: number
  breakdown: ScoreBreakdown
  issues: FormatIssue[]
  submissionReady: boolean
}

export interface FormatOptions {
  fontFamily: string
  fontSize: number
  lineSpacing: number
  marginPreset: 'narrow' | 'normal' | 'wide'
}

// ── Cover page ────────────────────────────────────────────────
export type CoverTemplate = 'classic' | 'modern-banner' | 'bordered' | 'split' | 'minimal'

export interface CoverPageData {
  collegeName: string
  department: string
  projectTitle: string
  studentName: string
  rollNumber: string
  registrationNumber: string
  guideName: string
  academicYear: string
  logoBase64?: string
  template: CoverTemplate
  accentColor: string   // hex
}

// ── Certificate ───────────────────────────────────────────────
export type CertificateType = 'completion' | 'appreciation' | 'participation' | 'achievement'
export type CertificateDesign = 'classic' | 'modern'

export interface CertificateData {
  type: CertificateType
  design: CertificateDesign
  studentName: string
  projectTitle: string
  eventName: string       // for participation
  rank: string            // for achievement ('1st', '2nd', '3rd')
  guideName: string
  collegeName: string
  department: string
  academicYear: string
  date: string
  accentColor: string
}

// ── Declaration ───────────────────────────────────────────────
export interface DeclarationData {
  studentName: string
  rollNumber: string
  projectTitle: string
  collegeName: string
  department: string
  guideName: string
  date: string
}

// ── References ────────────────────────────────────────────────
export interface Reference {
  id: string
  authors: string
  title: string
  journal?: string
  year: string
  volume?: string
  issue?: string
  pages?: string
  url?: string
  publisher?: string
  type: 'journal' | 'book' | 'website' | 'conference'
}

// ── User profile ──────────────────────────────────────────────
export interface UserProfile {
  collegeName: string
  department: string
  guideName: string
  academicYear: string
  logoBase64?: string
}

export interface ExportSection {
  id: string
  label: string
  enabled: boolean
  order: number
}
