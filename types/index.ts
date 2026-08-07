// ====================================================================
// Mhmd Market - Complete Type System
// ====================================================================

export type UserRole = 'admin' | 'manager' | 'cashier' | 'warehouse' | 'accountant';
export type BranchRole = 'main' | 'sub';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: UserRole;
  branch_id?: string;
  avatar_url?: string;
  pin_code?: string; // 4-digit for fast login
  two_factor_enabled: boolean;
  salary?: number;
  bonus?: number;
  deductions?: number;
  custody?: number; // العهدة
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_main: boolean;
  created_at: string;
}

// ===== Vodafone Cash =====
export type VodafoneTxnType = 'deposit' | 'withdraw' | 'transfer' | 'bill_payment';
export type VodafoneTxnStatus = 'success' | 'pending' | 'failed' | 'cancelled';

export interface VodafoneCashTxn {
  id: string;
  txn_number: string;
  type: VodafoneTxnType;
  customer_name?: string;
  phone: string;
  amount: number;
  fee: number; // رسوم العملية
  commission: number; // العمولة (للسحب)
  net_amount: number;
  notes?: string;
  employee_id: string;
  employee_name?: string;
  branch_id?: string;
  status: VodafoneTxnStatus;
  destination_wallet?: string; // للتحويل
  invoice_id?: string; // ربط بفاتورة
  qr_data?: string;
  created_at: string;
  updated_at: string;
}

export interface VodafoneWallet {
  id: string;
  phone: string; // رقم المحفظة
  balance: number;
  total_deposits_today: number;
  total_withdrawals_today: number;
  total_transfers: number;
  updated_at: string;
}

// ===== Products / Inventory =====
export type SaleUnit = 'carton' | 'half_carton' | 'piece' | 'kg' | 'gram' | 'liter' | 'box' | 'pack';

export interface ProductPrice {
  unit: SaleUnit;
  cost_price: number;
  wholesale_price: number;
  half_wholesale_price: number;
  retail_price: number;
  special_price?: number;
}

export interface Product {
  id: string;
  name: string;
  name_en?: string;
  sku: string;
  barcodes: string[]; // أكثر من باركود
  category_id?: string;
  category_name?: string;
  description?: string;
  images: string[];
  unit: SaleUnit;
  sub_units?: SaleUnit[];
  prices: ProductPrice;
  stock: number; // المخزون الكلي
  min_stock: number; // حد التنبيه
  expiry_date?: string;
  has_expiry: boolean;
  is_weighted: boolean; // يباع بالوزن
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  branch_id: string;
  type: 'main' | 'sub';
  created_at: string;
}

export interface StockItem {
  id: string;
  product_id: string;
  product_name?: string;
  warehouse_id: string;
  warehouse_name?: string;
  quantity: number;
  updated_at: string;
}

export interface StockTransfer {
  id: string;
  transfer_number: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  items: { product_id: string; product_name: string; quantity: number }[];
  employee_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface StockCount {
  id: string;
  count_number: string;
  type: 'partial' | 'full';
  warehouse_id: string;
  items: { product_id: string; product_name: string; system_qty: number; actual_qty: number; difference: number }[];
  employee_id: string;
  status: 'draft' | 'confirmed';
  created_at: string;
}

// ===== Suppliers =====
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // المديونية
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  items: { product_id: string; product_name: string; quantity: number; unit_price: number; total: number }[];
  total: number;
  paid: number;
  status: 'draft' | 'ordered' | 'received' | 'partial_received';
  due_date?: string;
  created_at: string;
}

export interface SupplierReturn {
  id: string;
  return_number: string;
  supplier_id: string;
  po_id?: string;
  items: { product_id: string; product_name: string; quantity: number; reason: string }[];
  total: number;
  created_at: string;
}

export interface SupplierPayment {
  id: string;
  supplier_id: string;
  amount: number;
  method: 'cash' | 'vodafone_cash' | 'bank';
  reference?: string;
  created_at: string;
}

// ===== Customers =====
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // رصيد
  debt: number; // ديون
  points: number;
  loyalty_tier: LoyaltyTier;
  total_orders: number;
  total_spent: number;
  birthday?: string;
  favorite_products?: string[];
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_item';
  value: number;
  min_order?: number;
  expires_at?: string;
  usage_limit?: number;
  used_count: number;
  is_active: boolean;
  customer_id?: string;
  created_at: string;
}

// ===== Invoices / Sales =====
export type InvoiceStatus = 'completed' | 'suspended' | 'returned' | 'pending';
export type PaymentMethod = 'cash' | 'card' | 'vodafone_cash' | 'mixed' | 'credit';

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  barcode?: string;
  unit: SaleUnit;
  quantity: number;
  price: number;
  discount: number; // خصم على المنتج
  total: number;
  is_service?: boolean;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id?: string;
  customer_name?: string;
  cashier_id: string;
  cashier_name?: string;
  branch_id?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number; // خصم على الفاتورة
  service_fee: number; // خدمة
  tax: number;
  total: number;
  paid: number;
  change: number;
  payment_method: PaymentMethod;
  points_earned: number;
  points_redeemed: number;
  status: InvoiceStatus;
  suspend_reason?: string;
  qr_data?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceReturn {
  id: string;
  return_number: string;
  original_invoice_id: string;
  items: { product_id: string; product_name: string; quantity: number; price: number; reason: string }[];
  total: number;
  type: 'full' | 'partial';
  employee_id: string;
  created_at: string;
}

// ===== Loyalty =====
export interface LoyaltyRule {
  id: string;
  points_per_egyptian_pound: number; // نقطة لكل جنيه
  birthday_gift_points: number;
  order_milestone: number; // عدد طلبات للهدية
  milestone_gift_points: number;
  event_multiplier: number; // مضاعفة في المناسبات
  is_event_active: boolean;
}

export interface LoyaltyTierRule {
  tier: LoyaltyTier;
  min_points: number;
  multiplier: number; // مضاعف النقاط
  benefits: string[];
  color: string;
}

// ===== Offers =====
export type OfferType = 'bogo' | 'quantity_discount' | 'category_discount' | 'weekend' | 'ramadan' | 'eid' | 'happy_hour' | 'auto';

export interface Offer {
  id: string;
  name: string;
  type: OfferType;
  description?: string;
  product_ids?: string[];
  category_ids?: string[];
  buy_qty?: number;
  get_qty?: number;
  discount_percentage?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_auto: boolean;
  created_at: string;
}

// ===== Orders =====
export type OrderChannel = 'in_store' | 'whatsapp' | 'phone' | 'online';
export type OrderFulfillment = 'delivery' | 'pickup';
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  channel: OrderChannel;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  items: InvoiceItem[];
  total: number;
  fulfillment: OrderFulfillment;
  address?: string;
  status: OrderStatus;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ===== Reports =====
export interface SalesReport {
  total_sales: number;
  total_profit: number;
  total_loss: number;
  invoices_count: number;
  avg_invoice: number;
  by_day: { date: string; sales: number; profit: number }[];
}

// ===== Notifications =====
export type NotificationChannel = 'sms' | 'whatsapp' | 'email' | 'in_app';
export type NotificationType = 'low_stock' | 'expiry_warning' | 'new_order' | 'offer' | 'loyalty' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  recipient?: string;
  is_read: boolean;
  created_at: string;
}

// ===== Audit Log =====
export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// ===== Attendance =====
export interface Attendance {
  id: string;
  user_id: string;
  user_name: string;
  check_in: string;
  check_out?: string;
  status: 'present' | 'late' | 'absent' | 'leave';
  created_at: string;
}
