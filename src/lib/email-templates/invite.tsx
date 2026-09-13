import * as React from 'react'

import { Button, Link, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  buttonStyle,
  linkStyle,
  noticeStyle,
  textStyle,
} from './auth-layout'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <AuthEmailLayout
    preview={`Recibiste una invitación para unirte a ${siteName}`}
    title="Te invitaron a TroncalTrack"
  >
        <Text style={textStyle}>
          Recibiste una invitación para unirte a{' '}
          <Link href={siteUrl} style={linkStyle}>
            <strong>{siteName}</strong>
          </Link>
          , la plataforma que conecta transportistas y empresas de carga.
        </Text>
        <Text style={textStyle}>
          Acepta la invitación para crear tu cuenta y comenzar.
        </Text>
        <Button style={buttonStyle} href={confirmationUrl}>
          Aceptar invitación
        </Button>
        <Text style={noticeStyle}>
          Si no esperabas esta invitación, puedes ignorar este mensaje.
        </Text>
  </AuthEmailLayout>
)

export default InviteEmail
