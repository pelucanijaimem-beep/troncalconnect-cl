import * as React from 'react'

import { Button, Link, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  buttonStyle,
  linkStyle,
  noticeStyle,
  textStyle,
} from './auth-layout'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <AuthEmailLayout
    preview={`Confirma el cambio de correo de tu cuenta en ${siteName}`}
    title="Confirma tu nuevo correo"
  >
        <Text style={textStyle}>
          Solicitaste cambiar el correo de tu cuenta en {siteName} desde{' '}
          <Link href={`mailto:${oldEmail}`} style={linkStyle}>
            {oldEmail}
          </Link>{' '}
          a{' '}
          <Link href={`mailto:${newEmail}`} style={linkStyle}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={textStyle}>
          Confirma el cambio para mantener actualizados tus datos de acceso.
        </Text>
        <Button style={buttonStyle} href={confirmationUrl}>
          Confirmar nuevo correo
        </Button>
        <Text style={noticeStyle}>
          Si no solicitaste este cambio, no uses el botón y revisa la seguridad de tu cuenta.
        </Text>
  </AuthEmailLayout>
)

export default EmailChangeEmail
