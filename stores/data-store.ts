'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Product, Category, Supplier, Customer, Offer, Coupon,
  Invoice, Order, Branch, Warehouse, UserProfile, Attendance,
  AppNotification, AuditLog, LoyaltyRule, LoyaltyTierRule,
} from '@/types';
import { uid, generateBarcode, generateTxn } from '@/lib/utils';

// ===== Demo Seed Data =====
const demoCategories: Category[] = [
  { id: 'cat-1', name: 'مواد غذائية', name_en: 'Groceries', icon: 'ShoppingBag', color: '#f97316', created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'مشروبات', name_en: 'Beverages', icon: 'Coffee', color: '#06b6d4', created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'منظفات', name_en: 'Cleaning', icon: 'SprayCan', color: '#8b5cf6', created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'ألبان وأجبان', name_en: 'Dairy', icon: 'Milk', color: '#3b82f6', created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'لحوم ودواجن', name_en: 'Meat', icon: 'Beef', color: '#ef4444', created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'خضروات وفواكه', name_en: 'Produce', icon: 'Apple', color: '#22c55e', created_at: new Date().toISOString() },
  { id: 'cat-7', name: 'حلويات وبسكويت', name_en: 'Sweets', icon: 'Cookie', color: '#ec4899', created_at: new Date().toISOString() },
  { id: 'cat-8', name: 'عناية شخصية', name_en: 'Personal Care', icon: 'Heart', color: '#f43f5e', created_at: new Date().toISOString() },
];

