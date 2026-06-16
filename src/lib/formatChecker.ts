import type {
  ParsedDocument,
  FormatCheckResult,
  FormatIssue,
  FormatRequirements,
  ScoreBreakdown,
} from '@/types'
import { DEFAULT_FORMAT_REQUIREMENTS } from '@/store/useAppStore'

// ── Structure checks (max 40 pts) ────────────────────────────
function runStructureChecks(
  doc: ParsedDocument,
  req: FormatRequirements,
): FormatIssue[] {
  const issues: FormatIssue[] = []
  const headingTexts = doc.headings.map((h) => h.text.toLowerCase())

  const check = (
    id: string,
    passed: boolean,
    category: string,
    severity: FormatIssue['severity'],
    message: string,
    suggestion: string,
    extras: Partial<FormatIssue> = {},
  ) => issues.push({ id, passed, category, severity, message, suggestion, ...extras })

  // Cover page
  check(
    's-cover', doc.hasCoverPage || !req.requireCoverPage,
    'Structure', req.requireCoverPage ? 'error' : 'warning',
    doc.hasCoverPage ? '✓ Cover page detected' : '✗ Cover page missing',
    'Generate one in the Cover Page Generator.',
    { required: req.requireCoverPage ? 'Yes' : 'Optional', found: doc.hasCoverPage ? 'Present' : 'Missing' },
  )

  // Abstract
  check(
    's-abstract', doc.hasAbstract || !req.requireAbstract,
    'Structure', req.requireAbstract ? 'error' : 'warning',
    doc.hasAbstract ? '✓ Abstract section found' : '✗ Abstract section missing',
    `Add an "Abstract" heading with ${req.abstractMinWords}–${req.abstractMaxWords} words.`,
    { required: req.requireAbstract ? 'Yes' : 'Optional', found: doc.hasAbstract ? 'Present' : 'Missing' },
  )

  // Abstract word count
  if (doc.hasAbstract) {
    const absSection = doc.sections.find((s) => /abstract/i.test(s.heading?.text ?? ''))
    if (absSection && absSection.wordCount > 0) {
      const wc = absSection.wordCount
      const tooShort = wc < req.abstractMinWords
      const tooLong = wc > req.abstractMaxWords
      const status = tooShort ? `Too short (${wc} words)` : tooLong ? `Too long (${wc} words)` : `Ideal (${wc} words)`
      check(
        's-abstract-wc', !tooShort && !tooLong,
        'Abstract', tooShort || tooLong ? 'warning' : 'info',
        (tooShort || tooLong ? '✗ ' : '✓ ') + `Abstract word count: ${status}`,
        `Abstract should be ${req.abstractMinWords}–${req.abstractMaxWords} words.`,
        {
          required: `${req.abstractMinWords}–${req.abstractMaxWords} words`,
          found: `${wc} words`,
          sectionLabel: 'Abstract',
          estimatedPage: absSection.estimatedPage,
        },
      )
    }
  }

  // TOC
  const hasTOC = headingTexts.some((t) => /table.of.contents|contents/i.test(t))
  check(
    's-toc', hasTOC || !req.requireTableOfContents,
    'Structure', req.requireTableOfContents ? 'warning' : 'info',
    hasTOC ? '✓ Table of Contents detected' : '✗ Table of Contents not found',
    'Use Export Center to auto-generate a TOC.',
    { required: req.requireTableOfContents ? 'Required' : 'Optional', found: hasTOC ? 'Present' : 'Missing' },
  )

  // Introduction
  const introIdx = headingTexts.findIndex((t) => /introduction/i.test(t))
  check(
    's-intro', introIdx !== -1 || !req.requireIntroduction,
    'Structure', req.requireIntroduction ? 'error' : 'warning',
    introIdx !== -1 ? `✓ Introduction found (Section ${introIdx + 1})` : '✗ Introduction missing',
    'Add an Introduction chapter.',
    { required: req.requireIntroduction ? 'Required' : 'Optional', found: introIdx !== -1 ? 'Present' : 'Missing' },
  )

  // Conclusion
  const concIdx = headingTexts.findIndex((t) => /conclusion|summary/i.test(t))
  check(
    's-concl', concIdx !== -1 || !req.requireConclusion,
    'Structure', req.requireConclusion ? 'error' : 'warning',
    concIdx !== -1 ? `✓ Conclusion found (Section ${concIdx + 1})` : '✗ Conclusion missing',
    'Add a Conclusion chapter.',
    { required: req.requireConclusion ? 'Required' : 'Optional', found: concIdx !== -1 ? 'Present' : 'Missing' },
  )

  // References
  check(
    's-refs', doc.hasReferences || !req.requireReferences,
    'Structure', req.requireReferences ? 'error' : 'warning',
    doc.hasReferences ? '✓ References section found' : '✗ References section missing',
    `Add a References section formatted in ${req.referenceStyle} style.`,
    { required: req.requireReferences ? 'Required' : 'Optional', found: doc.hasReferences ? 'Present' : 'Missing' },
  )

  // Heading hierarchy
  let prevLevel = 0
  let skipped = false
  for (const h of doc.headings) {
    if (h.level > prevLevel + 1 && prevLevel > 0) { skipped = true; break }
    prevLevel = h.level
  }
  check(
    's-hier', !skipped,
    'Headings', 'warning',
    skipped ? '✗ Heading levels skip (e.g. H1 → H3)' : '✓ Heading hierarchy is sequential',
    'Maintain sequential heading levels: H1 → H2 → H3.',
    { required: 'Sequential (H1→H2→H3)', found: skipped ? 'Levels skipped' : 'Sequential' },
  )

  // Section ordering
  const absIdx2 = headingTexts.findIndex((t) => /abstract/.test(t))
  const refIdx = headingTexts.findIndex((t) => /references|bibliography/.test(t))
  const orderOk =
    (absIdx2 === -1 || introIdx === -1 || absIdx2 < introIdx) &&
    (introIdx === -1 || concIdx === -1 || introIdx < concIdx) &&
    (concIdx === -1 || refIdx === -1 || concIdx < refIdx)
  check(
    's-order', orderOk,
    'Structure', 'warning',
    orderOk ? '✓ Section order is correct' : '✗ Sections appear out of order',
    'Expected order: Abstract → Introduction → … → Conclusion → References.',
    { required: 'Abstract→Intro→…→Conclusion→References', found: orderOk ? 'Correct' : 'Out of order' },
  )

  return issues
}

