import * as React from 'react'

import { Text } from '@react-email/components'
import {
  AuthEmailLayout,
  codeStyle,
  noticeStyle,
  textStyle,
} from './auth-layout'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <AuthEmailLayout
    preview="Tu código de seguridad para TroncalTrack"
    title="Confirma tu identidad"
  >
        <Text style={textStyle}>Usa este código para confirmar tu identidad:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={noticeStyle}>
          El código vencerá pronto. Si no lo solicitaste, ignora este mensaje y no lo compartas.
        </Text>
  </AuthEmailLayout>
)

export default ReauthenticationEmail
