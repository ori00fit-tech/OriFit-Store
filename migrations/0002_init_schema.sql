-- جدول المنتجات مع معلومات إضافية
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description_ar TEXT NOT NULL,
    description_en TEXT,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER DEFAULT 0,
    image_key TEXT,
    category TEXT DEFAULT 'عام',
    rating REAL DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    is_available BOOLEAN DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
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

CREATE TABLE IF NOT EXISTS order_items (
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

CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    icon TEXT,
    display_order INTEGER DEFAULT 0
);

INSERT INTO categories (name_ar, name_en, icon) VALUES
('أجهزة رياضية', 'Equipment', '🏋️'),
('مكملات غذائية', 'Supplements', '💊'),
('ملابس رياضية', 'Sportswear', '👕'),
('إكسسوارات', 'Accessories', '🎒');

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(phone);
CREATE INDEX idx_order_items_order ON order_items(order_id);
