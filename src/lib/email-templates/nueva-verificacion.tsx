import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  nombre?: string
  rut?: string
  tipoCuenta?: string
  documentos?: string[]
}

const Email = ({
  nombre = 'Usuario sin nombre',
  rut = 'No informado',
  tipoCuenta = 'No informado',
  documentos = [],
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{`${nombre} subió documentos para TroncalCheck`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nuevos documentos para revisar</Heading>
        <Text style={text}>Un usuario envió documentos para su verificación TroncalCheck.</Text>
        <Section style={box}>
          <Text style={text}><strong>Nombre:</strong> {nombre}</Text>
          <Text style={text}><strong>RUT:</strong> {rut}</Text>
          <Text style={text}><strong>Tipo de cuenta:</strong> {tipoCuenta}</Text>
          <Text style={text}><strong>Documentos subidos:</strong></Text>
          {documentos.length ? (
            documentos.map((d) => (
              <Text key={d} style={item}>• {d}</Text>
            ))
          ) : (
            <Text style={item}>Sin detalle</Text>
          )}
        </Section>
        <Hr />
        <Text style={small}>Revisa y aprueba o rechaza cada documento en el panel de administración de TroncalTrack.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Nueva verificación TroncalCheck: ${d['nombre'] ?? 'usuario'}`,
  displayName: 'Aviso interno de documentos subidos',
  to: 'pelucanijaimem@gmail.com',
  previewData: {
    nombre: 'Juan Pérez',
    rut: '12.345.678-9',
    tipoCuenta: 'Transportista / Operador de Flota',
    documentos: ['Revisión Técnica al día', 'Permiso de Circulación'],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px' }
const h1 = { color: '#c8102e', fontSize: '22px' }
const text = { color: '#1f2937', fontSize: '14px', margin: '4px 0' }
const item = { color: '#1f2937', fontSize: '14px', margin: '2px 0 2px 12px' }
const box = { border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px' }
const small = { color: '#6b7280', fontSize: '12px' }
