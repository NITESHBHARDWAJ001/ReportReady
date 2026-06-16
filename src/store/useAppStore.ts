import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ParsedDocument,
  FormatCheckResult,
  FormatOptions,
  CoverPageData,
  CertificateData,
  DeclarationData,
  Reference,
  UserProfile,
  FormatRequirements,
  TextStyle,
} from '@/types'

interface AppState {
  uploadedFile: File | null
  parsedDoc: ParsedDocument | null
  formatCheckResult: FormatCheckResult | null
  formatOptions: FormatOptions
  formatRequirements: FormatRequirements
  coverPageData: CoverPageData
  certificateData: CertificateData
  declarationData: DeclarationData
  references: Reference[]
  userProfile: UserProfile
  darkMode: boolean

  setUploadedFile: (file: File | null) => void
  setParsedDoc: (doc: ParsedDocument | null) => void
  setFormatCheckResult: (result: FormatCheckResult | null) => void
  setFormatOptions: (opts: Partial<FormatOptions>) => void
  setFormatRequirements: (req: Partial<FormatRequirements>) => void
  setCoverPageData: (data: Partial<CoverPageData>) => void
  setCertificateData: (data: Partial<CertificateData>) => void
  setDeclarationData: (data: Partial<DeclarationData>) => void
  addReference: (ref: Reference) => void
  updateReference: (id: string, ref: Partial<Reference>) => void
  removeReference: (id: string) => void
  setUserProfile: (profile: Partial<UserProfile>) => void
  toggleDarkMode: () => void
  resetDocument: () => void
}

// ── Default text style factory ────────────────────────────────
const textStyle = (overrides: Partial<TextStyle> = {}): TextStyle => ({
  fontFamily: 'Times New Roman',
  fontSize: 12,
  bold: false,
  italic: false,
  underline: false,
  allCaps: false,
  color: '#000000',
  alignment: 'justify',
  spacingBefore: 0,
  spacingAfter: 6,
  ...overrides,
})

export const DEFAULT_FORMAT_REQUIREMENTS: FormatRequirements = {
  bodyStyle: textStyle({ fontSize: 12, alignment: 'justify' }),
  h1Style: textStyle({ fontSize: 16, bold: true, alignment: 'center', spacingBefore: 24, spacingAfter: 12 }),
  h2Style: textStyle({ fontSize: 14, bold: true, alignment: 'left', spacingBefore: 18, spacingAfter: 8 }),
  h3Style: textStyle({ fontSize: 12, bold: true, italic: false, alignment: 'left', spacingBefore: 12, spacingAfter: 6 }),
  captionStyle: textStyle({ fontSize: 10, italic: true, alignment: 'center', spacingBefore: 4, spacingAfter: 12 }),
  footerStyle: textStyle({ fontSize: 10, alignment: 'center' }),

  h1Numbering: 'none',
  h2Numbering: 'none',
  h3Numbering: 'none',

  bodyLineSpacing: 1.5,
  firstLineIndent: false,
  blockQuoteIndent: 0.5,

  marginTop: 1,
  marginBottom: 1,
  marginLeft: 1.25,
  marginRight: 1,
  paperSize: 'A4',

  pageNumberEnabled: true,
  pageNumberFormat: 'arabic',
  pageNumberPosition: 'bottom-center',
  pageNumberStartFrom: 1,

  headerEnabled: false,
  headerText: '',
  footerEnabled: false,
  footerText: '',

  abstractMinWords: 150,
  abstractMaxWords: 500,
  referenceStyle: 'IEEE',

  requireCoverPage: true,
  requireAbstract: true,
  requireTableOfContents: true,
  requireIntroduction: true,
  requireConclusion: true,
  requireReferences: true,
}

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  fontFamily: 'Times New Roman',
  fontSize: 12,
  lineSpacing: 1.5,
  marginPreset: 'normal',
}

