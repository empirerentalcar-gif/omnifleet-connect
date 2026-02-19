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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_used: boolean
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agencies: {
        Row: {
          active: boolean
          address: string | null
          agency_name: string
          approved: boolean
          city: string | null
          created_at: string
          email: string | null
          id: string
          owner_user_id: string | null
          phone: string | null
          state: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          agency_name: string
          approved?: boolean
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          owner_user_id?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          agency_name?: string
          approved?: boolean
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          owner_user_id?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      agency_notes: {
        Row: {
          admin_email: string
          admin_user_id: string
          agency_id: string
          created_at: string
          id: string
          note_text: string
        }
        Insert: {
          admin_email: string
          admin_user_id: string
          agency_id: string
          created_at?: string
          id?: string
          note_text: string
        }
        Update: {
          admin_email?: string
          admin_user_id?: string
          agency_id?: string
          created_at?: string
          id?: string
          note_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_notes_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          active: boolean
          city: string | null
          code: string
          created_at: string
          expires_at: string | null
          id: string
          max_uses: number
          updated_at: string
          uses_count: number
        }
        Insert: {
          active?: boolean
          city?: string | null
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          updated_at?: string
          uses_count?: number
        }
        Update: {
          active?: boolean
          city?: string | null
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          max_uses?: number
          updated_at?: string
          uses_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          business_name: string
          cancellation_policy: string | null
          cash_accepted: boolean
          city: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          deposit_info: string | null
          id: string
          owner_story: string | null
          photos: string[] | null
          requirements: string[] | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          cancellation_policy?: string | null
          cash_accepted?: boolean
          city?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          deposit_info?: string | null
          id?: string
          owner_story?: string | null
          photos?: string[] | null
          requirements?: string[] | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          cancellation_policy?: string | null
          cash_accepted?: boolean
          city?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          deposit_info?: string | null
          id?: string
          owner_story?: string | null
          photos?: string[] | null
          requirements?: string[] | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      reservation_requests: {
        Row: {
          agency_name: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          dropoff_date: string
          id: string
          notes: string | null
          pickup_date: string
          profile_id: string | null
          status: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          agency_name: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          dropoff_date: string
          id?: string
          notes?: string | null
          pickup_date: string
          profile_id?: string | null
          status?: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          agency_name?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          dropoff_date?: string
          id?: string
          notes?: string | null
          pickup_date?: string
          profile_id?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rpc_rate_limits: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          function_name: string
          id: string
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          function_name: string
          id?: string
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          function_name?: string
          id?: string
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          profile_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          profile_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          profile_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      vehicles: {
        Row: {
          created_at: string
          daily_rate: number
          description: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          images: string[] | null
          location_city: string | null
          location_state: string | null
          make: string
          model: string
          profile_id: string
          seats: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          transmission: string | null
          updated_at: string
          vehicle_type: string
          year: number
        }
        Insert: {
          created_at?: string
          daily_rate: number
          description?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          location_city?: string | null
          location_state?: string | null
          make: string
          model: string
          profile_id: string
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: string | null
          updated_at?: string
          vehicle_type: string
          year: number
        }
        Update: {
          created_at?: string
          daily_rate?: number
          description?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          location_city?: string | null
          location_state?: string | null
          make?: string
          model?: string
          profile_id?: string
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: string | null
          updated_at?: string
          vehicle_type?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      available_vehicles_public: {
        Row: {
          agency_photos: string[] | null
          business_name: string | null
          cancellation_policy: string | null
          cash_accepted: boolean | null
          daily_rate: number | null
          deposit_info: string | null
          description: string | null
          features: string[] | null
          fuel_type: string | null
          id: string | null
          images: string[] | null
          location_city: string | null
          location_state: string | null
          make: string | null
          model: string | null
          owner_story: string | null
          profile_id: string | null
          requirements: string[] | null
          seats: number | null
          transmission: string | null
          vehicle_type: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      bootstrap_first_admin: { Args: never; Returns: boolean }
      check_rate_limit: {
        Args: {
          func_name: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_access_code: {
        Args: { code_to_redeem: string; user_profile_id: string }
        Returns: boolean
      }
      validate_access_code: {
        Args: { code_to_check: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      subscription_status: "active" | "pending" | "cancelled" | "expired"
      subscription_tier: "weekly" | "monthly" | "yearly"
      vehicle_status: "available" | "rented" | "maintenance" | "inactive"
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
      app_role: ["admin", "user"],
      subscription_status: ["active", "pending", "cancelled", "expired"],
      subscription_tier: ["weekly", "monthly", "yearly"],
      vehicle_status: ["available", "rented", "maintenance", "inactive"],
    },
  },
} as const
