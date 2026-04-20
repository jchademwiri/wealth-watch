import {
  Html, Head, Body, Container,
  Heading, Text, Button, Hr, Section,
} from '@react-email/components'

interface Props {
  firstName:        string
  lastSnapshotDate: Date | null
  lastTotalValue:   string | null
  lastPnlPct:       string | null
  updateUrl:        string
  aiSummary?:       string
}

export function PortfolioReminderEmail({
  firstName,
  lastSnapshotDate,
  lastTotalValue,
  lastPnlPct,
  updateUrl,
  aiSummary,
}: Props) {
  const daysSince = lastSnapshotDate
    ? Math.floor((Date.now() - new Date(lastSnapshotDate).getTime()) / 86400000)
    : null

  const pnlPctNum  = lastPnlPct  ? parseFloat(lastPnlPct)  : null
  const pnlPositive = pnlPctNum !== null && pnlPctNum >= 0

  const dayLabel = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  })

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', backgroundColor: '#f5f5f5', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 520, margin: '40px auto', background: '#ffffff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>

          {/* Header */}
          <div style={{ background: '#1B3A8A', padding: '24px 32px' }}>
            <Text style={{ color: '#93C5FD', margin: 0, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              WealthWatch
            </Text>
            <Heading style={{ color: '#ffffff', margin: '8px 0 0', fontSize: 20, fontWeight: 600 }}>
              Good morning, {firstName} 👋
            </Heading>
            <Text style={{ color: '#BFDBFE', margin: '4px 0 0', fontSize: 14 }}>
              {dayLabel}
            </Text>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 32px' }}>
            <Text style={{ color: '#374151', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
              {daysSince !== null
                ? `Your last portfolio snapshot was ${daysSince} day${daysSince !== 1 ? 's' : ''} ago. Time for your weekly check-in.`
                : "It's time for your weekly portfolio check-in."}
            </Text>

            {/* Last value card */}
            {lastTotalValue && (
              <Section style={{ background: '#F9FAFB', borderRadius: 8, padding: '16px 20px', margin: '0 0 20px', border: '1px solid #E5E7EB' }}>
                <Text style={{ margin: 0, fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Last recorded portfolio value
                </Text>
                <Text style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 600, color: '#111827', fontFamily: 'ui-monospace, monospace' }}>
                  R{parseFloat(lastTotalValue).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </Text>
                {pnlPctNum !== null && (
                  <Text style={{ margin: '4px 0 0', fontSize: 13, color: pnlPositive ? '#059669' : '#DC2626', fontWeight: 500 }}>
                    {pnlPositive ? '+' : ''}{pnlPctNum.toFixed(2)}% on invested capital
                  </Text>
                )}
              </Section>
            )}

            {/* AI summary */}
            {aiSummary && (
              <Section style={{ background: '#F5F3FF', borderRadius: 8, padding: '14px 18px', margin: '0 0 20px', borderLeft: '3px solid #8B5CF6' }}>
                <Text style={{ margin: '0 0 6px', fontSize: 11, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  AI Summary
                </Text>
                <Text style={{ margin: 0, fontSize: 13, color: '#4C1D95', lineHeight: 1.6 }}>
                  {aiSummary}
                </Text>
              </Section>
            )}

            <Text style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              Log in to your broker (EasyEquities) and Luno, check your current balances, and update today&apos;s values. Takes less than 5 minutes.
            </Text>

            <Button
              href={updateUrl}
              style={{
                background:    '#1B3A8A',
                color:         '#ffffff',
                borderRadius:  8,
                padding:       '13px 28px',
                fontSize:      15,
                fontWeight:    600,
                textDecoration: 'none',
                display:       'inline-block',
              }}
            >
              Update my portfolio →
            </Button>
          </div>

          <Hr style={{ margin: 0, borderColor: '#E5E7EB' }} />

          <div style={{ padding: '16px 32px' }}>
            <Text style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>
              WealthWatch · Weekly portfolio reminder · Manage reminder settings in the app.
              This is not financial advice.
            </Text>
          </div>

        </Container>
      </Body>
    </Html>
  )
}

export default PortfolioReminderEmail