const DEFAULT_COVER: CoverPageData = {
  collegeName: '',
  department: '',
  projectTitle: '',
  studentName: '',
  rollNumber: '',
  registrationNumber: '',
  guideName: '',
  academicYear: '',
  template: 'classic',
  accentColor: '#1d4ed8',
}

const DEFAULT_CERT: CertificateData = {
  type: 'completion',
  design: 'classic',
  studentName: '',
  projectTitle: '',
  eventName: '',
  rank: '1st',
  guideName: '',
  collegeName: '',
  department: '',
  academicYear: '',
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
  accentColor: '#b45309',
}

const DEFAULT_DECL: DeclarationData = {
  studentName: '',
  rollNumber: '',
  projectTitle: '',
  collegeName: '',
  department: '',
  guideName: '',
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      uploadedFile: null,
      parsedDoc: null,
      formatCheckResult: null,
      formatOptions: DEFAULT_FORMAT_OPTIONS,
      formatRequirements: DEFAULT_FORMAT_REQUIREMENTS,
      coverPageData: DEFAULT_COVER,
      certificateData: DEFAULT_CERT,
      declarationData: DEFAULT_DECL,
      references: [],
      userProfile: { collegeName: '', department: '', guideName: '', academicYear: '' },
      darkMode: false,

      setUploadedFile: (file) => set({ uploadedFile: file }),
      setParsedDoc: (doc) => set({ parsedDoc: doc }),
      setFormatCheckResult: (result) => set({ formatCheckResult: result }),
      setFormatOptions: (opts) => set((s) => ({ formatOptions: { ...s.formatOptions, ...opts } })),
      setFormatRequirements: (req) => set((s) => ({ formatRequirements: { ...s.formatRequirements, ...req } })),

      setCoverPageData: (data) => set((s) => ({ coverPageData: { ...s.coverPageData, ...data } })),
      setCertificateData: (data) => set((s) => ({ certificateData: { ...s.certificateData, ...data } })),
      setDeclarationData: (data) => set((s) => ({ declarationData: { ...s.declarationData, ...data } })),

      addReference: (ref) => set((s) => ({ references: [...s.references, ref] })),
      updateReference: (id, ref) =>
        set((s) => ({ references: s.references.map((r) => (r.id === id ? { ...r, ...ref } : r)) })),
      removeReference: (id) => set((s) => ({ references: s.references.filter((r) => r.id !== id) })),

      setUserProfile: (profile) =>
        set((s) => ({
          userProfile: { ...s.userProfile, ...profile },
          coverPageData: {
            ...s.coverPageData,
            collegeName: profile.collegeName ?? s.coverPageData.collegeName,
            department: profile.department ?? s.coverPageData.department,
            guideName: profile.guideName ?? s.coverPageData.guideName,
            academicYear: profile.academicYear ?? s.coverPageData.academicYear,
            logoBase64: profile.logoBase64 ?? s.coverPageData.logoBase64,
          },
          certificateData: {
            ...s.certificateData,
            collegeName: profile.collegeName ?? s.certificateData.collegeName,
            department: profile.department ?? s.certificateData.department,
            guideName: profile.guideName ?? s.certificateData.guideName,
            academicYear: profile.academicYear ?? s.certificateData.academicYear,
          },
          declarationData: {
            ...s.declarationData,
            collegeName: profile.collegeName ?? s.declarationData.collegeName,
            department: profile.department ?? s.declarationData.department,
            guideName: profile.guideName ?? s.declarationData.guideName,
          },
        })),

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      resetDocument: () => set({ uploadedFile: null, parsedDoc: null, formatCheckResult: null }),
    }),
    {
      name: 'reportready-store',
      partialize: (s) => ({
        formatOptions: s.formatOptions,
        formatRequirements: s.formatRequirements,
        coverPageData: s.coverPageData,
        certificateData: s.certificateData,
        declarationData: s.declarationData,
        references: s.references,
        userProfile: s.userProfile,
        darkMode: s.darkMode,
      }),
    },
  ),
)
