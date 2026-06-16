# ReportReady 📄

> Automatically format academic project reports, generate mandatory pages, validate document requirements, and export a submission-ready DOCX — entirely in your browser.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Features

| Feature | Description |
|---|---|
| **Document Upload & Analysis** | Upload DOCX, extract headings, detect mandatory sections |
| **Format Checker** | 10-point validation with 0–100 submission readiness score |
| **Cover Page Generator** | Professional cover page with logo upload |
| **Certificate Generator** | Bonafide certificate with live preview |
| **Declaration Generator** | Student declaration page |
| **References Helper** | IEEE, APA, MLA formatting with copy-to-clipboard |
| **Export Center** | Combine all sections into one DOCX |
| **Dark Mode** | Full dark/light theme support |
| **Offline-first** | All data stored in localStorage — no server needed |

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** + **Lucide Icons**
- **React Hook Form** + **Zod** for form validation
- **mammoth.js** for DOCX parsing
- **docx** library for DOCX generation
- **FileSaver.js** for downloads
- **Zustand** for state management (persisted to localStorage)

---

## Quick Start

```bash
# 1. Clone / navigate to project
cd E:\Foramatter

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open browser
# → http://localhost:5173
```

---

## Build for Production

```bash
npm run build
# Output in ./dist — ready for Vercel / Netlify / GitHub Pages
```

---

## Deploying to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: GitHub → Vercel dashboard
# 1. Push this repo to GitHub
# 2. Import in vercel.com/new
# 3. Framework preset: Vite
# 4. Build command: npm run build
# 5. Output directory: dist
# 6. Deploy!
```

> No environment variables required — fully client-side.

---

## GitHub Setup

```bash
git init
git add .
git commit -m "feat: initial ReportReady application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/reportready.git
git push -u origin main
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/       # AppLayout, Sidebar, Header, Footer
│   └── ui/           # shadcn primitive components
├── features/
│   ├── dashboard/    # Main dashboard with readiness score
│   ├── upload/       # DOCX upload & parsing
│   ├── format-checker/  # 10-point format validation
│   ├── cover-generator/ # Cover page form + preview
│   ├── certificate/  # Certificate generator
│   ├── declaration/  # Declaration generator
│   ├── references/   # IEEE/APA/MLA reference tool
│   └── export/       # Export center (full DOCX)
├── lib/
│   ├── documentParser.ts   # mammoth.js wrapper
│   ├── formatChecker.ts    # validation rules engine
│   ├── docxGenerator.ts    # docx library wrapper
│   └── utils.ts            # shared helpers
├── store/
│   └── useAppStore.ts      # Zustand store (persisted)
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## Roadmap

- [ ] Abstract word count validator (dedicated page)
- [ ] Auto Table of Contents with real page numbers
- [ ] Plagiarism heatmap (local n-gram analysis)
- [ ] Multi-student batch export
- [ ] PDF export via html2pdf
- [ ] Custom certificate templates
- [ ] Hindi / Tamil language support
- [ ] VS Code extension for inline format hints
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] PWA support for full offline installation

---

## Privacy

Your documents **never leave your browser**. All processing happens locally using WebAssembly and the File API. No analytics, no tracking, no server.

---

Built for Digital Heroes → [digitalheroesco.com](https://digitalheroesco.com)