// ── Formatting checks (max 30 pts) ──────────────────────────
function runFormattingChecks(
  _doc: ParsedDocument,
  req: FormatRequirements,
): FormatIssue[] {
  const issues: FormatIssue[] = []

  const check = (
    id: string,
    passed: boolean,
    category: string,
    severity: FormatIssue['severity'],
    message: string,
    suggestion: string,
    required?: string,
    found?: string,
  ) => issues.push({ id, passed, category, severity, message, suggestion, required, found })

  const { bodyStyle: b, h1Style: h1, h2Style: h2, h3Style: h3 } = req

  // Body font size range
  const bodySizeOk = b.fontSize >= 10 && b.fontSize <= 14
  check(
    'f-body-size', bodySizeOk,
    'Body Formatting', bodySizeOk ? 'info' : 'warning',
    bodySizeOk ? `✓ Body font size ${b.fontSize}pt (academic range)` : `✗ Body font size ${b.fontSize}pt is outside 10–14pt range`,
    'Most institutions require 11pt or 12pt.',
    '10–14 pt', `${b.fontSize} pt`,
  )

  // Line spacing
  const spacingOk = req.bodyLineSpacing >= 1.0 && req.bodyLineSpacing <= 2.0
  check(
    'f-spacing', spacingOk,
    'Body Formatting', spacingOk ? 'info' : 'warning',
    spacingOk ? `✓ Line spacing ${req.bodyLineSpacing} (acceptable)` : `✗ Line spacing ${req.bodyLineSpacing} outside 1.0–2.0 range`,
    '1.5 spacing is most commonly required.',
    '1.0–2.0', String(req.bodyLineSpacing),
  )

  // Margins
  const marginOk = req.marginTop >= 0.75 && req.marginBottom >= 0.75 && req.marginLeft >= 1.0 && req.marginRight >= 0.75
  check(
    'f-margins', marginOk,
    'Margins', marginOk ? 'info' : 'warning',
    marginOk ? '✓ Page margins are adequate' : '✗ Margins too narrow (binding may be cut off)',
    'Left ≥ 1.25", Top/Bottom/Right ≥ 1".',
    'L≥1.25" T/B/R≥0.75"',
    `L=${req.marginLeft}" T=${req.marginTop}" B=${req.marginBottom}" R=${req.marginRight}"`,
  )

  // H1 > body size
  const h1Bigger = h1.fontSize > b.fontSize
  check(
    'f-h1-size', h1Bigger,
    'Heading Formatting', h1Bigger ? 'info' : 'warning',
    h1Bigger ? `✓ H1 (${h1.fontSize}pt) is larger than body (${b.fontSize}pt)` : `✗ H1 (${h1.fontSize}pt) should be larger than body (${b.fontSize}pt)`,
    'Chapter titles should be visually larger than body text.',
    `> ${b.fontSize}pt`, `${h1.fontSize}pt`,
  )

  // H2 > H3
  const h2gtH3 = h2.fontSize >= h3.fontSize
  check(
    'f-h2-h3', h2gtH3,
    'Heading Formatting', h2gtH3 ? 'info' : 'warning',
    h2gtH3 ? `✓ H2 (${h2.fontSize}pt) ≥ H3 (${h3.fontSize}pt)` : `✗ H2 (${h2.fontSize}pt) should be ≥ H3 (${h3.fontSize}pt)`,
    'Heading sizes should decrease with nesting level.',
    `H2 ≥ H3`, `H2=${h2.fontSize}pt H3=${h3.fontSize}pt`,
  )

  // H1 bold recommended
  check(
    'f-h1-bold', h1.bold,
    'Heading Formatting', h1.bold ? 'info' : 'warning',
    h1.bold ? '✓ H1 is bold' : '✗ H1 should typically be bold',
    'Chapter titles are conventionally bold.',
    'Bold', h1.bold ? 'Bold' : 'Not bold',
  )

  // Page number enabled
  check(
    'f-pagenum', req.pageNumberEnabled,
    'Page Numbering', req.pageNumberEnabled ? 'info' : 'error',
    req.pageNumberEnabled ? `✓ Page numbers enabled (${req.pageNumberFormat}, ${req.pageNumberPosition})` : '✗ Page numbers are disabled',
    'Academic reports require page numbers.',
    'Enabled', req.pageNumberEnabled ? 'Enabled' : 'Disabled',
  )

  // Paper size
  const paperOk = req.paperSize === 'A4'
  check(
    'f-paper', paperOk,
    'Page Setup', paperOk ? 'info' : 'warning',
    paperOk ? '✓ Paper size is A4 (standard for India)' : `⚠ Paper size is ${req.paperSize} (most Indian institutions require A4)`,
    'Check your institution guidelines for paper size.',
    'A4', req.paperSize,
  )

  return issues
}

