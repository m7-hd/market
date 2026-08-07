// Database types generated for Mhmd Market Supabase schema
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          role: string;
          branch_id: string | null;
          avatar_url: string | null;
          pin_code: string | null;
          two_factor_enabled: boolean;
          salary: number | null;
          bonus: number | null;
          deductions: number | null;
          custody: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      branches: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          is_main: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['branches']['Row']>;
        Update: Partial<Database['public']['Tables']['branches']['Row']>;
      };
      vodafone_cash_txns: {
        Row: {
          id: string;
          txn_number: string;
          type: string;
          customer_name: string | null;
          phone: string;
          amount: number;
          fee: number;
          commission: number;
          net_amount: number;
          notes: string | null;
          employee_id: string;
          employee_name: string | null;
          branch_id: string | null;
          status: string;
          destination_wallet: string | null;
          invoice_id: string | null;
          qr_data: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['vodafone_cash_txns']['Row']>;
        Update: Partial<Database['public']['Tables']['vodafone_cash_txns']['Row']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          sku: string;
          barcodes: string[];
          category_id: string | null;
          description: string | null;
          images: string[];
          unit: string;
          prices: any;
          stock: number;
          min_stock: number;
          expiry_date: string | null;
          has_expiry: boolean;
          is_weighted: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          icon: string | null;
          color: string | null;
          parent_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          branch_id: string;
          type: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['warehouses']['Row']>;
        Update: Partial<Database['public']['Tables']['warehouses']['Row']>;
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          balance: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['suppliers']['Row']>;
        Update: Partial<Database['public']['Tables']['suppliers']['Row']>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          address: string | null;
          balance: number;
          debt: number;
          points: number;
          loyalty_tier: string;
          total_orders: number;
          total_spent: number;
          birthday: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['customers']['Row']>;
        Update: Partial<Database['public']['Tables']['customers']['Row']>;
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string | null;
          customer_name: string | null;
          cashier_id: string;
          cashier_name: string | null;
          branch_id: string | null;
          items: any;
          subtotal: number;
          discount: number;
          service_fee: number;
          tax: number;
          total: number;
          paid: number;
          change: number;
          payment_method: string;
          points_earned: number;
          points_redeemed: number;
          status: string;
          suspend_reason: string | null;
          qr_data: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['invoices']['Row']>;
        Update: Partial<Database['public']['Tables']['invoices']['Row']>;
      };
      offers: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          product_ids: string[] | null;
          category_ids: string[] | null;
          buy_qty: number | null;
          get_qty: number | null;
          discount_percentage: number | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          is_auto: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['offers']['Row']>;
        Update: Partial<Database['public']['Tables']['offers']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          channel: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          items: any;
          total: number;
          fulfillment: string;
          address: string | null;
          status: string;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          action: string;
          entity: string;
          entity_id: string | null;
          details: any;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']>;
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          type: string;
          title: string;
          message: string;
          channel: string;
          recipient: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          check_in: string;
          check_out: string | null;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['attendance']['Row']>;
        Update: Partial<Database['public']['Tables']['attendance']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
