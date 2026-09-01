export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "tags"
  | "date"
  | "reference";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  group?: string;
  options?: string[];
  refTable?: "categories" | "brands";
  required?: boolean;
  help?: string;
  placeholder?: string;
};

export type Column = {
  name: string;
  label: string;
  type?: "text" | "boolean" | "date" | "badge" | "image";
};

export type ResourceConfig = {
  key: string;
  table: string;
  label: string;
  singular: string;
  description: string;
  columns: Column[];
  fields: Field[];
  searchColumns: string[];
  orderBy: { column: string; ascending: boolean };
  slugFrom?: string;
  canCreate?: boolean;
  statusOptions?: string[];
};

const seo: Field[] = [
  { name: "seo_title", label: "SEO title", type: "text", group: "SEO" },
  { name: "seo_description", label: "SEO description", type: "textarea", group: "SEO" },
  { name: "seo_keywords", label: "SEO keywords", type: "text", group: "SEO" },
];

export const CONDITIONS = ["Refurbished", "Pre-Owned", "Used", "Open Box", "New"];
export const GRADES = ["A+", "A", "B+", "B", "C"];
export const AVAILABILITY = [
  "In Stock",
  "Limited Stock",
  "Out of Stock",
  "Enquire for Availability",
  "Made to Order",
];
export const PRODUCT_TYPES = [
  "Laptop",
  "Desktop",
  "Workstation",
  "Server",
  "Monitor",
  "Accessory",
  "Part",
  "Printer",
  "Networking",
];

