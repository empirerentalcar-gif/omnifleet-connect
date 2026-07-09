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
      admin_audit_log: {
        Row: {
          action_type: string
          admin_email: string | null
          admin_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_label: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_email?: string | null
          admin_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_email?: string | null
          admin_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_label?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          active: boolean
          address: string | null
          agency_name: string
          approved: boolean
          city: string | null
          commission_rate_bps: number
          created_at: string
          custom_fees: Json
          day40_reminder_sent: boolean
          day50_reminder_sent: boolean
          day60_notice_sent: boolean
          email: string | null
          fee_settings: Json
          fees_setup_complete: boolean
          founding_member_number: number | null
          grace_period_end: string | null
          id: string
          is_founding_member: boolean
          last_payout_amount_cents: number | null
          last_payout_at: string | null
          last_payout_failure_message: string | null
          last_payout_status: string | null
          owner_user_id: string | null
          payment_methods: Json
          payment_restrictions: string | null
          phone: string | null
          state: string | null
          stripe_charges_enabled: boolean
          stripe_connect_account_id: string | null
          stripe_connect_status: string
          stripe_customer_id: string | null
          stripe_payouts_enabled: boolean
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_status: string
          tax_rate: number
          tos_version_2026_06: boolean
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          agency_name: string
          approved?: boolean
          city?: string | null
          commission_rate_bps?: number
          created_at?: string
          custom_fees?: Json
          day40_reminder_sent?: boolean
          day50_reminder_sent?: boolean
          day60_notice_sent?: boolean
          email?: string | null
          fee_settings?: Json
          fees_setup_complete?: boolean
          founding_member_number?: number | null
          grace_period_end?: string | null
          id?: string
          is_founding_member?: boolean
          last_payout_amount_cents?: number | null
          last_payout_at?: string | null
          last_payout_failure_message?: string | null
          last_payout_status?: string | null
          owner_user_id?: string | null
          payment_methods?: Json
          payment_restrictions?: string | null
          phone?: string | null
          state?: string | null
          stripe_charges_enabled?: boolean
          stripe_connect_account_id?: string | null
          stripe_connect_status?: string
          stripe_customer_id?: string | null
          stripe_payouts_enabled?: boolean
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string
          tax_rate?: number
          tos_version_2026_06?: boolean
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          agency_name?: string
          approved?: boolean
          city?: string | null
          commission_rate_bps?: number
          created_at?: string
          custom_fees?: Json
          day40_reminder_sent?: boolean
          day50_reminder_sent?: boolean
          day60_notice_sent?: boolean
          email?: string | null
          fee_settings?: Json
          fees_setup_complete?: boolean
          founding_member_number?: number | null
          grace_period_end?: string | null
          id?: string
          is_founding_member?: boolean
          last_payout_amount_cents?: number | null
          last_payout_at?: string | null
          last_payout_failure_message?: string | null
          last_payout_status?: string | null
          owner_user_id?: string | null
          payment_methods?: Json
          payment_restrictions?: string | null
          phone?: string | null
          state?: string | null
          stripe_charges_enabled?: boolean
          stripe_connect_account_id?: string | null
          stripe_connect_status?: string
          stripe_customer_id?: string | null
          stripe_payouts_enabled?: boolean
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string
          tax_rate?: number
          tos_version_2026_06?: boolean
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      agency_agreements: {
        Row: {
          agency_id: string
          agreed_at: string
          agreement_text: string
          created_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          agency_id: string
          agreed_at?: string
          agreement_text: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          agency_id?: string
          agreed_at?: string
          agreement_text?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_agreements_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
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
      agency_public_profiles: {
        Row: {
          business_name: string
          cancellation_policy: string | null
          cash_accepted: boolean
          created_at: string
          deposit_info: string | null
          owner_story: string | null
          photos: string[] | null
          profile_id: string
          requirements: string[] | null
          updated_at: string
        }
        Insert: {
          business_name: string
          cancellation_policy?: string | null
          cash_accepted?: boolean
          created_at?: string
          deposit_info?: string | null
          owner_story?: string | null
          photos?: string[] | null
          profile_id: string
          requirements?: string[] | null
          updated_at?: string
        }
        Update: {
          business_name?: string
          cancellation_policy?: string | null
          cash_accepted?: boolean
          created_at?: string
          deposit_info?: string | null
          owner_story?: string | null
          photos?: string[] | null
          profile_id?: string
          requirements?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_public_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agency_id: string
          booking_status: string
          capture_method: string
          confirmation_email_sent_at: string | null
          created_at: string
          currency: string
          daily_rate_cents: number
          decline_reason: string | null
          dispute_status: string | null
          disputed: boolean
          dropoff_date: string
          id: string
          payment_method_id: string | null
          payment_status: string
          pickup_date: string
          platform_fee_cents: number
          profile_id: string
          rental_days: number
          renter_email: string
          renter_name: string
          renter_phone: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_setup_intent_id: string | null
          total_amount_cents: number
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          agency_id: string
          booking_status?: string
          capture_method?: string
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          daily_rate_cents: number
          decline_reason?: string | null
          dispute_status?: string | null
          disputed?: boolean
          dropoff_date: string
          id?: string
          payment_method_id?: string | null
          payment_status?: string
          pickup_date: string
          platform_fee_cents: number
          profile_id: string
          rental_days: number
          renter_email: string
          renter_name: string
          renter_phone: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_setup_intent_id?: string | null
          total_amount_cents: number
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          agency_id?: string
          booking_status?: string
          capture_method?: string
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          daily_rate_cents?: number
          decline_reason?: string | null
          dispute_status?: string | null
          disputed?: boolean
          dropoff_date?: string
          id?: string
          payment_method_id?: string | null
          payment_status?: string
          pickup_date?: string
          platform_fee_cents?: number
          profile_id?: string
          rental_days?: number
          renter_email?: string
          renter_name?: string
          renter_phone?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_setup_intent_id?: string | null
          total_amount_cents?: number
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "available_vehicles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          agency_id: string | null
          amount_cents: number
          booking_id: string | null
          closed_at: string | null
          created_at: string
          currency: string
          evidence_due_by: string | null
          funds_reinstated_at: string | null
          funds_withdrawn: boolean
          funds_withdrawn_at: string | null
          id: string
          opened_at: string
          outcome: string | null
          raw: Json | null
          reason: string | null
          status: string
          stripe_charge_id: string | null
          stripe_dispute_id: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          agency_id?: string | null
          amount_cents?: number
          booking_id?: string | null
          closed_at?: string | null
          created_at?: string
          currency?: string
          evidence_due_by?: string | null
          funds_reinstated_at?: string | null
          funds_withdrawn?: boolean
          funds_withdrawn_at?: string | null
          id?: string
          opened_at?: string
          outcome?: string | null
          raw?: Json | null
          reason?: string | null
          status: string
          stripe_charge_id?: string | null
          stripe_dispute_id: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          agency_id?: string | null
          amount_cents?: number
          booking_id?: string | null
          closed_at?: string | null
          created_at?: string
          currency?: string
          evidence_due_by?: string | null
          funds_reinstated_at?: string | null
          funds_withdrawn?: boolean
          funds_withdrawn_at?: string | null
          id?: string
          opened_at?: string
          outcome?: string | null
          raw?: Json | null
          reason?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_dispute_id?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          agency_id: string | null
          email_type: string
          error_message: string | null
          id: string
          recipient: string | null
          retry_count: number
          sent_at: string
          status: string
        }
        Insert: {
          agency_id?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          recipient?: string | null
          retry_count?: number
          sent_at?: string
          status: string
        }
        Update: {
          agency_id?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          recipient?: string | null
          retry_count?: number
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
      reservations: {
        Row: {
          additional_notes: string | null
          agency_id: string | null
          created_at: string
          dropoff_date: string
          email: string | null
          full_name: string
          id: string
          phone_number: string
          pickup_date: string
          status: string
          vehicle_type: string
        }
        Insert: {
          additional_notes?: string | null
          agency_id?: string | null
          created_at?: string
          dropoff_date: string
          email?: string | null
          full_name: string
          id?: string
          phone_number: string
          pickup_date: string
          status?: string
          vehicle_type: string
        }
        Update: {
          additional_notes?: string | null
          agency_id?: string | null
          created_at?: string
          dropoff_date?: string
          email?: string | null
          full_name?: string
          id?: string
          phone_number?: string
          pickup_date?: string
          status?: string
          vehicle_type?: string
        }
        Relationships: []
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
      sensitive_update_failures: {
        Row: {
          actual_value: string | null
          agency_id: string | null
          created_at: string
          error_message: string | null
          expected_value: string | null
          field_name: string
          id: string
          ip_address: string | null
          source: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actual_value?: string | null
          agency_id?: string | null
          created_at?: string
          error_message?: string | null
          expected_value?: string | null
          field_name: string
          id?: string
          ip_address?: string | null
          source: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actual_value?: string | null
          agency_id?: string | null
          created_at?: string
          error_message?: string | null
          expected_value?: string | null
          field_name?: string
          id?: string
          ip_address?: string | null
          source?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          id: string
          payload: Json | null
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string
          stripe_event_id?: string
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      vehicles: {
        Row: {
          created_at: string
          custom_fees_override: Json | null
          daily_rate: number
          description: string | null
          features: string[] | null
          fee_settings_override: Json | null
          fees_banner_dismissed: boolean | null
          fuel_type: string | null
          id: string
          images: string[] | null
          location_city: string | null
          location_state: string | null
          make: string
          model: string
          payment_methods_override: Json | null
          payment_restrictions_override: string | null
          profile_id: string
          seats: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          tax_rate_override: number | null
          transmission: string | null
          updated_at: string
          vehicle_type: string
          year: number
        }
        Insert: {
          created_at?: string
          custom_fees_override?: Json | null
          daily_rate: number
          description?: string | null
          features?: string[] | null
          fee_settings_override?: Json | null
          fees_banner_dismissed?: boolean | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          location_city?: string | null
          location_state?: string | null
          make: string
          model: string
          payment_methods_override?: Json | null
          payment_restrictions_override?: string | null
          profile_id: string
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          tax_rate_override?: number | null
          transmission?: string | null
          updated_at?: string
          vehicle_type: string
          year: number
        }
        Update: {
          created_at?: string
          custom_fees_override?: Json | null
          daily_rate?: number
          description?: string | null
          features?: string[] | null
          fee_settings_override?: Json | null
          fees_banner_dismissed?: boolean | null
          fuel_type?: string | null
          id?: string
          images?: string[] | null
          location_city?: string | null
          location_state?: string | null
          make?: string
          model?: string
          payment_methods_override?: Json | null
          payment_restrictions_override?: string | null
          profile_id?: string
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          tax_rate_override?: number | null
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
          agency_custom_fees: Json | null
          agency_fee_settings: Json | null
          agency_payment_methods: Json | null
          agency_payment_restrictions: string | null
          agency_photos: string[] | null
          agency_tax_rate: number | null
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
          vehicle_custom_fees: Json | null
          vehicle_fee_settings: Json | null
          vehicle_payment_methods: Json | null
          vehicle_payment_restrictions: string | null
          vehicle_tax_rate: number | null
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
      assign_agency_owner: {
        Args: { _agency_id: string; _owner_user_id: string }
        Returns: undefined
      }
      bootstrap_first_admin: { Args: never; Returns: boolean }
      check_rate_limit: {
        Args: {
          func_name: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_agency_payment_defaults: {
        Args: { _profile_id: string }
        Returns: {
          custom_fees: Json
          fee_settings: Json
          payment_methods: Json
          payment_restrictions: string
          tax_rate: number
        }[]
      }
      get_founding_member_count: { Args: never; Returns: number }
      get_public_agencies: {
        Args: never
        Returns: {
          agency_name: string
          city: string
          id: string
          state: string
        }[]
      }
      get_rented_vehicle_ids: {
        Args: never
        Returns: {
          vehicle_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      profile_exists: { Args: { _profile_id: string }; Returns: boolean }
      profile_has_approved_agency: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_access_code: {
        Args: { code_to_redeem: string; user_profile_id: string }
        Returns: boolean
      }
      redeem_invite_code: { Args: { code_to_redeem: string }; Returns: boolean }
      validate_access_code: {
        Args: { code_to_check: string }
        Returns: boolean
      }
      validate_invite_code: {
        Args: { code_to_check: string }
        Returns: boolean
      }
      validate_payment_fee_payload: {
        Args: {
          _custom_fees: Json
          _fee_settings: Json
          _restrictions: string
          _tax_rate: number
        }
        Returns: undefined
      }
      verify_stuck_report_secret: {
        Args: { _provided: string }
        Returns: boolean
      }
    }
    Enums: {
      agency_subscription_status: "trial" | "active" | "expired" | "cancelled"
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
      agency_subscription_status: ["trial", "active", "expired", "cancelled"],
      app_role: ["admin", "user"],
      subscription_status: ["active", "pending", "cancelled", "expired"],
      subscription_tier: ["weekly", "monthly", "yearly"],
      vehicle_status: ["available", "rented", "maintenance", "inactive"],
    },
  },
} as const
