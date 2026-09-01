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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_label: string | null
          entity_type: string | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      attribute_values: {
        Row: {
          attribute_id: string
          created_at: string
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          value: string
        }
        Insert: {
          attribute_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          value: string
        }
        Update: {
          attribute_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "attribute_values_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      attributes: {
        Row: {
          code: string
          created_at: string
          id: string
          input_type: string
          is_active: boolean
          is_filterable: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          input_type?: string
          is_active?: boolean
          is_filterable?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          input_type?: string
          is_active?: boolean
          is_filterable?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          alt_text: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          ends_at: string | null
          eyebrow: string | null
          id: string
          image_url: string | null
          is_active: boolean
          mobile_image_url: string | null
          placement: string
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          mobile_image_url?: string | null
          placement?: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          ends_at?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          mobile_image_url?: string | null
          placement?: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          body: string | null
          canonical_url: string | null
          category_id: string | null
          cover_image_alt: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          og_image: string | null
          published_at: string | null
          reading_minutes: number | null
          robots: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          canonical_url?: string | null
          category_id?: string | null
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          og_image?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          robots?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          body?: string | null
          canonical_url?: string | null
          category_id?: string | null
          cover_image_alt?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          og_image?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          robots?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          product_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          kind: string
          name: string
          rules: Json
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          kind?: string
          name: string
          rules?: Json
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          kind?: string
          name?: string
          rules?: Json
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string
          source: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          attachment_url: string | null
          budget: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string | null
          follow_up_date: string | null
          id: string
          message: string | null
          name: string
          phone: string
          preferred_time: string | null
          product_category: string | null
          product_id: string | null
          product_name: string | null
          quantity: string | null
          required_date: string | null
          requirement_type: string | null
          source: string
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          attachment_url?: string | null
          budget?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          preferred_time?: string | null
          product_category?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: string | null
          required_date?: string | null
          requirement_type?: string | null
          source?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          attachment_url?: string | null
          budget?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          preferred_time?: string | null
          product_category?: string | null
          product_id?: string | null
          product_name?: string | null
          quantity?: string | null
          required_date?: string | null
          requirement_type?: string | null
          source?: string
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          alt_text: string | null
          caption: string | null
          category: string
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          is_featured: boolean
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          href: string
          icon: string | null
          id: string
          is_active: boolean
          label: string
          menu: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          menu?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          menu?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          body: string | null
          canonical_url: string | null
          content: Json
          created_at: string
          id: string
          is_published: boolean
          og_image: string | null
          robots: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          canonical_url?: string | null
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          og_image?: string | null
          robots?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          canonical_url?: string | null
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          og_image?: string | null
          robots?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_main: boolean
          product_id: string
          sort_order: number
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_main?: boolean
          product_id: string
          sort_order?: number
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_main?: boolean
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_requests: {
        Row: {
          admin_notes: string | null
          budget: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          phone: string
          product_name: string
          quantity: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          phone: string
          product_name: string
          quantity?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          phone?: string
          product_name?: string
          quantity?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_usage_tags: {
        Row: {
          created_at: string
          id: string
          product_id: string
          usage_tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          usage_tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          usage_tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_usage_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_usage_tags_usage_tag_id_fkey"
            columns: ["usage_tag_id"]
            isOneToOne: false
            referencedRelation: "usage_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          accessories_included: string | null
          availability: string
          battery_condition: string | null
          battery_health: string | null
          bluetooth: string | null
          box_available: boolean | null
          brand_id: string | null
          canonical_url: string | null
          category_id: string | null
          charger_available: boolean | null
          color: string | null
          condition: string | null
          condition_notes: string | null
          cpu_cores: string | null
          cpu_speed: string | null
          cpu_threads: string | null
          created_at: string
          description: string | null
          dimensions: string | null
          discount: number | null
          display_resolution: string | null
          display_size: string | null
          display_type: string | null
          gpu_memory: string | null
          gpu_model: string | null
          grade: string | null
          graphics_type: string | null
          id: string
          is_active: boolean
          is_best_seller: boolean
          is_featured: boolean
          is_new_arrival: boolean
          keyboard: string | null
          main_image_alt: string | null
          main_image_url: string | null
          max_ram: string | null
          minimum_stock: number
          mrp: number | null
          name: string
          operating_system: string | null
          original_charger: boolean | null
          ports: string | null
          price: number | null
          processor_brand: string | null
          processor_generation: string | null
          processor_model: string | null
          product_type: string | null
          ram: string | null
          ram_speed: string | null
          ram_type: string | null
          reserved_quantity: number
          secondary_storage: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          short_description: string | null
          show_price: boolean
          sku: string | null
          slug: string
          sort_order: number
          stock_quantity: number
          storage_capacity: string | null
          storage_type: string | null
          subcategory: string | null
          touchscreen: boolean | null
          updated_at: string
          view_count: number
          warranty: string | null
          warranty_period: string | null
          warranty_terms: string | null
          webcam: string | null
          weight: string | null
          wifi: string | null
        }
        Insert: {
          accessories_included?: string | null
          availability?: string
          battery_condition?: string | null
          battery_health?: string | null
          bluetooth?: string | null
          box_available?: boolean | null
          brand_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          charger_available?: boolean | null
          color?: string | null
          condition?: string | null
          condition_notes?: string | null
          cpu_cores?: string | null
          cpu_speed?: string | null
          cpu_threads?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          discount?: number | null
          display_resolution?: string | null
          display_size?: string | null
          display_type?: string | null
          gpu_memory?: string | null
          gpu_model?: string | null
          grade?: string | null
          graphics_type?: string | null
          id?: string
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          keyboard?: string | null
          main_image_alt?: string | null
          main_image_url?: string | null
          max_ram?: string | null
          minimum_stock?: number
          mrp?: number | null
          name: string
          operating_system?: string | null
          original_charger?: boolean | null
          ports?: string | null
          price?: number | null
          processor_brand?: string | null
          processor_generation?: string | null
          processor_model?: string | null
          product_type?: string | null
          ram?: string | null
          ram_speed?: string | null
          ram_type?: string | null
          reserved_quantity?: number
          secondary_storage?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          show_price?: boolean
          sku?: string | null
          slug: string
          sort_order?: number
          stock_quantity?: number
          storage_capacity?: string | null
          storage_type?: string | null
          subcategory?: string | null
          touchscreen?: boolean | null
          updated_at?: string
          view_count?: number
          warranty?: string | null
          warranty_period?: string | null
          warranty_terms?: string | null
          webcam?: string | null
          weight?: string | null
          wifi?: string | null
        }
        Update: {
          accessories_included?: string | null
          availability?: string
          battery_condition?: string | null
          battery_health?: string | null
          bluetooth?: string | null
          box_available?: boolean | null
          brand_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          charger_available?: boolean | null
          color?: string | null
          condition?: string | null
          condition_notes?: string | null
          cpu_cores?: string | null
          cpu_speed?: string | null
          cpu_threads?: string | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          discount?: number | null
          display_resolution?: string | null
          display_size?: string | null
          display_type?: string | null
          gpu_memory?: string | null
          gpu_model?: string | null
          grade?: string | null
          graphics_type?: string | null
          id?: string
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new_arrival?: boolean
          keyboard?: string | null
          main_image_alt?: string | null
          main_image_url?: string | null
          max_ram?: string | null
          minimum_stock?: number
          mrp?: number | null
          name?: string
          operating_system?: string | null
          original_charger?: boolean | null
          ports?: string | null
          price?: number | null
          processor_brand?: string | null
          processor_generation?: string | null
          processor_model?: string | null
          product_type?: string | null
          ram?: string | null
          ram_speed?: string | null
          ram_type?: string | null
          reserved_quantity?: number
          secondary_storage?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          show_price?: boolean
          sku?: string | null
          slug?: string
          sort_order?: number
          stock_quantity?: number
          storage_capacity?: string | null
          storage_type?: string | null
          subcategory?: string | null
          touchscreen?: boolean | null
          updated_at?: string
          view_count?: number
          warranty?: string | null
          warranty_period?: string | null
          warranty_terms?: string | null
          webcam?: string | null
          weight?: string | null
          wifi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          id: string
          is_active: boolean
          note: string | null
          status_code: number
          to_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_path: string
          id?: string
          is_active?: boolean
          note?: string | null
          status_code?: number
          to_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_path?: string
          id?: string
          is_active?: boolean
          note?: string | null
          status_code?: number
          to_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      search_queries: {
        Row: {
          created_at: string
          id: string
          results_count: number
          term: string
        }
        Insert: {
          created_at?: string
          id?: string
          results_count?: number
          term: string
        }
        Update: {
          created_at?: string
          id?: string
          results_count?: number
          term?: string
        }
        Relationships: []
      }
      seo_metadata: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          id: string
          keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          path: string
          robots: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          path: string
          robots?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          path?: string
          robots?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          benefits: string[] | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          group_name: string
          key: string
          label: string | null
          updated_at: string
          value: string | null
        }
        Insert: {
          group_name?: string
          key: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Update: {
          group_name?: string
          key?: string
          label?: string | null
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string
          customer_name: string
          designation: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          photo_url: string | null
          rating: number | null
          review: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          customer_name: string
          designation?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          photo_url?: string | null
          rating?: number | null
          review: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          customer_name?: string
          designation?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          photo_url?: string | null
          rating?: number | null
          review?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      usage_tags: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
