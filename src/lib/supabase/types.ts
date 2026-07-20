// Hand-written to mirror supabase/migrations/0001_init.sql.
// Once the project is connected, regenerate with the Supabase CLI/MCP
// (`generate_typescript_types`) and replace this file — the shape should match.

export type UserRole = "customer" | "employee" | "owner";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "baking"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "unpaid" | "advance_pending" | "advance_paid" | "paid_full" | "refunded";
export type PaymentMethod = "razorpay" | "qr_manual" | "cod";
export type RequestStatus = "pending" | "quoted" | "approved" | "rejected" | "converted";

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          birthday: string | null;
          created_at: string;
        },
        {
          id: string;
          role?: UserRole;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          birthday?: string | null;
        }
      >;
      categories: TableDef<
        { id: string; slug: string; name: string; sort_order: number; created_at: string },
        { id?: string; slug: string; name: string; sort_order?: number }
      >;
      products: TableDef<
        {
          id: string;
          slug: string;
          name: string;
          category_id: string | null;
          description: string | null;
          ingredients: string | null;
          price_500: number | null;
          price_1000: number | null;
          base_price: number | null;
          note: string | null;
          is_customizable: boolean;
          is_featured: boolean;
          is_active: boolean;
          avg_rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          slug: string;
          name: string;
          category_id?: string | null;
          description?: string | null;
          ingredients?: string | null;
          price_500?: number | null;
          price_1000?: number | null;
          base_price?: number | null;
          note?: string | null;
          is_customizable?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
        }
      >;
      product_images: TableDef<
        { id: string; product_id: string; url: string; sort_order: number; alt: string | null },
        { id?: string; product_id: string; url: string; sort_order?: number; alt?: string | null }
      >;
      product_flavours: TableDef<
        { id: string; product_id: string; name: string; extra_price: number },
        { id?: string; product_id: string; name: string; extra_price?: number }
      >;
      product_weight_options: TableDef<
        { id: string; product_id: string; label: string; price: number },
        { id?: string; product_id: string; label: string; price: number }
      >;
      addresses: TableDef<
        {
          id: string;
          customer_id: string;
          label: string | null;
          full_address: string;
          city: string | null;
          pincode: string | null;
          is_default: boolean;
          created_at: string;
        },
        {
          id?: string;
          customer_id: string;
          label?: string | null;
          full_address: string;
          city?: string | null;
          pincode?: string | null;
          is_default?: boolean;
        }
      >;
      coupons: TableDef<
        {
          id: string;
          code: string;
          discount_type: "percent" | "flat";
          discount_value: number;
          min_order_amount: number;
          max_uses: number | null;
          used_count: number;
          active: boolean;
          expires_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          code: string;
          discount_type: "percent" | "flat";
          discount_value: number;
          min_order_amount?: number;
          max_uses?: number | null;
          active?: boolean;
          expires_at?: string | null;
        }
      >;
      orders: TableDef<
        {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          delivery_address: string;
          delivery_instructions: string | null;
          event_date: string | null;
          event_time: string | null;
          subtotal: number;
          discount: number;
          coupon_id: string | null;
          total: number;
          advance_amount: number;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          order_status: OrderStatus;
          assigned_employee_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          delivery_address: string;
          delivery_instructions?: string | null;
          event_date?: string | null;
          event_time?: string | null;
          subtotal: number;
          discount?: number;
          coupon_id?: string | null;
          total: number;
          advance_amount?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          order_status?: OrderStatus;
          assigned_employee_id?: string | null;
          notes?: string | null;
          updated_at?: string;
        }
      >;
      order_items: TableDef<
        {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          weight_label: string | null;
          flavour: string | null;
          custom_message: string | null;
          quantity: number;
          unit_price: number;
          line_total: number;
        },
        {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          weight_label?: string | null;
          flavour?: string | null;
          custom_message?: string | null;
          quantity?: number;
          unit_price: number;
          line_total: number;
        }
      >;
      payments: TableDef<
        {
          id: string;
          order_id: string;
          amount: number;
          method: PaymentMethod;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: string;
          created_at: string;
        },
        {
          id?: string;
          order_id: string;
          amount: number;
          method: PaymentMethod;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          status?: string;
        }
      >;
      reviews: TableDef<
        {
          id: string;
          product_id: string;
          customer_id: string | null;
          order_id: string | null;
          rating: number;
          comment: string | null;
          guest_name: string | null;
          is_verified: boolean;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          customer_id?: string | null;
          order_id?: string | null;
          rating: number;
          comment?: string | null;
          guest_name?: string | null;
          is_verified?: boolean;
        }
      >;
      wishlists: TableDef<
        { id: string; customer_id: string; product_id: string; created_at: string },
        { id?: string; customer_id: string; product_id: string }
      >;
      inventory_items: TableDef<
        {
          id: string;
          name: string;
          unit: string;
          quantity: number;
          low_stock_threshold: number | null;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          unit?: string;
          quantity?: number;
          low_stock_threshold?: number | null;
          updated_at?: string;
        }
      >;
      notifications: TableDef<
        {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          type: string;
          is_read: boolean;
          created_at: string;
        },
        { id?: string; user_id: string; title: string; body?: string | null; type?: string; is_read?: boolean }
      >;
      custom_cake_requests: TableDef<
        {
          id: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          shape: string | null;
          size: string | null;
          layers: number | null;
          flavour: string | null;
          cream_type: string | null;
          theme: string | null;
          inspiration_image_url: string | null;
          instructions: string | null;
          event_date: string | null;
          status: RequestStatus;
          quoted_price: number | null;
          owner_notes: string | null;
          converted_order_id: string | null;
          created_at: string;
        },
        {
          id?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          shape?: string | null;
          size?: string | null;
          layers?: number | null;
          flavour?: string | null;
          cream_type?: string | null;
          theme?: string | null;
          inspiration_image_url?: string | null;
          instructions?: string | null;
          event_date?: string | null;
          status?: RequestStatus;
          quoted_price?: number | null;
          owner_notes?: string | null;
        }
      >;
      contact_messages: TableDef<
        {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          subject: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        },
        {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          subject?: string | null;
          message: string;
          is_read?: boolean;
        }
      >;
      activity_log: TableDef<
        {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: Record<string, unknown> | null;
          created_at: string;
        },
        {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Record<string, unknown> | null;
        }
      >;
      banners: TableDef<
        {
          id: string;
          title: string | null;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
        }
      >;
      site_settings: TableDef<
        { key: string; value: Record<string, unknown> | null },
        { key: string; value?: Record<string, unknown> | null }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      increment_coupon_usage: {
        Args: { coupon_id: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      request_status: RequestStatus;
    };
  };
}
