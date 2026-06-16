/**
 * Live HTML preview of certificate templates.
 * 4 types × 2 designs = 8 variants.
 */
import type { CertificateData, CertificateType, CertificateDesign } from '@/types'

interface Props {
  data: CertificateData
  scale?: number
}

const TYPE_LABELS: Record<CertificateType, string> = {
  completion: 'Certificate of Completion',
  appreciation: 'Certificate of Appreciation',
  participation: 'Certificate of Participation',
  achievement: 'Certificate of Achievement',
}

const TYPE_BODIES: Record<CertificateType, (d: CertificateData) => string> = {
  completion: (d) =>
    `This is to certify that <strong>${d.studentName || 'Student Name'}</strong> has successfully completed the project titled <strong>${d.projectTitle || 'Project Title'}</strong> in partial fulfillment of the degree requirements.`,
  appreciation: (d) =>
    `This certificate is presented to <strong>${d.studentName || 'Student Name'}</strong> in appreciation of their outstanding contribution and dedication towards the project <strong>${d.projectTitle || 'Project Title'}</strong>.`,
  participation: (d) =>
    `This is to certify that <strong>${d.studentName || 'Student Name'}</strong> has participated in <strong>${d.eventName || 'Event Name'}</strong> organized by the Department of ${d.department || 'Department'}.`,
  achievement: (d) =>
    `This is to proudly acknowledge that <strong>${d.studentName || 'Student Name'}</strong> has secured the <strong>${d.rank || '1st'} Position</strong> in <strong>${d.eventName || 'Event Name'}</strong>.`,
}

export function CertificatePreview({ data, scale = 1 }: Props) {
  const wrapStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: '842px',   // A4 landscape at 72dpi
    height: '595px',
    background: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,.12)',
  }

  const key: `${CertificateType}-${CertificateDesign}` = `${data.type}-${data.design}`

  const variants: Record<string, React.ReactNode> = {
    'completion-classic': <ClassicCert data={data} />,
    'completion-modern': <ModernCert data={data} />,
    'appreciation-classic': <ClassicCert data={data} />,
    'appreciation-modern': <ModernCert data={data} />,
    'participation-classic': <ClassicCert data={data} />,
    'participation-modern': <ModernCert data={data} />,
    'achievement-classic': <AchievementClassic data={data} />,
    'achievement-modern': <AchievementModern data={data} />,
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'hidden' }}>
      <div style={wrapStyle}>
        {variants[key] || variants['completion-classic']}
      </div>
    </div>
  )
}

// ── Classic Design ────────────────────────────────────────────
function ClassicCert({ data: d }: { data: CertificateData }) {
  const color = d.accentColor || '#b45309'
  const bodyText = TYPE_BODIES[d.type](d)
  const title = TYPE_LABELS[d.type]

  return (
    <div style={{
      height: '100%',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        border: `4px double ${color}`,
        height: '100%',
        padding: '32px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        position: 'relative',
      }}>
        {/* Corner ornaments */}
        {['tl', 'tr', 'bl', 'br'].map((c) => (
          <div key={c} style={{
            position: 'absolute',
            top: c.startsWith('t') ? '8px' : undefined,
            bottom: c.startsWith('b') ? '8px' : undefined,
            left: c.endsWith('l') ? '8px' : undefined,
            right: c.endsWith('r') ? '8px' : undefined,
            width: '28px', height: '28px',
            borderTop: c.startsWith('t') ? `2px solid ${color}` : undefined,
            borderBottom: c.startsWith('b') ? `2px solid ${color}` : undefined,
            borderLeft: c.endsWith('l') ? `2px solid ${color}` : undefined,
            borderRight: c.endsWith('r') ? `2px solid ${color}` : undefined,
          }} />
        ))}

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#777', marginBottom: '6px' }}>
            {d.collegeName || 'College Name'}
          </div>
          <div style={{ fontSize: '10px', color: '#999' }}>{d.department || 'Department'}</div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color, marginBottom: '8px' }}>
            ✦ ✦ ✦
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'normal', letterSpacing: '2px', color, margin: 0 }}>
            {title}
          </h1>
          <div style={{ width: '120px', height: '1px', background: color, margin: '12px auto' }} />
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', maxWidth: '580px', lineHeight: 1.7 }}>
          <p
            style={{ fontSize: '13px', color: '#333', margin: 0 }}
            dangerouslySetInnerHTML={{ __html: bodyText }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: '16px', borderTop: `1px solid ${color}33` }}>
          <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Guide</div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{d.guideName || 'Guide Name'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>{d.date}</div>
            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{d.academicYear}</div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>Signature</div>
            <div style={{ width: '80px', borderTop: `1px solid #888`, margin: '0 auto 2px' }} />
            <div style={{ fontSize: '10px', color: '#aaa' }}>HOD</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modern Design ─────────────────────────────────────────────
function ModernCert({ data: d }: { data: CertificateData }) {
  const color = d.accentColor || '#b45309'
  const bodyText = TYPE_BODIES[d.type](d)
  const title = TYPE_LABELS[d.type]

  return (
    <div style={{ height: '100%', display: 'flex', fontFamily: 'Arial, sans-serif' }}>
      {/* Accent sidebar */}
      <div style={{
        width: '120px',
        background: color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        gap: '12px',
      }}>
        {/* Vertical text */}
        <div style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}>
          {d.collegeName || 'College Name'}
        </div>
        <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.3)' }} />
        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '8px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}>
          {d.academicYear}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '40px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#999', marginBottom: '4px' }}>
            {d.department || 'Department'}
          </div>
          <div style={{ width: '40px', height: '3px', background: color, marginBottom: '16px' }} />
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
            {title}
          </h1>
        </div>

        <div>
          <p
            style={{ fontSize: '13px', color: '#444', lineHeight: 1.8, maxWidth: '580px' }}
            dangerouslySetInnerHTML={{ __html: bodyText }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#888' }}>GUIDED BY</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{d.guideName || 'Guide Name'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#888' }}>DATE</div>
            <div style={{ fontSize: '12px', color: '#555' }}>{d.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ width: '100px', borderTop: `2px solid ${color}`, paddingTop: '4px' }}>
              <div style={{ fontSize: '10px', color: '#888' }}>HOD SIGNATURE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Achievement Classic ───────────────────────────────────────
