-- ============================================
-- OriFit Store - Database Schema
-- Database: D1 (SQLite)
-- Version: 1.0.0
-- ============================================

-- جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL UNIQUE,
    name_en TEXT,
    name_fr TEXT,
    description_ar TEXT,
    icon TEXT,
    image_key TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- جدول المنتجات الكامل
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    name_fr TEXT,
    description_ar TEXT NOT NULL,
    description_en TEXT,
    description_fr TEXT,
    short_description_ar TEXT,
    price REAL NOT NULL,
    original_price REAL,
    cost_price REAL,
    stock INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    image_key TEXT,
    gallery_keys TEXT,
    category_id INTEGER,
    brand TEXT,
    weight REAL,
    dimensions TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    is_available BOOLEAN DEFAULT 1,
    is_new BOOLEAN DEFAULT 0,
    is_trending BOOLEAN DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    customer_id INTEGER,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    region TEXT,
    subtotal REAL NOT NULL,
    shipping_cost REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'عند الاستلام',
    payment_status TEXT DEFAULT 'معلق',
    status TEXT DEFAULT 'قيد المراجعة',
    tracking_number TEXT,
    notes TEXT,
    admin_notes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- جدول تفاصيل الطلبات
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    product_sku TEXT,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    discount REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    city TEXT,
    region TEXT,
    postal_code TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    is_vip BOOLEAN DEFAULT 0,
    last_order_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- جدول المراجعات
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_id INTEGER,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT 0,
    is_approved BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- جدول كوبونات الخصم
CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    max_discount REAL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    starts_at TEXT,
    expires_at TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- جدول سجل الحالات
CREATE TABLE IF NOT EXISTS order_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- Indexes للأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);

-- ============================================
-- بيانات أولية
-- ============================================

-- إدراج فئات افتراضية
INSERT OR IGNORE INTO categories (name_ar, name_en, name_fr, icon, display_order) VALUES
('أجهزة رياضية', 'Equipment', 'Équipement', '🏋️', 1),
('مكملات غذائية', 'Supplements', 'Suppléments', '💊', 2),
('ملابس رياضية', 'Sportswear', 'Vêtements de sport', '👕', 3),
('إكسسوارات', 'Accessories', 'Accessoires', '🎒', 4),
('تغذية صحية', 'Healthy Food', 'Alimentation saine', '🥗', 5);

-- إدراج إعدادات افتراضية
INSERT OR IGNORE INTO settings (key, value, type) VALUES
('store_name', 'متجر OriFit', 'string'),
('currency', 'MAD', 'string'),
('tax_rate', '0', 'number'),
('free_shipping_threshold', '500', 'number'),
('default_shipping_cost', '30', 'number'),
('express_shipping_cost', '50', 'number'),
('store_phone', '+212 6XX XXX XXX', 'string'),
('store_email', 'info@orifit.ma', 'string'),
('store_address', 'المغرب', 'string');

-- منتجات تجريبية
INSERT OR IGNORE INTO products (sku, name_ar, name_en, description_ar, price, original_price, stock, category_id, is_featured, is_new) VALUES
('GYM-001', 'دمبل قابل للتعديل 20 كجم', 'Adjustable Dumbbell 20kg', 'دمبل احترافي قابل للتعديل من 2 إلى 20 كجم، مثالي للتمارين المنزلية', 899.00, 1200.00, 15, 1, 1, 1),
('SUP-001', 'بروتين واي 2 كجم', 'Whey Protein 2kg', 'بروتين واي عالي الجودة، نكهة الشوكولاتة، 25g بروتين لكل حصة', 450.00, 550.00, 30, 2, 1, 0),
('CLO-001', 'قميص رياضي رجالي', 'Men Sports T-Shirt', 'قميص رياضي قابل للتنفس، مقاوم للعرق، مناسب لجميع الرياضات', 129.00, NULL, 50, 3, 0, 1),
('ACC-001', 'حقيبة رياضية 40 لتر', 'Sports Bag 40L', 'حقيبة رياضية متعددة الجيوب، مقاومة للماء، بتصميم عصري', 199.00, 250.00, 25, 4, 0, 0);
