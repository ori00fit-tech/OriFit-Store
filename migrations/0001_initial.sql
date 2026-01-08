-- حذف الجداول القديمة
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS settings;

-- جدول الفئات
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- جدول المنتجات الكامل
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description_ar TEXT NOT NULL,
    description_en TEXT,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER DEFAULT 0,
    image_key TEXT,
    category_id INTEGER,
    brand TEXT,
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_available INTEGER DEFAULT 1,
    is_new INTEGER DEFAULT 0,
    is_trending INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- جدول الطلبات
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    total_amount REAL NOT NULL,
    shipping_cost REAL DEFAULT 0,
    payment_method TEXT DEFAULT 'عند الاستلام',
    status TEXT DEFAULT 'قيد المراجعة',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- جدول تفاصيل الطلبات
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول العملاء
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- جدول المراجعات
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- جدول الكوبونات
CREATE TABLE coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    expires_at TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- جدول سجل الحالات
CREATE TABLE order_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- جدول الإعدادات
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(phone);

-- بيانات أولية: الفئات
INSERT INTO categories (name_ar, name_en, icon, display_order) VALUES
('أجهزة رياضية', 'Equipment', '🏋️', 1),
('مكملات غذائية', 'Supplements', '💊', 2),
('ملابس رياضية', 'Sportswear', '👕', 3),
('إكسسوارات', 'Accessories', '🎒', 4);

-- بيانات أولية: المنتجات
INSERT INTO products (sku, name_ar, description_ar, price, original_price, stock, category_id, brand, is_featured, is_new) VALUES
('GYM-001', 'دمبل قابل للتعديل 20 كجم', 'دمبل احترافي قابل للتعديل من 2 إلى 20 كجم. مثالي للتمارين المنزلية', 899.00, 1200.00, 15, 1, 'PowerGym', 1, 1),
('SUP-001', 'بروتين واي 2 كجم', 'بروتين واي عالي الجودة. 25g بروتين لكل حصة', 450.00, 550.00, 30, 2, 'NutriMax', 1, 0),
('CLO-001', 'قميص رياضي رجالي', 'قميص رياضي مقاوم للعرق ومريح', 129.00, NULL, 50, 3, 'SportLine', 0, 1),
('ACC-001', 'حقيبة رياضية 40 لتر', 'حقيبة رياضية مقاومة للماء بتصميم عصري', 199.00, 250.00, 25, 4, 'BagPro', 0, 0);
