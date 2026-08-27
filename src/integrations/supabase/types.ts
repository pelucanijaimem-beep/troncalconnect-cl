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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      cargas: {
        Row: {
          created_at: string
          destino: string
          detalle: string
          dias_pago: string
          empresa: string
          empresa_telefono: string
          empresa_verificada: boolean
          estado: Database["public"]["Enums"]["estado_carga"]
          fecha: string | null
          id: string
          km: number
          origen: string
          pais: string
          precio: number
          solo_verificados: boolean
          tipo_camion: string
          titulo: string
          toneladas: number
          user_id: string
          valor_km: number
        }
        Insert: {
          created_at?: string
          destino: string
          detalle?: string
          dias_pago?: string
          empresa: string
          empresa_telefono?: string
          empresa_verificada?: boolean
          estado?: Database["public"]["Enums"]["estado_carga"]
          fecha?: string | null
          id?: string
          km?: number
          origen: string
          pais?: string
          precio?: number
          solo_verificados?: boolean
          tipo_camion: string
          titulo: string
          toneladas?: number
          user_id: string
          valor_km?: number
        }
        Update: {
          created_at?: string
          destino?: string
          detalle?: string
          dias_pago?: string
          empresa?: string
          empresa_telefono?: string
          empresa_verificada?: boolean
          estado?: Database["public"]["Enums"]["estado_carga"]
          fecha?: string | null
          id?: string
          km?: number
          origen?: string
          pais?: string
          precio?: number
          solo_verificados?: boolean
          tipo_camion?: string
          titulo?: string
          toneladas?: number
          user_id?: string
          valor_km?: number
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          bloqueado: boolean
          created_at: string
          email: string
          id: string
          nombre: string
          plan_activo: boolean
          rol: Database["public"]["Enums"]["rol_usuario"]
          rut: string | null
          telefono: string | null
          verificado: boolean
        }
        Insert: {
          bloqueado?: boolean
          created_at?: string
          email?: string
          id: string
          nombre?: string
          plan_activo?: boolean
          rol?: Database["public"]["Enums"]["rol_usuario"]
          rut?: string | null
          telefono?: string | null
          verificado?: boolean
        }
        Update: {
          bloqueado?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          plan_activo?: boolean
          rol?: Database["public"]["Enums"]["rol_usuario"]
          rut?: string | null
          telefono?: string | null
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
      verificaciones: {
        Row: {
          asegurado: boolean
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      tiene_plan_activo: { Args: { _user_id: string }; Returns: boolean }
      tiene_rol: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