const demoProducts: Product[] = [
  { id: 'prod-1', name: 'أرز مصري 1 كجم', name_en: 'Egyptian Rice 1kg', sku: 'RICE-001', barcodes: ['2000000000017', '6001234500011'], category_id: 'cat-1', category_name: 'مواد غذائية', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200'], unit: 'kg', prices: { unit: 'kg', cost_price: 18, wholesale_price: 20, half_wholesale_price: 21, retail_price: 25, special_price: 23 }, stock: 150, min_stock: 20, has_expiry: false, is_weighted: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-2', name: 'سكر 1 كجم', name_en: 'Sugar 1kg', sku: 'SUGAR-001', barcodes: ['2000000000024'], category_id: 'cat-1', category_name: 'مواد غذائية', images: ['https://images.unsplash.com/photo-1610467518200-6e6c1c9a1d9e?w=200'], unit: 'kg', prices: { unit: 'kg', cost_price: 22, wholesale_price: 25, half_wholesale_price: 26, retail_price: 30, special_price: 28 }, stock: 80, min_stock: 15, has_expiry: false, is_weighted: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-3', name: 'زيت عافية 1 لتر', name_en: 'Afia Oil 1L', sku: 'OIL-001', barcodes: ['2000000000031'], category_id: 'cat-1', category_name: 'مواد غذائية', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200'], unit: 'liter', prices: { unit: 'liter', cost_price: 45, wholesale_price: 50, half_wholesale_price: 52, retail_price: 60 }, stock: 60, min_stock: 10, has_expiry: true, expiry_date: '2025-12-31', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-4', name: 'شاي العروسة 250جم', name_en: 'Arousa Tea 250g', sku: 'TEA-001', barcodes: ['2000000000048'], category_id: 'cat-2', category_name: 'مشروبات', images: ['https://images.unsplash.com/photo-1597318181403-cf3d4c1e7e7e?w=200'], unit: 'pack', prices: { unit: 'pack', cost_price: 30, wholesale_price: 35, half_wholesale_price: 37, retail_price: 42 }, stock: 12, min_stock: 15, has_expiry: true, expiry_date: '2025-06-30', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-5', name: 'كوكاكولا 1 لتر', name_en: 'Coca Cola 1L', sku: 'BEV-001', barcodes: ['2000000000055', '5449000000996'], category_id: 'cat-2', category_name: 'مشروبات', images: ['https://images.unsplash.com/photo-1622480945489-3e9d5b1e1e1e?w=200'], unit: 'liter', prices: { unit: 'liter', cost_price: 12, wholesale_price: 15, half_wholesale_price: 16, retail_price: 20 }, stock: 200, min_stock: 30, has_expiry: true, expiry_date: '2025-10-15', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-6', name: 'لبن جهينة كامل الدسم 1 لتر', name_en: 'Juhayna Milk 1L', sku: 'MILK-001', barcodes: ['2000000000062'], category_id: 'cat-4', category_name: 'ألبان وأجبان', images: ['https://images.unsplash.com/photo-1563636617719-3992e1d6f4e3?w=200'], unit: 'liter', prices: { unit: 'liter', cost_price: 22, wholesale_price: 25, half_wholesale_price: 26, retail_price: 32 }, stock: 45, min_stock: 10, has_expiry: true, expiry_date: '2025-02-28', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-7', name: 'جبنة بيضاء 500جم', name_en: 'White Cheese 500g', sku: 'CHEESE-001', barcodes: ['2000000000079'], category_id: 'cat-4', category_name: 'ألبان وأجبان', images: ['https://images.unsplash.com/photo-1452195103389-70bb2b8ea2c3?w=200'], unit: 'pack', prices: { unit: 'pack', cost_price: 40, wholesale_price: 48, half_wholesale_price: 50, retail_price: 60 }, stock: 30, min_stock: 8, has_expiry: true, expiry_date: '2025-03-15', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-8', name: 'دجاج بلدي 1 كجم', name_en: 'Chicken 1kg', sku: 'MEAT-001', barcodes: ['2000000000086'], category_id: 'cat-5', category_name: 'لحوم ودواجن', images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200'], unit: 'kg', prices: { unit: 'kg', cost_price: 70, wholesale_price: 78, half_wholesale_price: 80, retail_price: 90 }, stock: 25, min_stock: 5, has_expiry: true, expiry_date: '2025-01-20', is_weighted: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-9', name: 'طماطم 1 كجم', name_en: 'Tomatoes 1kg', sku: 'PROD-001', barcodes: ['2000000000093'], category_id: 'cat-6', category_name: 'خضروات وفواكه', images: ['https://images.unsplash.com/photo-1546470427-227df7fc04f5?w=200'], unit: 'kg', prices: { unit: 'kg', cost_price: 8, wholesale_price: 10, half_wholesale_price: 11, retail_price: 15 }, stock: 100, min_stock: 20, has_expiry: false, is_weighted: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-10', name: 'موز 1 كجم', name_en: 'Bananas 1kg', sku: 'PROD-002', barcodes: ['2000000000109'], category_id: 'cat-6', category_name: 'خضروات وفواكه', images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200'], unit: 'kg', prices: { unit: 'kg', cost_price: 15, wholesale_price: 18, half_wholesale_price: 19, retail_price: 25 }, stock: 50, min_stock: 10, has_expiry: false, is_weighted: true, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-11', name: 'كيري 12 قطعة', name_en: 'Puck Cheese 12pc', sku: 'DAIRY-002', barcodes: ['2000000000116'], category_id: 'cat-4', category_name: 'ألبان وأجبان', images: ['https://images.unsplash.com/photo-1486297678162-eb685b70e3e6?w=200'], unit: 'box', prices: { unit: 'box', cost_price: 55, wholesale_price: 62, half_wholesale_price: 65, retail_price: 75 }, stock: 8, min_stock: 12, has_expiry: true, expiry_date: '2025-04-10', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-12', name: 'بريل صابون 400جم', name_en: 'Pril Soap 400g', sku: 'CLEAN-001', barcodes: ['2000000000123'], category_id: 'cat-3', category_name: 'منظفات', images: ['https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200'], unit: 'pack', prices: { unit: 'pack', cost_price: 25, wholesale_price: 30, half_wholesale_price: 32, retail_price: 38 }, stock: 70, min_stock: 15, has_expiry: false, is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-13', name: 'بسكويت أوريو 12 قطعة', name_en: 'Oreo 12pc', sku: 'SWT-001', barcodes: ['2000000000130'], category_id: 'cat-7', category_name: 'حلويات وبسكويت', images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200'], unit: 'pack', prices: { unit: 'pack', cost_price: 18, wholesale_price: 22, half_wholesale_price: 23, retail_price: 28 }, stock: 120, min_stock: 20, has_expiry: true, expiry_date: '2025-09-01', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-14', name: 'شامبو هيد آند شولدرز 400مل', name_en: 'Head & Shoulders 400ml', sku: 'CARE-001', barcodes: ['2000000000147'], category_id: 'cat-8', category_name: 'عناية شخصية', images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200'], unit: 'pack', prices: { unit: 'pack', cost_price: 45, wholesale_price: 55, half_wholesale_price: 58, retail_price: 70 }, stock: 35, min_stock: 8, has_expiry: true, expiry_date: '2026-01-15', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-15', name: 'مكرونة الملكة 500جم', name_en: 'Queen Pasta 500g', sku: 'PASTA-001', barcodes: ['2000000000154'], category_id: 'cat-1', category_name: 'مواد غذائية', images: ['https://images.unsplash.com/photo-1551462147-37825b1c9a6b?w=200'], unit: 'pack', prices: { unit: 'pack', cost_price: 10, wholesale_price: 12, half_wholesale_price: 13, retail_price: 16 }, stock: 90, min_stock: 20, has_expiry: true, expiry_date: '2025-11-30', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prod-16', name: 'بفكوكا ماء 1.5 لتر', name_en: 'Baraka Water 1.5L', sku: 'WATER-001', barcodes: ['2000000000161'], category_id: 'cat-2', category_name: 'مشروبات', images: ['https://images.unsplash.com/photo-1560887906-e64ac90c4b2e?w=200'], unit: 'liter', prices: { unit: 'liter', cost_price: 5, wholesale_price: 6, half_wholesale_price: 6.5, retail_price: 8 }, stock: 5, min_stock: 25, has_expiry: true, expiry_date: '2026-06-01', is_weighted: false, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const demoSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'شركة الدلتا للتوريدات', phone: '01012345678', email: 'delta@supply.com', address: 'القاهرة - مدينة نصر', balance: 12500, created_at: new Date().toISOString() },
  { id: 'sup-2', name: 'مؤسسة النيل للأغذية', phone: '01198765432', email: 'nile@food.com', address: 'الجيزة - الهرم', balance: -3500, created_at: new Date().toISOString() },
  { id: 'sup-3', name: 'شركة المشروبات المتحدة', phone: '01234567890', email: 'united@bev.com', address: 'الإسكندرية - سيدي بشر', balance: 8000, created_at: new Date().toISOString() },
  { id: 'sup-4', name: 'مزارع الوادي', phone: '01099887766', address: 'الفيوم - طريق الصحراوي', balance: 2200, created_at: new Date().toISOString() },
  { id: 'sup-5', name: 'شركة النظافة الحديثة', phone: '01555667788', email: 'clean@modern.com', address: 'القاهرة - المعادي', balance: 0, created_at: new Date().toISOString() },
];