function AchievementClassic({ data: d }: { data: CertificateData }) {
  const color = d.accentColor || '#b45309'

  return (
    <div style={{
      height: '100%',
      background: `linear-gradient(135deg, #fffbeb 0%, #fff 50%, #fffbeb 100%)`,
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        border: `3px solid ${color}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '28px 48px',
        boxSizing: 'border-box',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Star badge */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          background: color,
          color: '#fff',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>★</div>

        <div>
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase' }}>{d.collegeName}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: color, marginBottom: '8px', textTransform: 'uppercase' }}>
            Certificate of Achievement
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Proudly Presented To</div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'normal',
            color: '#111',
            borderBottom: `2px solid ${color}`,
            paddingBottom: '8px',
            marginBottom: '16px',
          }}>
            {d.studentName || 'Student Name'}
          </div>
          <div style={{ fontSize: '13px', color: '#555', maxWidth: '560px', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: TYPE_BODIES.achievement(d) }}
          />
        </div>

        <div style={{ display: 'flex', gap: '80px', justifyContent: 'center' }}>
          <div>
            <div style={{ width: '100px', borderTop: '1px solid #999' }} />
            <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>Guide</div>
            <div style={{ fontSize: '11px' }}>{d.guideName}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: color, fontWeight: 'bold' }}>{d.date}</div>
            <div style={{ fontSize: '10px', color: '#aaa' }}>{d.academicYear}</div>
          </div>
          <div>
            <div style={{ width: '100px', borderTop: '1px solid #999' }} />
            <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>HOD</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Achievement Modern ────────────────────────────────────────
function AchievementModern({ data: d }: { data: CertificateData }) {
  const color = d.accentColor || '#b45309'

  return (
    <div style={{
      height: '100%',
      background: '#111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 64px',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background accent circle */}
      <div style={{
        position: 'absolute',
        top: '-80px', right: '-80px',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: `${color}22`,
        border: `1px solid ${color}44`,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-80px', left: '-80px',
        width: '250px', height: '250px',
        borderRadius: '50%',
        background: `${color}11`,
        border: `1px solid ${color}33`,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase', color: color, marginBottom: '20px' }}>
          {d.collegeName || 'College'} · {d.department || 'Department'}
        </div>

        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', letterSpacing: '1px', margin: '0 0 8px' }}>
          CERTIFICATE OF ACHIEVEMENT
        </h1>
        <div style={{ width: '60px', height: '2px', background: color, margin: '0 auto 20px' }} />

        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>
          Awarded to
        </div>
        <div style={{ fontSize: '32px', color: '#fff', fontWeight: '300', letterSpacing: '1px', marginBottom: '20px' }}>
          {d.studentName || 'Student Name'}
        </div>

        <div style={{ fontSize: '12px', color: '#bbb', maxWidth: '520px', lineHeight: 1.7 }}
          dangerouslySetInnerHTML={{ __html: TYPE_BODIES.achievement(d) }}
        />

        <div style={{ marginTop: '32px', display: 'flex', gap: '64px', justifyContent: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Date</div>
            <div style={{ fontSize: '12px', color: color }}>{d.date}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Guide</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>{d.guideName || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Academic Year</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>{d.academicYear || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
