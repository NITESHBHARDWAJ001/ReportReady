/**
 * Live HTML preview of a cover page template.
 * Renders inside the Cover Generator — no DOCX involved.
 */
import type { CoverPageData, CoverTemplate } from '@/types'

interface Props {
  data: CoverPageData
  scale?: number
}

export function CoverPreview({ data, scale = 1 }: Props) {
  const d = data
  const color = d.accentColor || '#1d4ed8'

  const wrapStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: '595px',  // A4 at 72dpi
    minHeight: '842px',
    background: '#fff',
    fontFamily: 'Georgia, serif',
    color: '#111',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,.12)',
  }

  const templates: Record<CoverTemplate, React.ReactNode> = {
    'classic': <ClassicTemplate d={d} color={color} />,
    'modern-banner': <ModernBannerTemplate d={d} color={color} />,
    'bordered': <BorderedTemplate d={d} color={color} />,
    'split': <SplitTemplate d={d} color={color} />,
    'minimal': <MinimalTemplate d={d} color={color} />,
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <div style={wrapStyle}>
        {templates[d.template] || templates['classic']}
      </div>
    </div>
  )
}

// ── Template 1: Classic Academic ─────────────────────────────
function ClassicTemplate({ d, color }: { d: CoverPageData; color: string }) {
  return (
    <div style={{ padding: '72px 64px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: '100%' }}>
        {d.logoBase64 && (
          <img src={d.logoBase64} alt="logo" style={{ height: '80px', marginBottom: '16px', objectFit: 'contain' }} />
        )}
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
          {d.collegeName || 'College Name'}
        </div>
        <div style={{ fontSize: '13px', marginBottom: '2px', color: '#444' }}>
          {d.department || 'Department'}
        </div>
        <div style={{ borderTop: `2px solid ${color}`, borderBottom: `2px solid ${color}`, padding: '10px 0', margin: '24px 0 0' }}>
          <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#555' }}>Project Report</div>
        </div>
      </div>

      <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.4, color }}>
          {d.projectTitle || 'Project Title'}
        </div>
      </div>

      <div style={{ width: '100%', borderTop: '1px solid #ccc', paddingTop: '24px' }}>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>Submitted by</div>
        <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{d.studentName || 'Student Name'}</div>
        <div style={{ fontSize: '12px', color: '#444', marginTop: '4px' }}>
          {d.rollNumber && `Roll No: ${d.rollNumber}`}
          {d.rollNumber && d.registrationNumber && ' · '}
          {d.registrationNumber && `Reg No: ${d.registrationNumber}`}
        </div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '12px' }}>
          Under the guidance of
        </div>
        <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>{d.guideName || 'Guide Name'}</div>
        <div style={{ fontSize: '12px', color: '#555', marginTop: '16px' }}>{d.academicYear || 'Academic Year'}</div>
      </div>
    </div>
  )
}

