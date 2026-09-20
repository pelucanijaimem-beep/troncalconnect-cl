export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alertas_internas: {
        Row: {
          created_at: string
          datos: Json
          detalle: string
          estado: string
          id: string
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          datos?: Json
          detalle: string
          estado?: string
          id?: string
          tipo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          datos?: Json
          detalle?: string
          estado?: string
          id?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      calificaciones: {
        Row: {
          autor_id: string
          autor_nombre: string
          carga_id: string | null
          comentario: string
          created_at: string
          criterios: Json
          estrellas: number
          evaluado_id: string | null
          evaluado_nombre: string
          id: string
          ruta: string
          tipo: string
          updated_at: string
        }
        Insert: {
          autor_id: string
          autor_nombre?: string
          carga_id?: string | null
          comentario?: string
          created_at?: string
          criterios?: Json
          estrellas?: number
          evaluado_id?: string | null
          evaluado_nombre?: string
          id?: string
          ruta?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          autor_id?: string
          autor_nombre?: string
          carga_id?: string | null
          comentario?: string
          created_at?: string
          criterios?: Json
          estrellas?: number
          evaluado_id?: string | null
          evaluado_nombre?: string
          id?: string
          ruta?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      cargas: {
        Row: {
          completada_at: string | null
          created_at: string
          destino: string
          detalle: string
          dias_pago: string
          empresa: string
          empresa_telefono: string
          empresa_verificada: boolean
          estado: Database["public"]["Enums"]["estado_carga"]
          fecha: string | null
          fecha_entrega: string | null
          hora_retiro: string
          id: string
          km: number
          origen: string
          pais: string
          precio: number
          solo_verificados: boolean
          tipo_camion: string
          tipo_publicador: string
          titulo: string
          toneladas: number
          user_id: string
          valor_km: number
          visibilidad: string
        }
        Insert: {
          completada_at?: string | null
          created_at?: string
          destino: string
          detalle?: string
          dias_pago?: string
          empresa: string
          empresa_telefono?: string
          empresa_verificada?: boolean
          estado?: Database["public"]["Enums"]["estado_carga"]
          fecha?: string | null
          fecha_entrega?: string | null
          hora_retiro?: string
          id?: string
          km?: number
          origen: string
          pais?: string
          precio?: number
          solo_verificados?: boolean
          tipo_camion: string
          tipo_publicador?: string
          titulo: string
          toneladas?: number
          user_id: string
          valor_km?: number
          visibilidad?: string
        }
        Update: {
          completada_at?: string | null
          created_at?: string
          destino?: string
          detalle?: string
          dias_pago?: string
          empresa?: string
          empresa_telefono?: string
          empresa_verificada?: boolean
          estado?: Database["public"]["Enums"]["estado_carga"]
          fecha?: string | null
          fecha_entrega?: string | null
          hora_retiro?: string
          id?: string
          km?: number
          origen?: string
          pais?: string
          precio?: number
          solo_verificados?: boolean
          tipo_camion?: string
          tipo_publicador?: string
          titulo?: string
          toneladas?: number
          user_id?: string
          valor_km?: number
          visibilidad?: string
        }
        Relationships: []
      }
      favoritos: {
        Row: {
          carga_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          carga_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          carga_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      intentos_login: {
        Row: {
          bloqueado_hasta: string | null
          clave: string
          created_at: string
          id: string
          intentos: number
          updated_at: string
        }
        Insert: {
          bloqueado_hasta?: string | null
          clave: string
          created_at?: string
          id?: string
          intentos?: number
          updated_at?: string
        }
        Update: {
          bloqueado_hasta?: string | null
          clave?: string
          created_at?: string
          id?: string
          intentos?: number
          updated_at?: string
        }
        Relationships: []
      }
      invitaciones_carga: {
        Row: {
          carga_id: string
          created_at: string
          id: string
          invitado_id: string
        }
        Insert: {
          carga_id: string
          created_at?: string
          id?: string
          invitado_id: string
        }
        Update: {
          carga_id?: string
          created_at?: string
          id?: string
          invitado_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitaciones_carga_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string
          datos: Json
          id: string
          leida: boolean
          mensaje: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          datos?: Json
          id?: string
          leida?: boolean
          mensaje?: string
          tipo?: string
          titulo?: string
          user_id: string
        }
        Update: {
          created_at?: string
          datos?: Json
          id?: string
          leida?: boolean
          mensaje?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          bloqueado: boolean
          created_at: string
          email: string
          fundador: boolean
          fundador_numero: number | null
          id: string
          nombre: string
          plan_activo: boolean
          rol: Database["public"]["Enums"]["rol_usuario"]
          rut: string | null
          rut_normalizado: string | null
          telefono: string | null
          tipo_publicador: string
          verificado: boolean
        }
        Insert: {
          bloqueado?: boolean
          created_at?: string
          email?: string
          fundador?: boolean
          fundador_numero?: number | null
          id: string
          nombre?: string
          plan_activo?: boolean
          rol?: Database["public"]["Enums"]["rol_usuario"]
          rut?: string | null
          rut_normalizado?: string | null
          telefono?: string | null
          tipo_publicador?: string
          verificado?: boolean
        }
        Update: {
          bloqueado?: boolean
          created_at?: string
          email?: string
          fundador?: boolean
          fundador_numero?: number | null
          id?: string
          nombre?: string
          plan_activo?: boolean
          rol?: Database["public"]["Enums"]["rol_usuario"]
          rut?: string | null
          rut_normalizado?: string | null
          telefono?: string | null
          tipo_publicador?: string
          verificado?: boolean
        }
        Relationships: []
      }
      postulaciones: {
        Row: {
          carga_id: string
          created_at: string
          id: string
          mensaje: string
          user_id: string
        }
        Insert: {
          carga_id: string
          created_at?: string
          id?: string
          mensaje?: string
          user_id: string
        }
        Update: {
          carga_id?: string
          created_at?: string
          id?: string
          mensaje?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "postulaciones_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      preferencias_alertas: {
        Row: {
          activo: boolean
          alertas_email: boolean
          carrocerias: string[]
          ciudad_base: string
          created_at: string
          destinos: string[]
          email: string
          id: string
          nombre: string
          origenes: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          alertas_email?: boolean
          carrocerias?: string[]
          ciudad_base?: string
          created_at?: string
          destinos?: string[]
          email?: string
          id?: string
          nombre?: string
          origenes?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          alertas_email?: boolean
          carrocerias?: string[]
          ciudad_base?: string
          created_at?: string
          destinos?: string[]
          email?: string
          id?: string
          nombre?: string
          origenes?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reportes: {
        Row: {
          carga_id: string | null
          created_at: string
          detalle: string
          estado: string
          id: string
          motivo: string
          nota_admin: string
          reportado_id: string | null
          reportado_nombre: string
          reportante_id: string
          tipo: string
          updated_at: string
        }
        Insert: {
          carga_id?: string | null
          created_at?: string
          detalle?: string
          estado?: string
          id?: string
          motivo?: string
          nota_admin?: string
          reportado_id?: string | null
          reportado_nombre?: string
          reportante_id: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          carga_id?: string | null
          created_at?: string
          detalle?: string
          estado?: string
          id?: string
          motivo?: string
          nota_admin?: string
          reportado_id?: string | null
          reportado_nombre?: string
          reportante_id?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportes_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitudes_eliminacion: {
        Row: {
          created_at: string
          email: string
          estado: string
          id: string
          motivo: string
          origen: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          estado?: string
          id?: string
          motivo?: string
          origen?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          estado?: string
          id?: string
          motivo?: string
          origen?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vencimientos_documentales: {
        Row: {
          avisos: Json
          carga_peligrosa: string | null
          created_at: string
          id: string
          patente: string
          permiso_circulacion: string | null
          revision_tecnica: string | null
          soap: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avisos?: Json
          carga_peligrosa?: string | null
          created_at?: string
          id?: string
          patente?: string
          permiso_circulacion?: string | null
          revision_tecnica?: string | null
          soap?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avisos?: Json
          carga_peligrosa?: string | null
          created_at?: string
          id?: string
          patente?: string
          permiso_circulacion?: string | null
          revision_tecnica?: string | null
          soap?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verificaciones: {
        Row: {
          asegurado: boolean
          checklist: Json
          created_at: string
          documentos: Json
          estado: string
          id: string
          nombre: string
          nota_admin: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asegurado?: boolean
          checklist?: Json
          created_at?: string
          documentos?: Json
          estado?: string
          id?: string
          nombre?: string
          nota_admin?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asegurado?: boolean
          checklist?: Json
          created_at?: string
          documentos?: Json
          estado?: string
          id?: string
          nombre?: string
          nota_admin?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viajes_ubicacion: {
        Row: {
          activo: boolean
          carga_id: string
          created_at: string
          id: string
          lat: number
          lng: number
          precision_m: number | null
          transportista_id: string
          updated_at: string
          velocidad: number
        }
        Insert: {
          activo?: boolean
          carga_id: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          precision_m?: number | null
          transportista_id: string
          updated_at?: string
          velocidad?: number
        }
        Update: {
          activo?: boolean
          carga_id?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          precision_m?: number | null
          transportista_id?: string
          updated_at?: string
          velocidad?: number
        }
        Relationships: [
          {
            foreignKeyName: "viajes_ubicacion_carga_id_fkey"
            columns: ["carga_id"]
            isOneToOne: false
            referencedRelation: "cargas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      carga_es_mia: {
        Args: { _carga_id: string; _user_id: string }
        Returns: boolean
      }
      carga_invitado: {
        Args: { _carga_id: string; _user_id: string }
        Returns: boolean
      }
      cupos_fundador: { Args: never; Returns: number }
      metricas_marketplace: { Args: never; Returns: Json }
      mi_perfil: { Args: never; Returns: Json }
      normalizar_rut: { Args: { p_rut: string }; Returns: string }
      perfil_id_por_email: { Args: { p_email: string }; Returns: string }
      perfil_publico: { Args: { p_id: string }; Returns: Json }
      perfiles_admin: { Args: never; Returns: Json }
      reservar_cupo_fundador: { Args: never; Returns: number }
      rut_registrado: { Args: { p_rut: string }; Returns: boolean }
      tarifa_ruta: {
        Args: { _destino: string; _origen: string }
        Returns: {
          promedio: number
          registros: number
        }[]
      }
      tiene_plan_activo: { Args: { _user_id: string }; Returns: boolean }
      tiene_rol: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verificaciones_publicas: {
        Args: never
        Returns: {
          asegurado: boolean
          estado: string
          nombre: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "usuario"
      estado_carga: "activa" | "completada"
      rol_usuario: "camionero" | "empresa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "usuario"],
      estado_carga: ["activa", "completada"],
      rol_usuario: ["camionero", "empresa"],
    },
  },
} as const