const demoCustomers: Customer[] = [
  { id: 'cus-1', name: 'أحمد محمد علي', phone: '01012345678', email: 'ahmed@email.com', address: 'القاهرة', balance: 500, debt: 200, points: 1250, loyalty_tier: 'gold', total_orders: 45, total_spent: 12500, birthday: '1990-05-15', created_at: new Date().toISOString() },
  { id: 'cus-2', name: 'فاطمة حسن إبراهيم', phone: '01198765432', email: 'fatma@email.com', address: 'الجيزة', balance: 0, debt: 0, points: 3800, loyalty_tier: 'platinum', total_orders: 120, total_spent: 45000, birthday: '1985-08-20', created_at: new Date().toISOString() },
  { id: 'cus-3', name: 'محمود خالد سعيد', phone: '01234567890', address: 'الإسكندرية', balance: 1000, debt: 500, points: 450, loyalty_tier: 'silver', total_orders: 18, total_spent: 3800, birthday: '1995-12-03', created_at: new Date().toISOString() },
  { id: 'cus-4', name: 'سارة أحمد عبدالله', phone: '01555667788', email: 'sara@email.com', address: 'القاهرة - مصر الجديدة', balance: 250, debt: 0, points: 8900, loyalty_tier: 'vip', total_orders: 200, total_spent: 89000, birthday: '1988-03-10', created_at: new Date().toISOString() },
  { id: 'cus-5', name: 'عميل نقدي', phone: '0000000000', balance: 0, debt: 0, points: 0, loyalty_tier: 'bronze', total_orders: 0, total_spent: 0, created_at: new Date().toISOString() },
];

