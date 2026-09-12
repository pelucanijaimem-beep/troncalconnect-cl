import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  empresa?: string
  camionero?: string
  sello?: string
  telefono?: string
  correo?: string
  carga?: string
  ruta?: string
}

const Email = ({
  empresa,
  camionero = 'Un camionero',
  sello = 'Sin verificación TroncalCheck',
  telefono = 'No informado',
  correo = 'No informado',
  carga = 'tu carga',
  ruta = '',
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{`${camionero} postuló a ${ruta || carga}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>TroncalTrack</Text>
        <Heading style={h1}>Recibiste una postulación</Heading>
        <Text style={text}>
          {empresa ? `Hola ${empresa}, ` : 'Hola, '}
          <strong>{camionero}</strong> postuló a tu carga <strong>{carga}</strong>
          {ruta ? ` (${ruta})` : ''}.
        </Text>
        <Section style={box}>
          <Text style={item}>
            <strong>Sello de confianza:</strong> {sello}
          </Text>
          <Text style={item}>
            <strong>Teléfono:</strong> {telefono}
          </Text>
          <Text style={item}>
            <strong>Correo:</strong> {correo}
          </Text>
        </Section>
        <Text style={text}>
          Ingresa a tu panel para revisar el perfil completo y confirmar el viaje.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Aviso automático de TroncalTrack.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Nueva postulación: ${data?.['ruta'] ?? data?.['carga'] ?? 'tu carga'}`,
  displayName: 'Aviso de postulación',
  previewData: {
    empresa: 'Transportes del Sur',
    camionero: 'Juan Pérez',
    sello: 'Verificado — TroncalCheck',
    telefono: '+56 9 1234 5678',
    correo: 'juan@correo.cl',
    carga: 'Los Ángeles → Santiago',
    ruta: 'Los Ángeles → Santiago',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px', maxWidth: '560px' }
const brand = { color: '#c1121f', fontSize: '14px', fontWeight: 700, letterSpacing: '1px', margin: '0 0 8px' }
const h1 = { color: '#111111', fontSize: '22px', margin: '0 0 16px' }
const text = { color: '#333333', fontSize: '15px', lineHeight: '1.6' }
const box = { backgroundColor: '#f6f7f9', borderRadius: '8px', padding: '12px 16px' }
const item = { color: '#333333', fontSize: '14px', margin: '4px 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0 12px' }
const footer = { color: '#666666', fontSize: '12px' }
