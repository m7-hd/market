-- ================================================================
-- Mhmd Market - Complete Supabase Database Schema
-- ================================================================
-- Run this in Supabase SQL Editor after creating your project
-- ================================================================

-- ===== Extensions =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== Helper: updated_at trigger =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== Branches =====
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  phone TEXT,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Users / Employees =====
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin','manager','cashier','warehouse','accountant')),
  branch_id UUID REFERENCES branches(id),
  avatar_url TEXT,
  pin_code TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  salary NUMERIC DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  custody NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Warehouses =====
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'main' CHECK (type IN ('main','sub')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Categories =====
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Products =====
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  sku TEXT UNIQUE NOT NULL,
  barcodes TEXT[] NOT NULL DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  unit TEXT NOT NULL DEFAULT 'piece',
  sub_units TEXT[] DEFAULT '{}',
  cost_price NUMERIC NOT NULL DEFAULT 0,
  wholesale_price NUMERIC NOT NULL DEFAULT 0,
  half_wholesale_price NUMERIC NOT NULL DEFAULT 0,
  retail_price NUMERIC NOT NULL DEFAULT 0,
  special_price NUMERIC,
  stock NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  expiry_date DATE,
  has_expiry BOOLEAN DEFAULT FALSE,
  is_weighted BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Stock Items (per warehouse) =====
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);
CREATE TRIGGER stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Stock Transfers =====
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_number TEXT UNIQUE NOT NULL,
  from_warehouse_id UUID REFERENCES warehouses(id),
  to_warehouse_id UUID REFERENCES warehouses(id),
  items JSONB NOT NULL DEFAULT '[]',
  employee_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Stock Counts =====
CREATE TABLE IF NOT EXISTS stock_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  count_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('partial','full')),
  warehouse_id UUID REFERENCES warehouses(id),
  items JSONB NOT NULL DEFAULT '[]',
  employee_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','confirmed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Suppliers =====
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Purchase Orders =====
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','ordered','received','partial_received')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Supplier Returns =====
CREATE TABLE IF NOT EXISTS supplier_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  po_id UUID REFERENCES purchase_orders(id),
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Supplier Payments =====
CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID REFERENCES suppliers(id),
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash','vodafone_cash','bank')),
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Customers =====
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  balance NUMERIC DEFAULT 0,
  debt NUMERIC DEFAULT 0,
  points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze','silver','gold','platinum','vip')),
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  birthday DATE,
  favorite_products TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Coupons =====
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage','fixed','free_item')),
  value NUMERIC NOT NULL DEFAULT 0,
  min_order NUMERIC,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Invoices =====
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  cashier_id UUID REFERENCES profiles(id),
  branch_id UUID REFERENCES branches(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  service_fee NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  paid NUMERIC DEFAULT 0,
  change NUMERIC DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash','card','vodafone_cash','mixed','credit')),
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed','suspended','returned','pending')),
  suspend_reason TEXT,
  qr_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Invoice Returns =====
CREATE TABLE IF NOT EXISTS invoice_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number TEXT UNIQUE NOT NULL,
  original_invoice_id UUID REFERENCES invoices(id),
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('full','partial')),
  employee_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Vodafone Cash Transactions =====
CREATE TABLE IF NOT EXISTS vodafone_cash_txns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  txn_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit','withdraw','transfer','bill_payment')),
  customer_name TEXT,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  fee NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  employee_id UUID REFERENCES profiles(id),
  branch_id UUID REFERENCES branches(id),
  status TEXT DEFAULT 'success' CHECK (status IN ('success','pending','failed','cancelled')),
  destination_wallet TEXT,
  invoice_id UUID REFERENCES invoices(id),
  qr_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER vodafone_cash_txns_updated_at BEFORE UPDATE ON vodafone_cash_txns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Vodafone Wallet =====
CREATE TABLE IF NOT EXISTS vodafone_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER vodafone_wallets_updated_at BEFORE UPDATE ON vodafone_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Offers =====
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bogo','quantity_discount','category_discount','weekend','ramadan','eid','happy_hour','auto')),
  description TEXT,
  product_ids TEXT[] DEFAULT '{}',
  category_ids TEXT[] DEFAULT '{}',
  buy_qty INTEGER,
  get_qty INTEGER,
  discount_percentage NUMERIC,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_auto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Orders =====
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('in_store','whatsapp','phone','online')),
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('delivery','pickup')),
  address TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','confirmed','preparing','out_for_delivery','delivered','cancelled')),
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Loyalty Rules =====
CREATE TABLE IF NOT EXISTS loyalty_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  points_per_egyptian_pound NUMERIC DEFAULT 0.1,
  birthday_gift_points INTEGER DEFAULT 500,
  order_milestone INTEGER DEFAULT 50,
  milestone_gift_points INTEGER DEFAULT 1000,
  event_multiplier NUMERIC DEFAULT 2,
  is_event_active BOOLEAN DEFAULT FALSE
);

-- ===== Notifications =====
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('low_stock','expiry_warning','new_order','offer','loyalty','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms','whatsapp','email','in_app')),
  recipient TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Audit Logs =====
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Attendance =====
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_name TEXT NOT NULL,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present' CHECK (status IN ('present','late','absent','leave')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE vodafone_cash_txns ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_counts ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all tables
CREATE POLICY "read_all" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON vodafone_cash_txns FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON stock_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON stock_transfers FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all" ON stock_counts FOR SELECT TO authenticated USING (true);

-- Policy: Authenticated users can insert/update/delete (adjust as needed)
CREATE POLICY "write_all_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_suppliers" ON suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_invoices" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_vodafone" ON vodafone_cash_txns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_offers" ON offers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_coupons" ON coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_stock" ON stock_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_stock_transfers" ON stock_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_stock_counts" ON stock_counts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "write_all_po" ON purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- Indexes
-- ================================================================
CREATE INDEX idx_products_barcode ON products USING GIN (barcodes);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_cashier ON invoices(cashier_id);
CREATE INDEX idx_invoices_date ON invoices(created_at);
CREATE INDEX idx_vodafone_phone ON vodafone_cash_txns(phone);
CREATE INDEX idx_vodafone_date ON vodafone_cash_txns(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ================================================================
-- Done! Your Mhmd Market database is ready.
-- ================================================================