// ── Content checks (max 30 pts) ─────────────────────────────
function runContentChecks(
  doc: ParsedDocument,
  _req: FormatRequirements,
): FormatIssue[] {
  const issues: FormatIssue[] = []

  const check = (
    id: string,
    passed: boolean,
    category: string,
    severity: FormatIssue['severity'],
    message: string,
    suggestion: string,
    required?: string,
    found?: string,
    sectionLabel?: string,
    estimatedPage?: number,
  ) => issues.push({ id, passed, category, severity, message, suggestion, required, found, sectionLabel, estimatedPage })

  // Word count
  const minWords = 2000
  check(
    'c-words', doc.wordCount >= minWords,
    'Content', doc.wordCount >= minWords ? 'info' : 'warning',
    doc.wordCount >= minWords
      ? `✓ Word count ${doc.wordCount.toLocaleString()} is adequate`
      : `✗ Word count ${doc.wordCount.toLocaleString()} is low (min ${minWords.toLocaleString()})`,
    'Aim for at least 4,000–8,000 words for a full project report.',
    `≥ ${minWords.toLocaleString()} words`, `${doc.wordCount.toLocaleString()} words`,
  )

  // Page count
  const minPages = 10
  check(
    'c-pages', doc.estimatedPages >= minPages,
    'Content', doc.estimatedPages >= minPages ? 'info' : 'warning',
    doc.estimatedPages >= minPages
      ? `✓ ~${doc.estimatedPages} pages estimated`
      : `✗ Only ~${doc.estimatedPages} pages estimated (min ${minPages})`,
    'Expand methodology, results, and analysis sections.',
    `≥ ${minPages} pages`, `~${doc.estimatedPages} pages`,
  )

  // H1 count
  const h1Count = doc.headings.filter((h) => h.level === 1).length
  check(
    'c-chapters', h1Count >= 3,
    'Content', h1Count >= 3 ? 'info' : 'warning',
    h1Count >= 3 ? `✓ ${h1Count} chapter(s) found` : `✗ Only ${h1Count} chapter(s) (expected ≥ 3)`,
    'A complete report needs at least: Introduction, Core Content, and Conclusion chapters.',
    '≥ 3 chapters', `${h1Count} chapter(s)`,
  )

  // Per-section content checks
  for (const section of doc.sections) {
    if (!section.heading) continue
    if (section.heading.level !== 1) continue  // only check top-level

    const sLabel = section.heading.text
    const pg = section.estimatedPage

    // Very short sections
    if (section.wordCount > 0 && section.wordCount < 100) {
      issues.push({
        id: `c-sec-short-${sLabel}`,
        passed: false,
        category: 'Content',
        severity: 'warning',
        message: `✗ Section "${sLabel}" is very short (${section.wordCount} words)`,
        suggestion: 'Expand this section with more detail, analysis, or examples.',
        required: '≥ 100 words per chapter',
        found: `${section.wordCount} words`,
        sectionLabel: sLabel,
        estimatedPage: pg,
      })
    }
  }

  return issues
}