const demoInvoices: Invoice[] = Array.from({ length: 8 }, (_, i) => {
  const items = [
    { id: uid(), product_id: 'prod-1', product_name: 'أرز مصري 1 كجم', barcode: '2000000000017', unit: 'kg' as const, quantity: 2, price: 25, discount: 0, total: 50 },
    { id: uid(), product_id: 'prod-5', product_name: 'كوكاكولا 1 لتر', barcode: '2000000000055', unit: 'liter' as const, quantity: 3, price: 20, discount: 0, total: 60 },
  ];
  const subtotal = 110;
  const total = subtotal;
  return {
    id: `inv-${i + 1}`,
    invoice_number: generateTxn('INV'),
    customer_id: i % 3 === 0 ? 'cus-1' : i % 3 === 1 ? 'cus-2' : undefined,
    customer_name: i % 3 === 0 ? 'أحمد محمد علي' : i % 3 === 1 ? 'فاطمة حسن إبراهيم' : 'عميل نقدي',
    cashier_id: 'user-1',
    cashier_name: 'مدير النظام',
    items,
    subtotal,
    discount: 0,
    service_fee: 0,
    tax: 0,
    total,
    paid: total,
    change: 0,
    payment_method: (['cash', 'card', 'vodafone_cash'] as const)[i % 3],
    points_earned: Math.floor(total / 10),
    points_redeemed: 0,
    status: 'completed',
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  };
});

const demoOffers: Offer[] = [
  { id: 'off-1', name: 'اشتري 1 احصل على 1 - كوكاكولا', type: 'bogo', description: 'اشتري عبوة كوكاكولا واحصل على الأخرى مجاناً', product_ids: ['prod-5'], buy_qty: 1, get_qty: 1, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 7 * 86400000).toISOString(), is_active: true, is_auto: true, created_at: new Date().toISOString() },
  { id: 'off-2', name: 'خصم 20% على المنظفات', type: 'category_discount', description: 'خصم على جميع منتجات المنظفات', category_ids: ['cat-3'], discount_percentage: 20, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 14 * 86400000).toISOString(), is_active: true, is_auto: true, created_at: new Date().toISOString() },
  { id: 'off-3', name: 'عرض الجمعة - خصم 15%', type: 'weekend', description: 'خصم نهاية الأسبوع على جميع المنتجات', discount_percentage: 15, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 30 * 86400000).toISOString(), is_active: true, is_auto: false, created_at: new Date().toISOString() },
  { id: 'off-4', name: 'عرض رمضان - اشتري 2 احصل على 3', type: 'ramadan', description: 'عرض رمضان الكريم على المواد الغذائية', product_ids: ['prod-1', 'prod-2', 'prod-15'], buy_qty: 2, get_qty: 3, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 30 * 86400000).toISOString(), is_active: false, is_auto: true, created_at: new Date().toISOString() },
  { id: 'off-5', name: 'ساعة التخفيضات - خصم 30%', type: 'happy_hour', description: 'خصم 30% من 8 مساءً إلى 10 مساءً', discount_percentage: 30, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 60 * 86400000).toISOString(), is_active: true, is_auto: true, created_at: new Date().toISOString() },
  { id: 'off-6', name: 'اشتري 3 بسكويت بسعر 2', type: 'quantity_discount', product_ids: ['prod-13'], buy_qty: 3, get_qty: 2, discount_percentage: 33, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 10 * 86400000).toISOString(), is_active: true, is_auto: true, created_at: new Date().toISOString() },
];

