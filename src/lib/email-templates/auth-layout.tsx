import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AuthEmailLayoutProps {
  preview: string
  title: string
  children: React.ReactNode
}

export const AuthEmailLayout = ({
  preview,
  title,
  children,
}: AuthEmailLayoutProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={bodyStyle}>
      <Section style={pageStyle}>
        <Container style={containerStyle}>
          <Section style={brandBarStyle} />
          <Section style={headerStyle}>
            <Text style={brandStyle}>TRONCALTRACK</Text>
            <Text style={taglineStyle}>LOGÍSTICA CONECTADA</Text>
          </Section>
          <Section style={contentStyle}>
            <Heading style={headingStyle}>{title}</Heading>
            {children}
          </Section>
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Mensaje automático de seguridad de TroncalTrack. No respondas a este correo.
            </Text>
            <Text style={footerTextStyle}>Chile · troncaltrack.com</Text>
          </Section>
        </Container>
      </Section>
    </Body>
  </Html>
)

export const textStyle = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

export const buttonStyle = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: '700' as const,
  padding: '13px 22px',
  textDecoration: 'none',
}

export const linkStyle = {
  color: '#b91c1c',
  textDecoration: 'underline',
}

export const noticeStyle = {
  backgroundColor: '#f8fafc',
  borderLeft: '3px solid #dc2626',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '28px 0 0',
  padding: '12px 16px',
}

export const codeStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  color: '#0f172a',
  fontFamily: 'Courier, monospace',
  fontSize: '30px',
  fontWeight: '700' as const,
  letterSpacing: '6px',
  margin: '4px 0 24px',
  padding: '18px',
  textAlign: 'center' as const,
}

const bodyStyle = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: '0',
}

const pageStyle = {
  backgroundColor: '#f1f5f9',
  padding: '36px 12px',
}

const containerStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  maxWidth: '560px',
  overflow: 'hidden',
}

const brandBarStyle = {
  backgroundColor: '#dc2626',
  height: '5px',
}

const headerStyle = {
  borderBottom: '1px solid #e2e8f0',
  padding: '24px 32px 20px',
}

const brandStyle = {
  color: '#0f172a',
  fontSize: '20px',
  fontWeight: '800' as const,
  margin: '0',
}

const taglineStyle = {
  color: '#dc2626',
  fontSize: '10px',
  fontWeight: '700' as const,
  margin: '4px 0 0',
}

const contentStyle = {
  padding: '30px 32px 34px',
}

const headingStyle = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '800' as const,
  lineHeight: '32px',
  margin: '0 0 18px',
}

const footerStyle = {
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
  padding: '18px 32px',
}

const footerTextStyle = {
  color: '#94a3b8',
  fontSize: '11px',
  lineHeight: '17px',
  margin: '0 0 3px',
}