// ── Main entry ───────────────────────────────────────────────
export function runFormatCheck(
  doc: ParsedDocument,
  req: FormatRequirements = DEFAULT_FORMAT_REQUIREMENTS,
): FormatCheckResult {
  const structureIssues = runStructureChecks(doc, req)
  const formattingIssues = runFormattingChecks(doc, req)
  const contentIssues = runContentChecks(doc, req)

  const allIssues = [...structureIssues, ...formattingIssues, ...contentIssues]

  // Weighted scoring
  const sPassed = structureIssues.filter((i) => i.passed).length
  const fPassed = formattingIssues.filter((i) => i.passed).length
  const cPassed = contentIssues.filter((i) => i.passed).length

  const sScore = Math.round((sPassed / Math.max(structureIssues.length, 1)) * 40)
  const fScore = Math.round((fPassed / Math.max(formattingIssues.length, 1)) * 30)
  const cScore = Math.round((cPassed / Math.max(contentIssues.length, 1)) * 30)

  const breakdown: ScoreBreakdown = {
    structure: sScore,
    formatting: fScore,
    content: cScore,
  }

  const score = sScore + fScore + cScore
  return { score, breakdown, issues: allIssues, submissionReady: score >= 70 }
}

/** Group issues by section/page for the page-wise report view */
export function groupIssuesBySection(
  issues: FormatIssue[],
): Map<string, FormatIssue[]> {
  const map = new Map<string, FormatIssue[]>()

  for (const issue of issues) {
    const key = issue.sectionLabel
      ? `p.${issue.estimatedPage ?? '?'} — ${issue.sectionLabel}`
      : issue.category

    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(issue)
  }

  return map
}
