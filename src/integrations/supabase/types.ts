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
          avatar_url: string | null
          created_at: string | null
          email: string | null
          energy: number | null
          full_name: string | null
          gang_id: string | null
          hospital_until: string | null
          id: string
          is_admin: boolean | null
          jail_until: string | null
          last_energy_tick: string | null
          max_energy: number | null
          money_in_bank: number | null
          money_on_hand: number | null
          power_level: number | null
          short_bio: string | null
          updated_at: string | null
          username: string | null
          vip_rank: Database["public"]["Enums"]["vip_rank"] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          energy?: number | null
          full_name?: string | null
          gang_id?: string | null
          hospital_until?: string | null
          id: string
          is_admin?: boolean | null
          jail_until?: string | null
          last_energy_tick?: string | null
          max_energy?: number | null
          money_in_bank?: number | null
          money_on_hand?: number | null
          power_level?: number | null
          short_bio?: string | null
          updated_at?: string | null
          username?: string | null
          vip_rank?: Database["public"]["Enums"]["vip_rank"] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          energy?: number | null
          full_name?: string | null
          gang_id?: string | null
          hospital_until?: string | null
          id?: string
          is_admin?: boolean | null
          jail_until?: string | null
          last_energy_tick?: string | null
          max_energy?: number | null
          money_in_bank?: number | null
          money_on_hand?: number | null
          power_level?: number | null
          short_bio?: string | null
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
          order_status: string | null
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
          order_status?: string | null
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
          order_status?: string | null
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
            referencedRelation: "trading_users"
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
            referencedRelation: "trading_users"
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
            referencedRelation: "trading_users"
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
            referencedRelation: "trading_users"
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
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_admin_session: {
        Args: { session_token: string }
        Returns: boolean
      }
    }
    Enums: {
      gang_role: "leader" | "member"
      vip_rank: "free" | "bronze" | "silver" | "gold"
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
      gang_role: ["leader", "member"],
      vip_rank: ["free", "bronze", "silver", "gold"],
    },
  },
} as const