export const resources: Record<string, ResourceConfig> = {
  products: {
    key: "products",
    table: "products",
    label: "Products",
    singular: "Product",
    description: "Catalogue of laptops, desktops, workstations, monitors, accessories and parts.",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["name", "sku", "processor_model", "short_description"],
    slugFrom: "name",
    columns: [
      { name: "main_image_url", label: "", type: "image" },
      { name: "name", label: "Name" },
      { name: "sku", label: "SKU" },
      { name: "condition", label: "Condition", type: "badge" },
      { name: "stock_quantity", label: "Stock" },
      { name: "availability", label: "Availability", type: "badge" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "name", label: "Product name", type: "text", required: true, group: "Basics" },
      { name: "slug", label: "URL slug", type: "text", required: true, group: "Basics" },
      { name: "sku", label: "SKU", type: "text", group: "Basics" },
      { name: "category_id", label: "Category", type: "reference", refTable: "categories", group: "Basics" },
      { name: "brand_id", label: "Brand", type: "reference", refTable: "brands", group: "Basics" },
      { name: "subcategory", label: "Subcategory", type: "text", group: "Basics" },
      { name: "product_type", label: "Product type", type: "select", options: PRODUCT_TYPES, group: "Basics" },
      { name: "short_description", label: "Short description", type: "textarea", group: "Basics" },
      { name: "description", label: "Full description", type: "richtext", group: "Basics" },

      { name: "main_image_url", label: "Main image", type: "image", group: "Media" },
      { name: "main_image_alt", label: "Main image alt text", type: "text", group: "Media" },

      { name: "condition", label: "Condition", type: "select", options: CONDITIONS, group: "Condition" },
      { name: "grade", label: "Grade", type: "select", options: GRADES, group: "Condition" },
      { name: "condition_notes", label: "Condition notes", type: "textarea", group: "Condition" },
      { name: "battery_condition", label: "Battery condition", type: "text", group: "Condition" },
      { name: "battery_health", label: "Battery health", type: "text", group: "Condition" },
      { name: "warranty", label: "Warranty", type: "text", group: "Condition" },
      { name: "warranty_period", label: "Warranty period", type: "text", group: "Condition" },
      { name: "warranty_terms", label: "Warranty terms", type: "textarea", group: "Condition" },
      { name: "accessories_included", label: "Accessories included", type: "text", group: "Condition" },
      { name: "box_available", label: "Box available", type: "boolean", group: "Condition" },
      { name: "charger_available", label: "Charger available", type: "boolean", group: "Condition" },
      { name: "original_charger", label: "Original charger", type: "boolean", group: "Condition" },

      { name: "processor_brand", label: "Processor brand", type: "text", group: "Specifications" },
      { name: "processor_model", label: "Processor model", type: "text", group: "Specifications" },
      { name: "processor_generation", label: "Generation", type: "text", group: "Specifications" },
      { name: "cpu_cores", label: "Cores", type: "text", group: "Specifications" },
      { name: "cpu_threads", label: "Threads", type: "text", group: "Specifications" },
      { name: "cpu_speed", label: "Clock speed", type: "text", group: "Specifications" },
      { name: "ram", label: "RAM", type: "text", group: "Specifications" },
      { name: "ram_type", label: "RAM type", type: "text", group: "Specifications" },
      { name: "ram_speed", label: "RAM speed", type: "text", group: "Specifications" },
      { name: "max_ram", label: "Maximum RAM", type: "text", group: "Specifications" },
      { name: "storage_type", label: "Storage type", type: "text", group: "Specifications" },
      { name: "storage_capacity", label: "Storage capacity", type: "text", group: "Specifications" },
      { name: "secondary_storage", label: "Secondary storage", type: "text", group: "Specifications" },
      { name: "display_size", label: "Display size", type: "text", group: "Specifications" },
      { name: "display_resolution", label: "Resolution", type: "text", group: "Specifications" },
      { name: "display_type", label: "Display type", type: "text", group: "Specifications" },
      { name: "touchscreen", label: "Touchscreen", type: "boolean", group: "Specifications" },
      { name: "graphics_type", label: "Graphics type", type: "text", group: "Specifications" },
      { name: "gpu_model", label: "GPU model", type: "text", group: "Specifications" },
      { name: "gpu_memory", label: "GPU memory", type: "text", group: "Specifications" },
      { name: "operating_system", label: "Operating system", type: "text", group: "Specifications" },
      { name: "keyboard", label: "Keyboard", type: "text", group: "Specifications" },
      { name: "ports", label: "Ports", type: "text", group: "Specifications" },
      { name: "wifi", label: "Wi-Fi", type: "text", group: "Specifications" },
      { name: "bluetooth", label: "Bluetooth", type: "text", group: "Specifications" },
      { name: "webcam", label: "Webcam", type: "text", group: "Specifications" },
      { name: "weight", label: "Weight", type: "text", group: "Specifications" },
      { name: "color", label: "Colour", type: "text", group: "Specifications" },
      { name: "dimensions", label: "Dimensions", type: "text", group: "Specifications" },

      { name: "price", label: "Price (INR)", type: "number", group: "Pricing & stock" },
      { name: "mrp", label: "MRP (INR)", type: "number", group: "Pricing & stock" },
      { name: "discount", label: "Discount (%)", type: "number", group: "Pricing & stock" },
      {
        name: "show_price",
        label: "Show price publicly",
        type: "boolean",
        group: "Pricing & stock",
        help: "When off, the website shows 'Contact for Price'.",
      },
      { name: "stock_quantity", label: "Stock quantity", type: "number", group: "Pricing & stock" },
      { name: "reserved_quantity", label: "Reserved quantity", type: "number", group: "Pricing & stock" },
      { name: "minimum_stock", label: "Low stock alert level", type: "number", group: "Pricing & stock" },
      {
        name: "availability",
        label: "Availability label",
        type: "select",
        options: AVAILABILITY,
        group: "Pricing & stock",
      },

      { name: "is_featured", label: "Featured", type: "boolean", group: "Visibility" },
      { name: "is_new_arrival", label: "New arrival", type: "boolean", group: "Visibility" },
      { name: "is_best_seller", label: "Best seller", type: "boolean", group: "Visibility" },
      { name: "is_active", label: "Active (visible on website)", type: "boolean", group: "Visibility" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },

      ...seo,
      { name: "canonical_url", label: "Canonical URL", type: "text", group: "SEO" },
    ],
  },

  categories: {
    key: "categories",
    table: "categories",
    label: "Categories",
    singular: "Category",
    description: "Top level product categories shown in navigation and on the home page.",
    orderBy: { column: "sort_order", ascending: true },
    searchColumns: ["name", "slug"],
    slugFrom: "name",
    columns: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "sort_order", label: "Order" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, group: "Basics" },
      { name: "slug", label: "URL slug", type: "text", required: true, group: "Basics" },
      { name: "short_description", label: "Short description", type: "textarea", group: "Basics" },
      { name: "description", label: "Description", type: "richtext", group: "Basics" },
      { name: "icon", label: "Icon name", type: "text", group: "Basics", help: "Lucide icon name, e.g. Laptop." },
      { name: "image_url", label: "Image", type: "image", group: "Media" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },
      { name: "is_active", label: "Active", type: "boolean", group: "Visibility" },
      ...seo,
    ],
  },

  brands: {
    key: "brands",
    table: "brands",
    label: "Brands",
    singular: "Brand",
    description: "Manufacturer brands used to filter the catalogue.",
    orderBy: { column: "sort_order", ascending: true },
    searchColumns: ["name", "slug"],
    slugFrom: "name",
    columns: [
      { name: "name", label: "Name" },
      { name: "slug", label: "Slug" },
      { name: "sort_order", label: "Order" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, group: "Basics" },
      { name: "slug", label: "URL slug", type: "text", required: true, group: "Basics" },
      { name: "description", label: "Description", type: "textarea", group: "Basics" },
      { name: "logo_url", label: "Logo", type: "image", group: "Media" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },
      { name: "is_active", label: "Active", type: "boolean", group: "Visibility" },
      ...seo,
    ],
  },

  services: {
    key: "services",
    table: "services",
    label: "Services",
    singular: "Service",
    description: "Repair, AMC, rental, upgrades and other services.",
    orderBy: { column: "sort_order", ascending: true },
    searchColumns: ["title", "slug"],
    slugFrom: "title",
    columns: [
      { name: "title", label: "Title" },
      { name: "slug", label: "Slug" },
      { name: "sort_order", label: "Order" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, group: "Basics" },
      { name: "slug", label: "URL slug", type: "text", required: true, group: "Basics" },
      { name: "short_description", label: "Short description", type: "textarea", group: "Basics" },
      { name: "description", label: "Full description", type: "richtext", group: "Basics" },
      { name: "icon", label: "Icon name", type: "text", group: "Basics" },
      { name: "image_url", label: "Image", type: "image", group: "Media" },
      { name: "benefits", label: "Benefits", type: "tags", group: "Basics", help: "One per line." },
      { name: "cta_text", label: "CTA text", type: "text", group: "Basics" },
      { name: "cta_link", label: "CTA link", type: "text", group: "Basics" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },
      { name: "is_active", label: "Active", type: "boolean", group: "Visibility" },
      { name: "seo_title", label: "SEO title", type: "text", group: "SEO" },
      { name: "seo_description", label: "SEO description", type: "textarea", group: "SEO" },
    ],
  },

  testimonials: {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "Only publish reviews you have actually received from customers.",
    orderBy: { column: "sort_order", ascending: true },
    searchColumns: ["customer_name", "company", "review"],
    columns: [
      { name: "customer_name", label: "Customer" },
      { name: "company", label: "Company" },
      { name: "rating", label: "Rating" },
      { name: "is_featured", label: "Featured", type: "boolean" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "customer_name", label: "Customer name", type: "text", required: true, group: "Basics" },
      { name: "company", label: "Company", type: "text", group: "Basics" },
      { name: "designation", label: "Designation", type: "text", group: "Basics" },
      { name: "review", label: "Review", type: "textarea", required: true, group: "Basics" },
      { name: "rating", label: "Rating (1-5)", type: "number", group: "Basics" },
      { name: "photo_url", label: "Photo", type: "image", group: "Media" },
      { name: "is_featured", label: "Featured", type: "boolean", group: "Visibility" },
      { name: "is_active", label: "Active", type: "boolean", group: "Visibility" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },
    ],
  },

  gallery: {
    key: "gallery",
    table: "gallery",
    label: "Gallery",
    singular: "Gallery image",
    description: "Photos of your facility, stock and work.",
    orderBy: { column: "sort_order", ascending: true },
    searchColumns: ["title", "category"],
    columns: [
      { name: "image_url", label: "", type: "image" },
      { name: "title", label: "Title" },
      { name: "category", label: "Category" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "image_url", label: "Image", type: "image", required: true, group: "Basics" },
      { name: "title", label: "Title", type: "text", group: "Basics" },
      { name: "caption", label: "Caption", type: "textarea", group: "Basics" },
      { name: "alt_text", label: "Alt text", type: "text", group: "Basics" },
      { name: "category", label: "Category", type: "text", group: "Basics" },
      { name: "is_featured", label: "Featured", type: "boolean", group: "Visibility" },
      { name: "is_active", label: "Active", type: "boolean", group: "Visibility" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },
    ],
  },

  faqs: {
    key: "faqs",
    table: "faqs",
    label: "FAQs",
    singular: "FAQ",
    description: "Questions and answers shown on the FAQ page and home page.",
    orderBy: { column: "sort_order", ascending: true },
    searchColumns: ["question", "answer"],
    columns: [
      { name: "question", label: "Question" },
      { name: "category", label: "Category" },
      { name: "sort_order", label: "Order" },
      { name: "is_active", label: "Active", type: "boolean" },
    ],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, group: "Basics" },
      { name: "answer", label: "Answer", type: "textarea", required: true, group: "Basics" },
      { name: "category", label: "Category", type: "text", group: "Basics" },
      { name: "sort_order", label: "Sort order", type: "number", group: "Visibility" },
      { name: "is_active", label: "Active", type: "boolean", group: "Visibility" },
    ],
  },

  pages: {
    key: "pages",
    table: "pages",
    label: "Pages",
    singular: "Page",
    description: "About, policies and other content pages.",
    orderBy: { column: "slug", ascending: true },
    searchColumns: ["title", "slug"],
    slugFrom: "title",
    columns: [
      { name: "title", label: "Title" },
      { name: "slug", label: "Slug" },
      { name: "is_published", label: "Published", type: "boolean" },
      { name: "updated_at", label: "Updated", type: "date" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, group: "Basics" },
      { name: "slug", label: "URL slug", type: "text", required: true, group: "Basics" },
      { name: "body", label: "Content", type: "richtext", group: "Basics" },
      { name: "is_published", label: "Published", type: "boolean", group: "Visibility" },
      ...seo,
      { name: "canonical_url", label: "Canonical URL", type: "text", group: "SEO" },
      { name: "og_image", label: "Social share image", type: "image", group: "SEO" },
      { name: "robots", label: "Robots", type: "text", group: "SEO" },
    ],
  },

  enquiries: {
    key: "enquiries",
    table: "enquiries",
    label: "Enquiries",
    singular: "Enquiry",
    description: "Product and bulk requirement enquiries submitted from the website.",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["name", "phone", "company_name", "product_name"],
    canCreate: false,
    statusOptions: ["New", "Contacted", "Quoted", "Won", "Lost", "Spam"],
    columns: [
      { name: "created_at", label: "Received", type: "date" },
      { name: "name", label: "Name" },
      { name: "phone", label: "Phone" },
      { name: "product_name", label: "Product" },
      { name: "source", label: "Source" },
      { name: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", group: "Lead" },
      { name: "company_name", label: "Company", type: "text", group: "Lead" },
      { name: "phone", label: "Phone", type: "text", group: "Lead" },
      { name: "whatsapp", label: "WhatsApp", type: "text", group: "Lead" },
      { name: "email", label: "Email", type: "text", group: "Lead" },
      { name: "city", label: "City", type: "text", group: "Lead" },
      { name: "requirement_type", label: "Requirement type", type: "text", group: "Requirement" },
      { name: "product_category", label: "Product category", type: "text", group: "Requirement" },
      { name: "product_name", label: "Product", type: "text", group: "Requirement" },
      { name: "quantity", label: "Quantity", type: "text", group: "Requirement" },
      { name: "budget", label: "Budget", type: "text", group: "Requirement" },
      { name: "required_date", label: "Required by", type: "date", group: "Requirement" },
      { name: "message", label: "Message", type: "textarea", group: "Requirement" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["New", "Contacted", "Quoted", "Won", "Lost", "Spam"],
        group: "Follow up",
      },
      { name: "assigned_to", label: "Assigned to", type: "text", group: "Follow up" },
      { name: "follow_up_date", label: "Follow up date", type: "date", group: "Follow up" },
      { name: "admin_notes", label: "Internal notes", type: "textarea", group: "Follow up" },
    ],
  },

  contacts: {
    key: "contacts",
    table: "contact_submissions",
    label: "Contact messages",
    singular: "Message",
    description: "Messages sent through the contact form.",
    orderBy: { column: "created_at", ascending: false },
    searchColumns: ["name", "phone", "subject"],
    canCreate: false,
    statusOptions: ["New", "Replied", "Closed", "Spam"],
    columns: [
      { name: "created_at", label: "Received", type: "date" },
      { name: "name", label: "Name" },
      { name: "phone", label: "Phone" },
      { name: "subject", label: "Subject" },
      { name: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", group: "Message" },
      { name: "phone", label: "Phone", type: "text", group: "Message" },
      { name: "email", label: "Email", type: "text", group: "Message" },
      { name: "subject", label: "Subject", type: "text", group: "Message" },
      { name: "message", label: "Message", type: "textarea", group: "Message" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["New", "Replied", "Closed", "Spam"],
        group: "Follow up",
      },
      { name: "admin_notes", label: "Internal notes", type: "textarea", group: "Follow up" },
    ],
  },

  seo: {
    key: "seo",
    table: "seo_metadata",
    label: "SEO",
    singular: "SEO entry",
    description: "Per-path titles, descriptions and social metadata.",
    orderBy: { column: "path", ascending: true },
    searchColumns: ["path", "title"],
    columns: [
      { name: "path", label: "Path" },
      { name: "title", label: "Title" },
      { name: "robots", label: "Robots" },
    ],
    fields: [
      { name: "path", label: "Path", type: "text", required: true, group: "Basics" },
      { name: "title", label: "Title", type: "text", group: "Basics" },
      { name: "description", label: "Description", type: "textarea", group: "Basics" },
      { name: "keywords", label: "Keywords", type: "text", group: "Basics" },
      { name: "og_title", label: "Social title", type: "text", group: "Social" },
      { name: "og_description", label: "Social description", type: "textarea", group: "Social" },
      { name: "og_image", label: "Social image", type: "image", group: "Social" },
      { name: "canonical_url", label: "Canonical URL", type: "text", group: "Basics" },
      { name: "robots", label: "Robots", type: "text", group: "Basics" },
    ],
  },
};

import { extraResources } from "./resources.extra";

Object.assign(resources, extraResources);

export const resourceList = Object.values(resources);

export function getResource(key: string): ResourceConfig | undefined {
  return resources[key];
}
