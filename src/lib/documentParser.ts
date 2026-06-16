import mammoth from 'mammoth'
import type { ParsedDocument, Heading, DocumentSection } from '@/types'
import { countWords } from './utils'

const WORDS_PER_PAGE = 400
const COVER_PATTERNS = /title\s*page|cover\s*page|project\s*report|submitted\s*(by|to)/i
const ABSTRACT_PATTERNS = /^abstract$/i
const REFERENCES_PATTERNS = /^(references|bibliography|works\s+cited)$/i

export async function parseDocxFile(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer })
  const textResult = await mammoth.extractRawText({ arrayBuffer })
  const text = textResult.value

  const headings = extractHeadingsFromHtml(htmlResult.value)
  const wordCount = countWords(text)
  const estimatedPages = Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE))

  const lowerText = text.toLowerCase()
  const hasCoverPage =
    COVER_PATTERNS.test(text) || headings.some((h) => COVER_PATTERNS.test(h.text))
  const hasAbstract =
    lowerText.includes('abstract') &&
    headings.some((h) => ABSTRACT_PATTERNS.test(h.text.trim()))
  const hasReferences =
    headings.some((h) => REFERENCES_PATTERNS.test(h.text.trim())) ||
    lowerText.includes('references')

  // Build sections: split text by heading positions
  const sections = buildSections(text, headings, estimatedPages, wordCount)

  return {
    text,
    headings,
    estimatedPages,
    wordCount,
    hasCoverPage,
    hasAbstract,
    hasReferences,
    htmlContent: htmlResult.value,
    sections,
  }
}

function extractHeadingsFromHtml(html: string): Heading[] {
  const headings: Heading[] = []
  const regex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    if (text) headings.push({ level, text })
  }
  return headings
}

/** Split raw text into sections based on heading positions */
function buildSections(
  text: string,
  headings: Heading[],
  totalPages: number,
  totalWords: number,
): DocumentSection[] {
  if (headings.length === 0) {
    return [{
      heading: null,
      text,
      wordCount: totalWords,
      estimatedPage: 1,
    }]
  }

  // Find approximate char positions of each heading in the text
  const lines = text.split('\n')
  const sections: DocumentSection[] = []
  let currentHeadingIdx = -1
  let currentLines: string[] = []
  let charsSoFar = 0

  for (const line of lines) {
    const trimmed = line.trim()
    // Try to match this line to the next heading
    const nextIdx = currentHeadingIdx + 1
    if (nextIdx < headings.length && trimmed === headings[nextIdx].text) {
      // Save previous section
      if (currentHeadingIdx >= 0 || currentLines.length > 0) {
        const sectionText = currentLines.join('\n')
        const wc = countWords(sectionText)
        const page = Math.max(1, Math.ceil((charsSoFar / (totalWords || 1)) * totalPages))
        sections.push({
          heading: currentHeadingIdx >= 0 ? headings[currentHeadingIdx] : null,
          text: sectionText,
          wordCount: wc,
          estimatedPage: page,
        })
      }
      currentHeadingIdx = nextIdx
      currentLines = []
    } else {
      currentLines.push(line)
      charsSoFar += countWords(line)
    }
  }

  // Last section
  const sectionText = currentLines.join('\n')
  sections.push({
    heading: currentHeadingIdx >= 0 ? headings[currentHeadingIdx] : null,
    text: sectionText,
    wordCount: countWords(sectionText),
    estimatedPage: Math.max(1, Math.ceil((charsSoFar / (totalWords || 1)) * totalPages)),
  })

  return sections.filter((s) => s.wordCount > 0 || s.heading !== null)
}
