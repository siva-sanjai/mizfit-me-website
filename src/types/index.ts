export interface Product {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  images: string[];
  available_colors: string[];
  available_sizes: string[];
  fit_type: string;
  material: string;
  stock_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type DesignObjectType = 'image' | 'text';

export interface DesignObject {
  id: string;
  type: DesignObjectType;
  side: 'front' | 'back';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
}

export interface DesignImageObject extends DesignObject {
  type: 'image';
  sourceUrl: string;
  originalFileUrl: string;
  fileName: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface DesignTextObject extends DesignObject {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontStyle: string;
  align: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export type DesignItem = DesignImageObject | DesignTextObject;

export interface DesignSide {
  objects: DesignItem[];
}

export interface DesignState {
  front: DesignSide;
  back: DesignSide;
}

export const PRINT_AREAS = {
  front: { x: 0.27, y: 0.28, width: 0.46, height: 0.45 },
  back: { x: 0.27, y: 0.24, width: 0.46, height: 0.50 },
} as const;

export interface CartItem {
  id: string;
  product: Product;
  color: string;
  size: string;
  quantity: number;
  printSide: 'front' | 'back';
  designPreview: string | null;
  designFile: File | null;
  designFileName: string;
  itemPrice: number;
  customText?: string;
  frontDesign?: DesignItem[];
  backDesign?: DesignItem[];
  frontPreviewUrl?: string | null;
  backPreviewUrl?: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  print_side: string;
  design_file_name: string | null;
  design_storage_path: string | null;
  item_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'printing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface CheckoutFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  payment_method: 'cod' | 'upi';
}

export interface OrderStats {
  total: number;
  pending: number;
  printing: number;
  completed: number;
  totalSales: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'printing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
];

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB
