import * as React from 'react'

import { Button, Link, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  buttonStyle,
  linkStyle,
  noticeStyle,
  textStyle,
} from './auth-layout'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <AuthEmailLayout
    preview={`Confirma tu correo para activar tu cuenta en ${siteName}`}
    title="Confirma tu correo electrónico"
  >
        <Text style={textStyle}>
          Gracias por registrarte en{' '}
          <Link href={siteUrl} style={linkStyle}>
            <strong>{siteName}</strong>
          </Link>
          .
        </Text>
        <Text style={textStyle}>
          Confirma la dirección{' '}
          <Link href={`mailto:${recipient}`} style={linkStyle}>
            {recipient}
          </Link>{' '}
          para activar tu cuenta y acceder a la plataforma.
        </Text>
        <Button style={buttonStyle} href={confirmationUrl}>
          Confirmar mi correo
        </Button>
        <Text style={noticeStyle}>
          Si no creaste esta cuenta, puedes ignorar este mensaje de forma segura.
        </Text>
  </AuthEmailLayout>
)

export default SignupEmail