// ── Template 2: Modern Banner ─────────────────────────────────
function ModernBannerTemplate({ d, color }: { d: CoverPageData; color: string }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      {/* Banner */}
      <div style={{ background: color, padding: '48px 48px 40px', color: '#fff', textAlign: 'center' }}>
        {d.logoBase64 && (
          <img src={d.logoBase64} alt="logo" style={{ height: '70px', marginBottom: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        )}
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
          {d.collegeName || 'College Name'}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.85 }}>{d.department || 'Department'}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color, marginBottom: '12px' }}>
            PROJECT REPORT
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', lineHeight: 1.3, color: '#111' }}>
            {d.projectTitle || 'Project Title'}
          </div>
          <div style={{ width: '40px', height: '3px', background: color, margin: '16px 0' }} />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>SUBMITTED BY</div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d.studentName || 'Student Name'}</div>
              <div style={{ fontSize: '11px', color: '#555' }}>
                {d.rollNumber} {d.registrationNumber && `· ${d.registrationNumber}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>GUIDED BY</div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d.guideName || 'Guide'}</div>
              <div style={{ fontSize: '11px', color: '#555' }}>{d.academicYear}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 3: Bordered Box ──────────────────────────────────
function BorderedTemplate({ d, color }: { d: CoverPageData; color: string }) {
  return (
    <div style={{ height: '100%', padding: '24px', boxSizing: 'border-box' }}>
      {/* Double border */}
      <div style={{
        border: `3px solid ${color}`,
        outline: `6px solid ${color}`,
        outlineOffset: '-12px',
        height: '100%',
        padding: '56px 56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        {/* Corner marks */}
        {['topLeft','topRight','bottomLeft','bottomRight'].map((pos) => {
          const isTop = pos.includes('top')
          const isLeft = pos.includes('Left')
          return (
            <div key={pos} style={{
              position: 'absolute',
              top: isTop ? '20px' : undefined,
              bottom: !isTop ? '20px' : undefined,
              left: isLeft ? '20px' : undefined,
              right: !isLeft ? '20px' : undefined,
              width: '20px', height: '20px',
              borderTop: isTop ? `2px solid ${color}` : undefined,
              borderBottom: !isTop ? `2px solid ${color}` : undefined,
              borderLeft: isLeft ? `2px solid ${color}` : undefined,
              borderRight: !isLeft ? `2px solid ${color}` : undefined,
            }} />
          )
        })}

        <div>
          {d.logoBase64 && (
            <img src={d.logoBase64} alt="logo" style={{ height: '72px', marginBottom: '14px', objectFit: 'contain' }} />
          )}
          <div style={{ fontSize: '17px', fontWeight: 'bold' }}>{d.collegeName || 'College Name'}</div>
          <div style={{ fontSize: '12px', color: '#555' }}>{d.department || 'Department'}</div>
        </div>

        <div>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#777', textTransform: 'uppercase', marginBottom: '8px' }}>A Project Report on</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color, lineHeight: 1.35 }}>{d.projectTitle || 'Project Title'}</div>
        </div>

        <div>
          <div style={{ height: '1px', background: '#ccc', margin: '0 0 16px' }} />
          <div style={{ fontSize: '12px' }}><strong>{d.studentName || 'Student'}</strong></div>
          <div style={{ fontSize: '11px', color: '#555' }}>{d.rollNumber} · {d.registrationNumber}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>Guide: <strong>{d.guideName}</strong></div>
          <div style={{ fontSize: '11px', color: '#777', marginTop: '6px' }}>{d.academicYear}</div>
        </div>
      </div>
    </div>
  )
}

// ── Template 4: Split Layout ──────────────────────────────────
function SplitTemplate({ d, color }: { d: CoverPageData; color: string }) {
  return (
    <div style={{ height: '100%', display: 'flex', fontFamily: 'Arial, sans-serif' }}>
      {/* Left sidebar */}
      <div style={{ width: '180px', minWidth: '180px', background: color, padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', color: '#fff', textAlign: 'center' }}>
        {d.logoBase64 && (
          <img src={d.logoBase64} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'brightness(0) invert(1)', borderRadius: '8px' }} />
        )}
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '2px', opacity: 0.7, textTransform: 'uppercase', marginBottom: '8px' }}>Academic Year</div>
          <div style={{ fontSize: '13px', fontWeight: '700' }}>{d.academicYear || '2024–25'}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Project Report</div>
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>{d.collegeName || 'College Name'}</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{d.department || 'Department'}</div>
          <div style={{ width: '32px', height: '2px', background: color, margin: '16px 0' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', lineHeight: 1.3, color: '#111' }}>
              {d.projectTitle || 'Project Title'}
            </div>
          </div>
        </div>

        <div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Submitted by</div>
            <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '4px' }}>{d.studentName || 'Student Name'}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>{d.rollNumber} · {d.registrationNumber}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>
              Guide: <strong>{d.guideName || 'Guide Name'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template 5: Minimal Clean ─────────────────────────────────
function MinimalTemplate({ d, color }: { d: CoverPageData; color: string }) {
  return (
    <div style={{ height: '100%', padding: '80px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: '"Georgia", serif' }}>
      <div>
        {d.logoBase64 && (
          <img src={d.logoBase64} alt="logo" style={{ height: '56px', objectFit: 'contain', marginBottom: '20px' }} />
        )}
        <div style={{ fontSize: '13px', color: '#333', letterSpacing: '0.5px' }}>{d.collegeName || 'College Name'}</div>
        <div style={{ fontSize: '11px', color: '#888' }}>{d.department || 'Department'}</div>
      </div>

      <div>
        <div style={{ width: '48px', height: '1px', background: color, marginBottom: '24px' }} />
        <div style={{ fontSize: '28px', fontWeight: '400', lineHeight: 1.25, color: '#111', maxWidth: '420px' }}>
          {d.projectTitle || 'Project Title'}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '10px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
          Project Report
        </div>
        <div style={{ fontSize: '13px', color: '#222' }}>{d.studentName || 'Student Name'}</div>
        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{d.rollNumber}{d.registrationNumber && ` · ${d.registrationNumber}`}</div>
        <div style={{ fontSize: '11px', color: '#555', marginTop: '16px' }}>
          Under <em>{d.guideName || 'Guide Name'}</em>
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{d.academicYear}</div>
      </div>
    </div>
  )
}
