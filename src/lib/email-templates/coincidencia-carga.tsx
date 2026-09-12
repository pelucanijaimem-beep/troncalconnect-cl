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
  nombre?: string
  carga?: string
  ruta?: string
  carroceria?: string
  km?: string | number
}

const Email = ({
  nombre,
  carga = 'Nueva carga disponible',
  ruta = '',
  carroceria = 'No informada',
  km = 'No informados',
}: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{`Carga disponible: ${ruta || carga}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>TroncalTrack</Text>
        <Heading style={h1}>Una carga nueva calza con tus rutas</Heading>
        <Text style={text}>
          {nombre ? `Hola ${nombre}, ` : 'Hola, '}se publicó una carga que coincide con tus
          preferencias.
        </Text>
        <Section style={box}>
          <Text style={item}>
            <strong>Carga:</strong> {carga}
          </Text>
          {ruta ? (
            <Text style={item}>
              <strong>Ruta:</strong> {ruta}
            </Text>
          ) : null}
          <Text style={item}>
            <strong>Carrocería:</strong> {carroceria}
          </Text>
          <Text style={item}>
            <strong>Kilómetros:</strong> {km}
          </Text>
        </Section>
        <Text style={text}>
          Ingresa a tu tablero para postular con un clic antes que otro transportista.
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
    `Carga disponible: ${data?.['ruta'] ?? data?.['carga'] ?? 'nueva ruta'}`,
  displayName: 'Alerta de coincidencia de carga',
  previewData: {
    nombre: 'Juan',
    carga: 'Los Ángeles → Santiago',
    ruta: 'Los Ángeles → Santiago',
    carroceria: 'Rampla Plana',
    km: 510,
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
