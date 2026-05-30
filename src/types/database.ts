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
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      admission_periods: {
        Row: {
          academic_year_id: string
          application_deadline: string
          application_open_date: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["admission_period_status"]
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          application_deadline: string
          application_open_date: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["admission_period_status"]
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          application_deadline?: string
          application_open_date?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["admission_period_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_periods_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          applicant_id: string
          application_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size_bytes: number
          id: string
          mime_type: string
          reject_reason: string | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          applicant_id: string
          application_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_size_bytes: number
          id?: string
          mime_type: string
          reject_reason?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          applicant_id?: string
          application_id?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_size_bytes?: number
          id?: string
          mime_type?: string
          reject_reason?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_program_choices: {
        Row: {
          application_id: string
          created_at: string
          id: string
          priority: number
          program_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          priority: number
          program_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          priority?: number
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_program_choices_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_program_choices_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      application_reviews: {
        Row: {
          application_id: string
          decision: Database["public"]["Enums"]["application_status"]
          id: string
          notes: string | null
          reviewed_at: string
          reviewer_id: string
        }
        Insert: {
          application_id: string
          decision: Database["public"]["Enums"]["application_status"]
          id?: string
          notes?: string | null
          reviewed_at?: string
          reviewer_id: string
        }
        Update: {
          application_id?: string
          decision?: Database["public"]["Enums"]["application_status"]
          id?: string
          notes?: string | null
          reviewed_at?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          from_status: Database["public"]["Enums"]["application_status"] | null
          id: string
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          to_status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          academic_background: Json | null
          admission_period_id: string
          applicant_id: string
          application_number: string
          contact_info: Json | null
          created_at: string
          guardian_info: Json | null
          id: string
          is_archived: boolean
          personal_info: Json | null
          progress_percentage: number | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          academic_background?: Json | null
          admission_period_id: string
          applicant_id: string
          application_number: string
          contact_info?: Json | null
          created_at?: string
          guardian_info?: Json | null
          id?: string
          is_archived?: boolean
          personal_info?: Json | null
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          academic_background?: Json | null
          admission_period_id?: string
          applicant_id?: string
          application_number?: string
          contact_info?: Json | null
          created_at?: string
          guardian_info?: Json | null
          id?: string
          is_archived?: boolean
          personal_info?: Json | null
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_admission_period_id_fkey"
            columns: ["admission_period_id"]
            isOneToOne: false
            referencedRelation: "admission_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          faculty_id: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          faculty_id: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          faculty_id?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year_id: string
          applicant_id: string
          application_id: string
          created_at: string
          enrollment_date: string
          id: string
          program_id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          student_number: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          applicant_id: string
          application_id: string
          created_at?: string
          enrollment_date?: string
          id?: string
          program_id: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_number: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          applicant_id?: string
          application_id?: string
          created_at?: string
          enrollment_date?: string
          id?: string
          program_id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      faculties: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_address: string | null
          date_of_birth: string | null
          full_name: string
          gender: string | null
          id: string
          national_id_number: string | null
          nationality: string | null
          phone_number: string | null
          province_city: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_address?: string | null
          date_of_birth?: string | null
          full_name: string
          gender?: string | null
          id: string
          national_id_number?: string | null
          nationality?: string | null
          phone_number?: string | null
          province_city?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_address?: string | null
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          national_id_number?: string | null
          nationality?: string | null
          phone_number?: string | null
          province_city?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          code: string
          created_at: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          department_id: string
          description: string | null
          duration_years: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          degree_level: Database["public"]["Enums"]["degree_level"]
          department_id: string
          description?: string | null
          duration_years: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          degree_level?: Database["public"]["Enums"]["degree_level"]
          department_id?: string
          description?: string | null
          duration_years?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          application_updates: boolean
          document_alerts: boolean
          email_notifications: boolean
          language: string
          sms_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          application_updates?: boolean
          document_alerts?: boolean
          email_notifications?: boolean
          language?: string
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          application_updates?: boolean
          document_alerts?: boolean
          email_notifications?: boolean
          language?: string
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      create_application_draft: {
        Args: { p_admission_period_id: string }
        Returns: Database["public"]["Tables"]["applications"]["Row"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_application_draft: {
        Args: {
          p_academic_background: Json
          p_application_id: string
          p_contact_info: Json
          p_guardian_info: Json
          p_personal_info: Json
          p_program_id?: string
          p_progress_percentage: number
        }
        Returns: Database["public"]["Tables"]["applications"]["Row"]
      }
      review_application_document: {
        Args: {
          p_document_id: string
          p_reject_reason?: string
          p_status: Database["public"]["Enums"]["document_status"]
        }
        Returns: Database["public"]["Tables"]["application_documents"]["Row"]
      }
      submit_application: {
        Args: { p_application_id: string }
        Returns: Database["public"]["Tables"]["applications"]["Row"]
      }
      submit_application_review: {
        Args: {
          p_application_id: string
          p_notes?: string
          p_status: Database["public"]["Enums"]["application_status"]
        }
        Returns: Database["public"]["Tables"]["applications"]["Row"]
      }
    }
    Enums: {
      admission_period_status: "upcoming" | "open" | "closed" | "archived"
      app_role: "applicant" | "admission_officer" | "registrar" | "admin"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "documents_required"
        | "accepted"
        | "rejected"
        | "enrolled"
        | "withdrawn"
      degree_level: "associate" | "bachelor" | "master" | "doctorate"
      document_status: "pending_review" | "verified" | "rejected"
      document_type:
        | "profile_photo"
        | "national_id"
        | "high_school_certificate"
        | "transcript"
        | "birth_certificate"
        | "other"
      enrollment_status: "active" | "suspended" | "graduated" | "withdrawn"
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
      admission_period_status: ["upcoming", "open", "closed", "archived"],
      app_role: ["applicant", "admission_officer", "registrar", "admin"],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "documents_required",
        "accepted",
        "rejected",
        "enrolled",
        "withdrawn",
      ],
      degree_level: ["associate", "bachelor", "master", "doctorate"],
      document_status: ["pending_review", "verified", "rejected"],
      document_type: [
        "profile_photo",
        "national_id",
        "high_school_certificate",
        "transcript",
        "birth_certificate",
        "other",
      ],
      enrollment_status: ["active", "suspended", "graduated", "withdrawn"],
    },
  },
} as const
