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
      buyer_needs: {
        Row: {
          categories: Database["public"]["Enums"]["material_category"][]
          created_at: string
          id: string
          locations: string[]
          max_quantity: number | null
          min_quantity: number | null
          notes: string | null
          unit: Database["public"]["Enums"]["unit_type"] | null
          updated_at: string
          user_id: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          categories?: Database["public"]["Enums"]["material_category"][]
          created_at?: string
          id?: string
          locations?: string[]
          max_quantity?: number | null
          min_quantity?: number | null
          notes?: string | null
          unit?: Database["public"]["Enums"]["unit_type"] | null
          updated_at?: string
          user_id: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          categories?: Database["public"]["Enums"]["material_category"][]
          created_at?: string
          id?: string
          locations?: string[]
          max_quantity?: number | null
          min_quantity?: number | null
          notes?: string | null
          unit?: Database["public"]["Enums"]["unit_type"] | null
          updated_at?: string
          user_id?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          message: string
          quantity_requested: number | null
          seller_id: string
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          message: string
          quantity_requested?: number | null
          seller_id: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          message?: string
          quantity_requested?: number | null
          seller_id?: string
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          buyer_id: string
          created_at: string
          deal_value: number
          fee_amount: number
          fee_pct: number
          id: string
          match_id: string
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          deal_value: number
          fee_amount: number
          fee_pct?: number
          id?: string
          match_id: string
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          deal_value?: number
          fee_amount?: number
          fee_pct?: number
          id?: string
          match_id?: string
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: Database["public"]["Enums"]["material_category"]
          created_at: string
          description: string
          expires_at: string
          id: string
          image_url: string | null
          is_free: boolean
          location: string
          price_per_unit: number | null
          quantity: number
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["material_category"]
          created_at?: string
          description: string
          expires_at?: string
          id?: string
          image_url?: string | null
          is_free?: boolean
          location: string
          price_per_unit?: number | null
          quantity: number
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          unit: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["material_category"]
          created_at?: string
          description?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          is_free?: boolean
          location?: string
          price_per_unit?: number | null
          quantity?: number
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          unit?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          buyer_id: string
          buyer_need_id: string | null
          created_at: string
          deal_value: number | null
          id: string
          listing_id: string
          notes: string | null
          seller_id: string
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          buyer_id: string
          buyer_need_id?: string | null
          created_at?: string
          deal_value?: number | null
          id?: string
          listing_id: string
          notes?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_need_id?: string | null
          created_at?: string
          deal_value?: number | null
          id?: string
          listing_id?: string
          notes?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_buyer_need_id_fkey"
            columns: ["buyer_need_id"]
            isOneToOne: false
            referencedRelation: "buyer_needs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          id: string
          industry: string | null
          location: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          id: string
          industry?: string | null
          location?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          updated_at?: string
          website?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      inquiry_status: "pending" | "accepted" | "declined" | "completed"
      listing_status: "available" | "reserved" | "sold" | "archived"
      match_status:
        | "suggested"
        | "contacted"
        | "in_talks"
        | "closed_won"
        | "closed_lost"
      material_category:
        | "plastics"
        | "metals"
        | "textiles"
        | "wood"
        | "paper"
        | "glass"
        | "chemicals"
        | "organic"
        | "construction"
        | "electronics"
        | "rubber"
        | "other"
      unit_type:
        | "kg"
        | "tonnes"
        | "liters"
        | "cubic_meters"
        | "units"
        | "pallets"
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
      inquiry_status: ["pending", "accepted", "declined", "completed"],
      listing_status: ["available", "reserved", "sold", "archived"],
      match_status: [
        "suggested",
        "contacted",
        "in_talks",
        "closed_won",
        "closed_lost",
      ],
      material_category: [
        "plastics",
        "metals",
        "textiles",
        "wood",
        "paper",
        "glass",
        "chemicals",
        "organic",
        "construction",
        "electronics",
        "rubber",
        "other",
      ],
      unit_type: ["kg", "tonnes", "liters", "cubic_meters", "units", "pallets"],
    },
  },
} as const