const demoCoupons: Coupon[] = [
  { id: 'cp-1', code: 'WELCOME10', type: 'percentage', value: 10, min_order: 100, expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), usage_limit: 100, used_count: 25, is_active: true, created_at: new Date().toISOString() },
  { id: 'cp-2', code: 'SAVE50', type: 'fixed', value: 50, min_order: 500, expires_at: new Date(Date.now() + 15 * 86400000).toISOString(), usage_limit: 50, used_count: 12, is_active: true, created_at: new Date().toISOString() },
  { id: 'cp-3', code: 'VIPGIFT', type: 'free_item', value: 0, expires_at: new Date(Date.now() + 90 * 86400000).toISOString(), usage_limit: 10, used_count: 3, is_active: true, customer_id: 'cus-4', created_at: new Date().toISOString() },
  { id: 'cp-4', code: 'EID2025', type: 'percentage', value: 25, expires_at: new Date(Date.now() + 45 * 86400000).toISOString(), usage_limit: 200, used_count: 89, is_active: true, created_at: new Date().toISOString() },
];

const demoOrders: Order[] = [
  { id: 'ord-1', order_number: generateTxn('ORD'), channel: 'whatsapp', customer_id: 'cus-1', customer_name: 'أحمد محمد علي', customer_phone: '01012345678', items: [{ id: uid(), product_id: 'prod-5', product_name: 'كوكاكولا 1 لتر', unit: 'liter', quantity: 5, price: 20, discount: 0, total: 100 }], total: 100, fulfillment: 'delivery', address: 'القاهرة - مدينة نصر - شارع عباس العقاد', status: 'new', notes: 'الاتصال قبل الوصول', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'ord-2', order_number: generateTxn('ORD'), channel: 'phone', customer_id: 'cus-2', customer_name: 'فاطمة حسن إبراهيم', customer_phone: '01198765432', items: [{ id: uid(), product_id: 'prod-3', product_name: 'زيت عافية 1 لتر', unit: 'liter', quantity: 3, price: 60, discount: 0, total: 180 }, { id: uid(), product_id: 'prod-1', product_name: 'أرز مصري 1 كجم', unit: 'kg', quantity: 5, price: 25, discount: 0, total: 125 }], total: 305, fulfillment: 'pickup', status: 'confirmed', created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'ord-3', order_number: generateTxn('ORD'), channel: 'online', customer_id: 'cus-3', customer_name: 'محمود خالد سعيد', customer_phone: '01234567890', items: [{ id: uid(), product_id: 'prod-6', product_name: 'لبن جهينة 1 لتر', unit: 'liter', quantity: 4, price: 32, discount: 0, total: 128 }], total: 128, fulfillment: 'delivery', address: 'الإسكندرية - سيدي بشر', status: 'out_for_delivery', assigned_to: 'سائق التوصيل - كريم', created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 'ord-4', order_number: generateTxn('ORD'), channel: 'whatsapp', customer_name: 'عميل جديد', customer_phone: '01099998888', items: [{ id: uid(), product_id: 'prod-9', product_name: 'طماطم 1 كجم', unit: 'kg', quantity: 3, price: 15, discount: 0, total: 45 }], total: 45, fulfillment: 'delivery', address: 'الجيزة - الهرم', status: 'delivered', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 43200000).toISOString() },
];

