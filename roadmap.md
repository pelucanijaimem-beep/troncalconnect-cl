# Tareas
- [x] Restringir lectura de archivos documentales exclusivamente a administradores y auditar vistas y respuestas públicas.
- [x] Probar permisos de lectura documental como usuario sin privilegios, visitante, dueño no administrador y administrador en la base de datos.
- [ ] Probar descarga y revisión en el panel con sesión real; bloqueado: no se pudo obtener una sesión autorizada del solicitante, debe iniciar sesión en la vista previa.
- [x] Confirmar y reforzar RUT obligatorio y válido en ambos registros y en el perfil.
- [x] Preparar recepción firmada de identidad y cruce de RUT con sesión vinculada en servidor; dirección: /api/public/identidad. Firma, comparación y receptor probados sin credenciales reales.
- [ ] Activar y probar aviso real de identidad. Bloqueado: publicar el receptor, configurar destino y secreto compartido, clave de API e identificador del flujo; conectar inicio de cédula y selfie al formulario existente.
- [x] Probar rechazo visible de RUT inválido y reglas módulo 11 en cliente y base de datos.
- [ ] Probar registro válido y persistencia con cuenta de pruebas autorizada; no se crearon cuentas ni se modificaron perfiles existentes.