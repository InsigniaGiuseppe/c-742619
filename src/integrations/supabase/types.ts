export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analysis: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          conversation_id: string
          created_at: string | null
          id: string
          model_used: string | null
          prompt_version: string | null
          result: Json
          updated_at: string | null
        }
        Insert: {
          analysis_type: string
          confidence_score?: number | null
          conversation_id: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          prompt_version?: string | null
          result: Json
          updated_at?: string | null
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          prompt_version?: string | null
          result?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analysis_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          attachments: Json | null
          author_id: string | null
          author_name: string | null
          author_type: string | null
          body: string | null
          conversation_id: string
          created_at: string
          delivered_as: string | null
          external_id: string | null
          id: string
          intercom_message_id: string
          message_type: string
          raw_data: Json | null
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          author_name?: string | null
          author_type?: string | null
          body?: string | null
          conversation_id: string
          created_at: string
          delivered_as?: string | null
          external_id?: string | null
          id?: string
          intercom_message_id: string
          message_type: string
          raw_data?: Json | null
          updated_at: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          author_name?: string | null
          author_type?: string | null
          body?: string | null
          conversation_id?: string
          created_at?: string
          delivered_as?: string | null
          external_id?: string | null
          id?: string
          intercom_message_id?: string
          message_type?: string
          raw_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          conversation_rating: Json | null
          conversation_type: string
          created_at: string
          custom_attributes: Json | null
          customer_id: string | null
          first_contact_reply: Json | null
          id: string
          intercom_id: string
          priority: string | null
          processed_at: string | null
          raw_data: Json | null
          sla_applied: Json | null
          snoozed_until: string | null
          source_delivered_as: string | null
          source_type: string | null
          state: string
          statistics: Json | null
          subject: string | null
          tags: Json | null
          team_id: string | null
          team_name: string | null
          updated_at: string
          waiting_since: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          conversation_rating?: Json | null
          conversation_type: string
          created_at: string
          custom_attributes?: Json | null
          customer_id?: string | null
          first_contact_reply?: Json | null
          id: string
          intercom_id: string
          priority?: string | null
          processed_at?: string | null
          raw_data?: Json | null
          sla_applied?: Json | null
          snoozed_until?: string | null
          source_delivered_as?: string | null
          source_type?: string | null
          state: string
          statistics?: Json | null
          subject?: string | null
          tags?: Json | null
          team_id?: string | null
          team_name?: string | null
          updated_at: string
          waiting_since?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          conversation_rating?: Json | null
          conversation_type?: string
          created_at?: string
          custom_attributes?: Json | null
          customer_id?: string | null
          first_contact_reply?: Json | null
          id?: string
          intercom_id?: string
          priority?: string | null
          processed_at?: string | null
          raw_data?: Json | null
          sla_applied?: Json | null
          snoozed_until?: string | null
          source_delivered_as?: string | null
          source_type?: string | null
          state?: string
          statistics?: Json | null
          subject?: string | null
          tags?: Json | null
          team_id?: string | null
          team_name?: string | null
          updated_at?: string
          waiting_since?: string | null
        }
        Relationships: []
      }
      crimes: {
        Row: {
          energy_cost: number
          id: number
          jail_time_minutes: number
          name: string
          power_required: number
          reward_max: number
          reward_min: number
          success_rate: number
        }
        Insert: {
          energy_cost: number
          id?: number
          jail_time_minutes: number
          name: string
          power_required: number
          reward_max: number
          reward_min: number
          success_rate: number
        }
        Update: {
          energy_cost?: number
          id?: number
          jail_time_minutes?: number
          name?: string
          power_required?: number
          reward_max?: number
          reward_min?: number
          success_rate?: number
        }
        Relationships: []
      }
      cryptocurrencies: {
        Row: {
          circulating_supply: number | null
          created_at: string | null
          current_price: number
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          market_cap: number | null
          max_supply: number | null
          name: string
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          slug: string | null
          symbol: string
          total_supply: number | null
          updated_at: string | null
          volume_24h: number | null
          website_url: string | null
        }
        Insert: {
          circulating_supply?: number | null
          created_at?: string | null
          current_price: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market_cap?: number | null
          max_supply?: number | null
          name: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          slug?: string | null
          symbol: string
          total_supply?: number | null
          updated_at?: string | null
          volume_24h?: number | null
          website_url?: string | null
        }
        Update: {
          circulating_supply?: number | null
          created_at?: string | null
          current_price?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          market_cap?: number | null
          max_supply?: number | null
          name?: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          slug?: string | null
          symbol?: string
          total_supply?: number | null
          updated_at?: string | null
          volume_24h?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      document_processing_jobs: {
        Row: {
          created_at: string
          custom_prompt: string
          error_message: string | null
          file_size: number
          file_type: string
          format_type: string
          id: string
          original_content: string | null
          original_filename: string
          processed_content: string | null
          processing_completed_at: string | null
          processing_started_at: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom_prompt: string
          error_message?: string | null
          file_size: number
          file_type: string
          format_type: string
          id?: string
          original_content?: string | null
          original_filename: string
          processed_content?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom_prompt?: string
          error_message?: string | null
          file_size?: number
          file_type?: string
          format_type?: string
          id?: string
          original_content?: string | null
          original_filename?: string
          processed_content?: string | null
          processing_completed_at?: string | null
          processing_started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      external_wallets: {
        Row: {
          admin_notes: string | null
          coin_symbol: string
          created_at: string
          id: string
          network: string
          screenshot_url: string | null
          status: Database["public"]["Enums"]["wallet_status"]
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_label: string | null
        }
        Insert: {
          admin_notes?: string | null
          coin_symbol: string
          created_at?: string
          id?: string
          network: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["wallet_status"]
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_label?: string | null
        }
        Update: {
          admin_notes?: string | null
          coin_symbol?: string
          created_at?: string
          id?: string
          network?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["wallet_status"]
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gang_members: {
        Row: {
          gang_id: string | null
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["gang_role"] | null
          user_id: string | null
        }
        Insert: {
          gang_id?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["gang_role"] | null
          user_id?: string | null
        }
        Update: {
          gang_id?: string | null
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["gang_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gang_members_gang_id_fkey"
            columns: ["gang_id"]
            isOneToOne: false
            referencedRelation: "gangs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gang_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gangs: {
        Row: {
          bank: number | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          bank?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          bank?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          assigned_to: string | null
          conversations: Json | null
          created_at: string | null
          description: string | null
          first_seen: string | null
          frequency: number | null
          id: string
          insight_type: string
          keywords: Json | null
          last_seen: string | null
          priority_score: number | null
          sentiment_score: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          conversations?: Json | null
          created_at?: string | null
          description?: string | null
          first_seen?: string | null
          frequency?: number | null
          id?: string
          insight_type: string
          keywords?: Json | null
          last_seen?: string | null
          priority_score?: number | null
          sentiment_score?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          conversations?: Json | null
          created_at?: string | null
          description?: string | null
          first_seen?: string | null
          frequency?: number | null
          id?: string
          insight_type?: string
          keywords?: Json | null
          last_seen?: string | null
          priority_score?: number | null
          sentiment_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      intercom_config: {
        Row: {
          access_token_encrypted: string
          auto_analysis_enabled: boolean | null
          created_at: string | null
          id: string
          pii_redaction_enabled: boolean | null
          retention_days: number | null
          sync_enabled: boolean | null
          updated_at: string | null
          webhook_secret: string | null
          workspace_id: string
          workspace_name: string | null
        }
        Insert: {
          access_token_encrypted: string
          auto_analysis_enabled?: boolean | null
          created_at?: string | null
          id?: string
          pii_redaction_enabled?: boolean | null
          retention_days?: number | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          webhook_secret?: string | null
          workspace_id: string
          workspace_name?: string | null
        }
        Update: {
          access_token_encrypted?: string
          auto_analysis_enabled?: boolean | null
          created_at?: string | null
          id?: string
          pii_redaction_enabled?: boolean | null
          retention_days?: number | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          webhook_secret?: string | null
          workspace_id?: string
          workspace_name?: string | null
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["kyc_document_type"]
          document_url: string
          id: string
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_type: Database["public"]["Enums"]["kyc_document_type"]
          document_url: string
          id?: string
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["kyc_document_type"]
          document_url?: string
          id?: string
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lending_interest_payments: {
        Row: {
          created_at: string
          cryptocurrency_id: string
          id: string
          interest_amount: number
          payment_date: string
          transaction_id: string | null
          user_id: string
          user_lending_id: string
        }
        Insert: {
          created_at?: string
          cryptocurrency_id: string
          id?: string
          interest_amount: number
          payment_date?: string
          transaction_id?: string | null
          user_id: string
          user_lending_id: string
        }
        Update: {
          created_at?: string
          cryptocurrency_id?: string
          id?: string
          interest_amount?: number
          payment_date?: string
          transaction_id?: string | null
          user_id?: string
          user_lending_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lending_interest_payments_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lending_interest_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lending_interest_payments_user_lending_id_fkey"
            columns: ["user_lending_id"]
            isOneToOne: false
            referencedRelation: "user_lending"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          color: string
          court: number
          created_at: string
          date: string
          id: string
          match_type: string
          notes: string | null
          round: string
          team_1: string | null
          team_2: string | null
          time: string
          updated_at: string
        }
        Insert: {
          color: string
          court: number
          created_at?: string
          date: string
          id?: string
          match_type: string
          notes?: string | null
          round: string
          team_1?: string | null
          team_2?: string | null
          time: string
          updated_at?: string
        }
        Update: {
          color?: string
          court?: number
          created_at?: string
          date?: string
          id?: string
          match_type?: string
          notes?: string | null
          round?: string
          team_1?: string | null
          team_2?: string | null
          time?: string
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string | null
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      price_history: {
        Row: {
          cryptocurrency_id: string
          id: string
          market_cap: number | null
          price: number
          timestamp: string | null
          volume: number | null
        }
        Insert: {
          cryptocurrency_id: string
          id?: string
          market_cap?: number | null
          price: number
          timestamp?: string | null
          volume?: number | null
        }
        Update: {
          cryptocurrency_id?: string
          id?: string
          market_cap?: number | null
          price?: number
          timestamp?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_articles: {
        Row: {
          author: string | null
          claimed_by: string | null
          date_processed: string
          id: string
          image_recommendations: Json | null
          is_relevant: boolean
          languages: Json
          original_title: string
          original_url: string
          posting_status: string | null
          relevance_reason: string | null
          summary: string
        }
        Insert: {
          author?: string | null
          claimed_by?: string | null
          date_processed?: string
          id?: string
          image_recommendations?: Json | null
          is_relevant?: boolean
          languages: Json
          original_title: string
          original_url: string
          posting_status?: string | null
          relevance_reason?: string | null
          summary: string
        }
        Update: {
          author?: string | null
          claimed_by?: string | null
          date_processed?: string
          id?: string
          image_recommendations?: Json | null
          is_relevant?: boolean
          languages?: Json
          original_title?: string
          original_url?: string
          posting_status?: string | null
          relevance_reason?: string | null
          summary?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status_type"]
          account_type: string
          address: string | null
          avatar_url: string | null
          bank_details_iban: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          demo_balance_usd: number
          email: string | null
          energy: number | null
          full_name: string | null
          gang_id: string | null
          hospital_until: string | null
          id: string
          is_admin: boolean | null
          jail_until: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          last_energy_tick: string | null
          last_login_date: string | null
          last_login_ip: unknown | null
          max_energy: number | null
          money_in_bank: number | null
          money_on_hand: number | null
          phone: string | null
          postal_code: string | null
          power_level: number | null
          short_bio: string | null
          two_factor_enabled: boolean
          two_factor_secret: string | null
          updated_at: string | null
          username: string | null
          vip_rank: Database["public"]["Enums"]["vip_rank"] | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status_type"]
          account_type?: string
          address?: string | null
          avatar_url?: string | null
          bank_details_iban?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          demo_balance_usd?: number
          email?: string | null
          energy?: number | null
          full_name?: string | null
          gang_id?: string | null
          hospital_until?: string | null
          id: string
          is_admin?: boolean | null
          jail_until?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_energy_tick?: string | null
          last_login_date?: string | null
          last_login_ip?: unknown | null
          max_energy?: number | null
          money_in_bank?: number | null
          money_on_hand?: number | null
          phone?: string | null
          postal_code?: string | null
          power_level?: number | null
          short_bio?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          vip_rank?: Database["public"]["Enums"]["vip_rank"] | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status_type"]
          account_type?: string
          address?: string | null
          avatar_url?: string | null
          bank_details_iban?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          demo_balance_usd?: number
          email?: string | null
          energy?: number | null
          full_name?: string | null
          gang_id?: string | null
          hospital_until?: string | null
          id?: string
          is_admin?: boolean | null
          jail_until?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          last_energy_tick?: string | null
          last_login_date?: string | null
          last_login_ip?: unknown | null
          max_energy?: number | null
          money_in_bank?: number | null
          money_on_hand?: number | null
          phone?: string | null
          postal_code?: string | null
          power_level?: number | null
          short_bio?: string | null
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
          vip_rank?: Database["public"]["Enums"]["vip_rank"] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_gang_id"
            columns: ["gang_id"]
            isOneToOne: false
            referencedRelation: "gangs"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          api_calls_used: number | null
          created_at: string | null
          daily_limit: number | null
          error_message: string | null
          id: string
          last_cursor: string | null
          last_sync_at: string | null
          rate_limit_reset: string | null
          status: string
          sync_type: string
          total_processed: number | null
          updated_at: string | null
        }
        Insert: {
          api_calls_used?: number | null
          created_at?: string | null
          daily_limit?: number | null
          error_message?: string | null
          id?: string
          last_cursor?: string | null
          last_sync_at?: string | null
          rate_limit_reset?: string | null
          status?: string
          sync_type: string
          total_processed?: number | null
          updated_at?: string | null
        }
        Update: {
          api_calls_used?: number | null
          created_at?: string | null
          daily_limit?: number | null
          error_message?: string | null
          id?: string
          last_cursor?: string | null
          last_sync_at?: string | null
          rate_limit_reset?: string | null
          status?: string
          sync_type?: string
          total_processed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trading_orders: {
        Row: {
          amount: number
          created_at: string | null
          cryptocurrency_id: string
          executed_at: string | null
          fees: number | null
          id: string
          order_status: Database["public"]["Enums"]["order_status_type"] | null
          order_type: string
          price_per_unit: number
          total_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          cryptocurrency_id: string
          executed_at?: string | null
          fees?: number | null
          id?: string
          order_status?: Database["public"]["Enums"]["order_status_type"] | null
          order_type: string
          price_per_unit: number
          total_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          cryptocurrency_id?: string
          executed_at?: string | null
          fees?: number | null
          id?: string
          order_status?: Database["public"]["Enums"]["order_status_type"] | null
          order_type?: string
          price_per_unit?: number
          total_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_orders_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_users: {
        Row: {
          account_balance: number | null
          avatar_url: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          password_hash: string
          phone: string | null
          risk_tolerance: string | null
          total_invested: number | null
          total_profit_loss: number | null
          updated_at: string | null
          username: string
          verification_status: string | null
        }
        Insert: {
          account_balance?: number | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password_hash: string
          phone?: string | null
          risk_tolerance?: string | null
          total_invested?: number | null
          total_profit_loss?: number | null
          updated_at?: string | null
          username: string
          verification_status?: string | null
        }
        Update: {
          account_balance?: number | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string
          phone?: string | null
          risk_tolerance?: string | null
          total_invested?: number | null
          total_profit_loss?: number | null
          updated_at?: string | null
          username?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      transaction_history: {
        Row: {
          amount: number | null
          created_at: string | null
          cryptocurrency_id: string | null
          description: string | null
          fee_amount: number | null
          id: string
          reference_order_id: string | null
          status: string | null
          transaction_type: string
          usd_value: number | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          cryptocurrency_id?: string | null
          description?: string | null
          fee_amount?: number | null
          id?: string
          reference_order_id?: string | null
          status?: string | null
          transaction_type: string
          usd_value?: number | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          cryptocurrency_id?: string | null
          description?: string | null
          fee_amount?: number | null
          id?: string
          reference_order_id?: string | null
          status?: string | null
          transaction_type?: string
          usd_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_history_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_history_reference_order_id_fkey"
            columns: ["reference_order_id"]
            isOneToOne: false
            referencedRelation: "trading_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lending: {
        Row: {
          amount_lent: number
          annual_interest_rate: number
          created_at: string
          cryptocurrency_id: string
          id: string
          lending_cancelled_at: string | null
          lending_started_at: string
          original_amount_lent: number
          status: string
          total_interest_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_lent: number
          annual_interest_rate?: number
          created_at?: string
          cryptocurrency_id: string
          id?: string
          lending_cancelled_at?: string | null
          lending_started_at?: string
          original_amount_lent: number
          status?: string
          total_interest_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_lent?: number
          annual_interest_rate?: number
          created_at?: string
          cryptocurrency_id?: string
          id?: string
          lending_cancelled_at?: string | null
          lending_started_at?: string
          original_amount_lent?: number
          status?: string
          total_interest_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lending_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolios: {
        Row: {
          average_buy_price: number
          created_at: string | null
          cryptocurrency_id: string
          current_value: number
          id: string
          profit_loss: number
          profit_loss_percentage: number
          quantity: number
          total_invested: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_buy_price?: number
          created_at?: string | null
          cryptocurrency_id: string
          current_value?: number
          id?: string
          profit_loss?: number
          profit_loss_percentage?: number
          quantity?: number
          total_invested?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_buy_price?: number
          created_at?: string | null
          cryptocurrency_id?: string
          current_value?: number
          id?: string
          profit_loss?: number
          profit_loss_percentage?: number
          quantity?: number
          total_invested?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolios_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_portfolios_user_id_fkey"
            columns: ["user_id"]
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
      user_sessions: {
        Row: {
          created_at: string
          device_name: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_login: string
          os_browser: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_login?: string
          os_browser?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_login?: string
          os_browser?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          email_on_login: boolean
          email_on_withdrawal: boolean
          price_alerts_enabled: boolean
          sms_on_withdrawal: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_on_login?: boolean
          email_on_withdrawal?: boolean
          price_alerts_enabled?: boolean
          sms_on_withdrawal?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_on_login?: boolean
          email_on_withdrawal?: boolean
          price_alerts_enabled?: boolean
          sms_on_withdrawal?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watchlist: {
        Row: {
          created_at: string | null
          cryptocurrency_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cryptocurrency_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          cryptocurrency_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_watchlist_cryptocurrency_id_fkey"
            columns: ["cryptocurrency_id"]
            isOneToOne: false
            referencedRelation: "cryptocurrencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_weapons: {
        Row: {
          created_at: string | null
          id: string
          quantity: number | null
          user_id: string | null
          uses_left: number | null
          weapon_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity?: number | null
          user_id?: string | null
          uses_left?: number | null
          weapon_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number | null
          user_id?: string | null
          uses_left?: number | null
          weapon_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_weapons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_weapons_weapon_id_fkey"
            columns: ["weapon_id"]
            isOneToOne: false
            referencedRelation: "weapons"
            referencedColumns: ["id"]
          },
        ]
      }
      weapons: {
        Row: {
          durability: number
          id: number
          name: string
          power_value: number
          price: number
        }
        Insert: {
          durability: number
          id?: number
          name: string
          power_value: number
          price: number
        }
        Update: {
          durability?: number
          id?: number
          name?: string
          power_value?: number
          price?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: {
          user_id_to_check: string
          required_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_kyc_status_and_log: {
        Args: {
          target_kyc_id_in: string
          admin_id_in: string
          new_status_in: Database["public"]["Enums"]["kyc_status"]
          admin_notes_in: string
        }
        Returns: undefined
      }
      update_transaction_status_and_log: {
        Args: {
          target_order_id_in: string
          admin_id_in: string
          new_status_in: string
          admin_notes_in: string
        }
        Returns: undefined
      }
      update_user_status_and_log: {
        Args: {
          target_user_id_in: string
          admin_id_in: string
          new_status: string
        }
        Returns: undefined
      }
      update_wallet_status_and_log: {
        Args: {
          target_wallet_id_in: string
          admin_id_in: string
          new_status_in: Database["public"]["Enums"]["wallet_status"]
          admin_notes_in: string
        }
        Returns: undefined
      }
      validate_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status_type: "active" | "frozen" | "blocked"
      app_role: "admin" | "support" | "compliance"
      gang_role: "leader" | "member"
      kyc_document_type:
        | "id_card"
        | "passport"
        | "drivers_license"
        | "proof_of_address"
      kyc_status: "not_started" | "pending" | "verified" | "rejected"
      order_status_type: "pending" | "completed" | "rejected" | "failed"
      vip_rank: "free" | "bronze" | "silver" | "gold"
      wallet_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status_type: ["active", "frozen", "blocked"],
      app_role: ["admin", "support", "compliance"],
      gang_role: ["leader", "member"],
      kyc_document_type: [
        "id_card",
        "passport",
        "drivers_license",
        "proof_of_address",
      ],
      kyc_status: ["not_started", "pending", "verified", "rejected"],
      order_status_type: ["pending", "completed", "rejected", "failed"],
      vip_rank: ["free", "bronze", "silver", "gold"],
      wallet_status: ["pending", "verified", "rejected"],
    },
  },
} as const