const demoBranches: Branch[] = [
  { id: 'br-1', name: 'الفرع الرئيسي', code: 'MAIN', address: 'القاهرة - وسط البلد', phone: '0223456789', is_main: true, created_at: new Date().toISOString() },
  { id: 'br-2', name: 'فرع مدينة نصر', code: 'NASR', address: 'القاهرة - مدينة نصر', phone: '0223456788', is_main: false, created_at: new Date().toISOString() },
  { id: 'br-3', name: 'فرع المعادي', code: 'MAADI', address: 'القاهرة - المعادي', phone: '0223456787', is_main: false, created_at: new Date().toISOString() },
];

const demoWarehouses: Warehouse[] = [
  { id: 'wh-1', name: 'المخزن الرئيسي', branch_id: 'br-1', type: 'main', created_at: new Date().toISOString() },
  { id: 'wh-2', name: 'مخزن مدينة نصر', branch_id: 'br-2', type: 'sub', created_at: new Date().toISOString() },
  { id: 'wh-3', name: 'مخزن المعادي', branch_id: 'br-3', type: 'sub', created_at: new Date().toISOString() },
];

const demoEmployees: UserProfile[] = [
  { id: 'user-1', full_name: 'مدير النظام', phone: '01000000001', email: 'admin@mhmd.com', role: 'admin', branch_id: 'br-1', two_factor_enabled: true, salary: 15000, bonus: 2000, deductions: 0, custody: 5000, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-2', full_name: 'محمد السيد', phone: '01000000002', email: 'cashier1@mhmd.com', role: 'cashier', branch_id: 'br-1', two_factor_enabled: false, salary: 6000, bonus: 500, deductions: 100, custody: 1000, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-3', full_name: 'أحمد عبدالرحمن', phone: '01000000003', email: 'manager@mhmd.com', role: 'manager', branch_id: 'br-2', two_factor_enabled: true, salary: 10000, bonus: 1500, deductions: 0, custody: 3000, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-4', full_name: 'خالد فؤاد', phone: '01000000004', email: 'warehouse@mhmd.com', role: 'warehouse', branch_id: 'br-1', two_factor_enabled: false, salary: 5500, bonus: 300, deductions: 50, custody: 500, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'user-5', full_name: 'مريم حسن', phone: '01000000005', email: 'accountant@mhmd.com', role: 'accountant', branch_id: 'br-1', two_factor_enabled: true, salary: 8000, bonus: 800, deductions: 0, custody: 2000, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const demoAttendance: Attendance[] = demoEmployees.flatMap((e) =>
  Array.from({ length: 5 }, (_, i) => ({
    id: uid(),
    user_id: e.id,
    user_name: e.full_name,
    check_in: new Date(Date.now() - (4 - i) * 86400000 + 9 * 3600000).toISOString(),
    check_out: new Date(Date.now() - (4 - i) * 86400000 + 17 * 3600000).toISOString(),
    status: (i === 1 ? 'late' : 'present') as 'present' | 'late',
    created_at: new Date().toISOString(),
  }))
);

const demoNotifications: AppNotification[] = [
  { id: uid(), type: 'low_stock', title: 'تنبيه نقص مخزون', message: 'شاي العروسة 250جم - المخزون 12 قطعة (أقل من الحد الأدنى 15)', channel: 'in_app', is_read: false, created_at: new Date().toISOString() },
  { id: uid(), type: 'low_stock', title: 'تنبيه نقص مخزون', message: 'بفكوكا ماء 1.5 لتر - المخزون 5 قطعة (أقل من الحد الأدنى 25)', channel: 'in_app', is_read: false, created_at: new Date().toISOString() },
  { id: uid(), type: 'expiry_warning', title: 'تنبيه قرب انتهاء الصلاحية', message: 'لبن جهينة كامل الدسم 1 لتر ينتهي خلال 60 يوم', channel: 'sms', recipient: '01012345678', is_read: false, created_at: new Date().toISOString() },
  { id: uid(), type: 'new_order', title: 'طلب جديد', message: 'طلب جديد من واتساب - أحمد محمد علي - 100 ج.م', channel: 'whatsapp', is_read: false, created_at: new Date().toISOString() },
  { id: uid(), type: 'offer', title: 'عرض جديد تم تفعيله', message: 'عرض الجمعة - خصم 15% تم تفعيله بنجاح', channel: 'in_app', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: uid(), type: 'loyalty', title: 'ترقية مستوى عميل', message: 'تم ترقية العميل سارة أحمد إلى مستوى VIP', channel: 'email', recipient: 'sara@email.com', is_read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const demoAuditLogs: AuditLog[] = [
  { id: uid(), user_id: 'user-1', user_name: 'مدير النظام', action: 'create', entity: 'product', entity_id: 'prod-16', details: { name: 'بفكوكا ماء 1.5 لتر' }, ip_address: '192.168.1.1', created_at: new Date().toISOString() },
  { id: uid(), user_id: 'user-2', user_name: 'محمد السيد', action: 'create', entity: 'invoice', entity_id: 'inv-8', details: { total: 110 }, ip_address: '192.168.1.2', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: uid(), user_id: 'user-3', user_name: 'أحمد عبدالرحمن', action: 'update', entity: 'offer', entity_id: 'off-3', details: { discount: 15 }, ip_address: '192.168.1.3', created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: uid(), user_id: 'user-1', user_name: 'مدير النظام', action: 'login', entity: 'auth', details: {}, ip_address: '192.168.1.1', created_at: new Date(Date.now() - 1800000).toISOString() },
];

const demoLoyaltyRule: LoyaltyRule = {
  id: 'lr-1',
  points_per_egyptian_pound: 0.1,
  birthday_gift_points: 500,
  order_milestone: 50,
  milestone_gift_points: 1000,
  event_multiplier: 2,
  is_event_active: false,
};

const demoTierRules: LoyaltyTierRule[] = [
  { tier: 'bronze', min_points: 0, multiplier: 1, benefits: ['نقاط أساسية', 'إشعارات العروض'], color: '#cd7f32' },
  { tier: 'silver', min_points: 500, multiplier: 1.2, benefits: ['نقاط أساسية + 20%', 'خصم 5% على المواليد'], color: '#c0c0c0' },
  { tier: 'gold', min_points: 1000, multiplier: 1.5, benefits: ['نقاط + 50%', 'خصم 10%', 'هدية الميلاد'], color: '#fbbf24' },
  { tier: 'platinum', min_points: 3000, multiplier: 2, benefits: ['نقاط مضاعفة', 'خصم 15%', 'كوبونات حصرية', 'توصيل مجاني'], color: '#e5e4e2' },
  { tier: 'vip', min_points: 5000, multiplier: 3, benefits: ['نقاط ثلاثية', 'خصم 25%', 'مدير حساب خاص', 'أولوية في الطلبات', 'هدايا شهرية'], color: '#9d4edd' },
];

// ===== Store =====
interface DataState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  offers: Offer[];
  coupons: Coupon[];
  invoices: Invoice[];
  orders: Order[];
  branches: Branch[];
  warehouses: Warehouse[];
  employees: UserProfile[];
  attendance: Attendance[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  loyaltyRule: LoyaltyRule;
  tierRules: LoyaltyTierRule[];

  // Products
  addProduct: (p: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Categories
  addCategory: (c: Omit<Category, 'id' | 'created_at'>) => void;
  deleteCategory: (id: string) => void;

  // Suppliers
  addSupplier: (s: Omit<Supplier, 'id' | 'created_at'>) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'created_at'>) => void;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Invoices
  addInvoice: (inv: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => void;

  // Offers
  addOffer: (o: Omit<Offer, 'id' | 'created_at'>) => void;
  updateOffer: (id: string, o: Partial<Offer>) => void;
  toggleOffer: (id: string) => void;
  deleteOffer: (id: string) => void;

  // Coupons
  addCoupon: (c: Omit<Coupon, 'id' | 'created_at'>) => void;
  deleteCoupon: (id: string) => void;

  // Orders
  addOrder: (o: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'created_at'>) => void;

  // Employees
  addEmployee: (e: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => void;
  updateEmployee: (id: string, e: Partial<UserProfile>) => void;
  deleteEmployee: (id: string) => void;

  // Loyalty
  updateLoyaltyRule: (r: Partial<LoyaltyRule>) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      products: demoProducts,
      categories: demoCategories,
      suppliers: demoSuppliers,
      customers: demoCustomers,
      offers: demoOffers,
      coupons: demoCoupons,
      invoices: demoInvoices,
      orders: demoOrders,
      branches: demoBranches,
      warehouses: demoWarehouses,
      employees: demoEmployees,
      attendance: demoAttendance,
      notifications: demoNotifications,
      auditLogs: demoAuditLogs,
      loyaltyRule: demoLoyaltyRule,
      tierRules: demoTierRules,

      addProduct: (p) => set({ products: [{ ...p, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...get().products] }),
      updateProduct: (id, p) => set({ products: get().products.map((x) => (x.id === id ? { ...x, ...p, updated_at: new Date().toISOString() } : x)) }),
      deleteProduct: (id) => set({ products: get().products.filter((x) => x.id !== id) }),

      addCategory: (c) => set({ categories: [...get().categories, { ...c, id: uid(), created_at: new Date().toISOString() }] }),
      deleteCategory: (id) => set({ categories: get().categories.filter((x) => x.id !== id) }),

      addSupplier: (s) => set({ suppliers: [{ ...s, id: uid(), created_at: new Date().toISOString() }, ...get().suppliers] }),
      updateSupplier: (id, s) => set({ suppliers: get().suppliers.map((x) => (x.id === id ? { ...x, ...s } : x)) }),
      deleteSupplier: (id) => set({ suppliers: get().suppliers.filter((x) => x.id !== id) }),

      addCustomer: (c) => set({ customers: [{ ...c, id: uid(), created_at: new Date().toISOString() }, ...get().customers] }),
      updateCustomer: (id, c) => set({ customers: get().customers.map((x) => (x.id === id ? { ...x, ...c } : x)) }),
      deleteCustomer: (id) => set({ customers: get().customers.filter((x) => x.id !== id) }),

      addInvoice: (inv) => set({ invoices: [{ ...inv, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...get().invoices] }),

      addOffer: (o) => set({ offers: [{ ...o, id: uid(), created_at: new Date().toISOString() }, ...get().offers] }),
      updateOffer: (id, o) => set({ offers: get().offers.map((x) => (x.id === id ? { ...x, ...o } : x)) }),
      toggleOffer: (id) => set({ offers: get().offers.map((x) => (x.id === id ? { ...x, is_active: !x.is_active } : x)) }),
      deleteOffer: (id) => set({ offers: get().offers.filter((x) => x.id !== id) }),

      addCoupon: (c) => set({ coupons: [{ ...c, id: uid(), created_at: new Date().toISOString() }, ...get().coupons] }),
      deleteCoupon: (id) => set({ coupons: get().coupons.filter((x) => x.id !== id) }),

      addOrder: (o) => set({ orders: [{ ...o, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...get().orders] }),
      updateOrderStatus: (id, status) => set({ orders: get().orders.map((x) => (x.id === id ? { ...x, status, updated_at: new Date().toISOString() } : x)) }),

      markNotificationRead: (id) => set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)) }),
      markAllRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, is_read: true })) }),
      addNotification: (n) => set({ notifications: [{ ...n, id: uid(), created_at: new Date().toISOString() }, ...get().notifications] }),

      addEmployee: (e) => set({ employees: [{ ...e, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...get().employees] }),
      updateEmployee: (id, e) => set({ employees: get().employees.map((x) => (x.id === id ? { ...x, ...e, updated_at: new Date().toISOString() } : x)) }),
      deleteEmployee: (id) => set({ employees: get().employees.filter((x) => x.id !== id) }),

      updateLoyaltyRule: (r) => set({ loyaltyRule: { ...get().loyaltyRule, ...r } }),
    }),
    { name: 'mhmd-data' }
  )
);
