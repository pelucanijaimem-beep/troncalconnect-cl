import * as React from 'react'

import { Button, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  buttonStyle,
  noticeStyle,
  textStyle,
} from './auth-layout'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <AuthEmailLayout
    preview={`Tu enlace seguro para ingresar a ${siteName}`}
    title="Ingresa de forma segura"
  >
        <Text style={textStyle}>
          Usa el botón para ingresar a {siteName}. Este enlace es personal y vencerá pronto.
        </Text>
        <Button style={buttonStyle} href={confirmationUrl}>
          Ingresar a mi cuenta
        </Button>
        <Text style={noticeStyle}>
          Si no solicitaste este acceso, ignora el mensaje y no compartas el enlace.
        </Text>
  </AuthEmailLayout>
)

export default MagicLinkEmail
