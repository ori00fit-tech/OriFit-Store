-- 1. إنشاء جدول المنتجات (products)
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_original TEXT NOT NULL, 
    description_ar TEXT NOT NULL, 
    category TEXT NOT NULL, 
    price_mad REAL NOT NULL, 
    delivery_time TEXT NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. إنشاء جدول صور المنتجات (product_images)
CREATE TABLE product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL, 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. إنشاء جدول الطلبات (orders)
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL, 
    status TEXT DEFAULT 'جديد', 
    language TEXT NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. إنشاء جدول تفاصيل الطلب (order_items)
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 5. بيانات تجريبية (لتشغيل المتجر فوراً)
INSERT INTO products (name_original, description_ar, category, price_mad, delivery_time) VALUES
('Classic Cotton T-Shirt', 'تيشيرت كلاسيكي من القطن الخالص بجودة عالية، مناسب للاستخدام اليومي ومريح جدًا.', 'رجال', 199.00, '7-14 يوم عمل'),
('Elegant Women Dress', 'فستان أنيق للنساء، تصميم عصري ومميز مصنوع من قماش فاخر، متوفر بعدة ألوان.', 'نساء', 450.00, '7-14 يوم عمل');

INSERT INTO product_images (product_id, image_url) VALUES
(1, 't-shirt-men-classic.jpg'),
(2, 'dress-women-elegant.jpg');