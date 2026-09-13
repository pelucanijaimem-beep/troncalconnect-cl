import * as React from 'react'

import { Button, Text } from '@react-email/components'
import {
  AuthEmailLayout,
  buttonStyle,
  noticeStyle,
  textStyle,
} from './auth-layout'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <AuthEmailLayout
    preview={`Restablece tu contraseña de ${siteName}`}
    title="Restablece tu contraseña"
  >
        <Text style={textStyle}>
          Recibimos una solicitud para cambiar la contraseña de tu cuenta en {siteName}.
        </Text>
        <Text style={textStyle}>
          Usa el botón para crear una nueva contraseña segura.
        </Text>
        <Button style={buttonStyle} href={confirmationUrl}>
          Crear nueva contraseña
        </Button>
        <Text style={noticeStyle}>
          Si no solicitaste este cambio, ignora el mensaje. Tu contraseña seguirá igual.
        </Text>
  </AuthEmailLayout>
)

export default RecoveryEmail
