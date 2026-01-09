-- schema.sql
-- ============================================
-- OriFit Store Database Schema
-- ============================================

-- جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  image_key TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description_ar TEXT,
  description_en TEXT,
  price REAL NOT NULL,
  original_price REAL,
  stock INTEGER DEFAULT 0,
  image_key TEXT,
  category_id INTEGER,
  is_new BOOLEAN DEFAULT 0,
  is_featured BOOLEAN DEFAULT 0,
  specifications TEXT, -- JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tracking_id TEXT UNIQUE NOT NULL,
  customer_data TEXT NOT NULL, -- JSON
  items TEXT NOT NULL, -- JSON
  payment_method TEXT NOT NULL, -- 'cod' or 'card'
  notes TEXT,
  total_amount REAL NOT NULL,
  shipping_cost REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الفئات - بيانات افتراضية
INSERT INTO categories (name_ar, name_en, description_ar) VALUES
('مكملات غذائية', 'Supplements', 'مكملات غذائية عالية الجودة'),
('ملابس رياضية', 'Sportswear', 'ملابس رياضية مريحة وعملية'),
('معدات', 'Equipment', 'معدات رياضية احترافية'),
('إكسسوارات', 'Accessories', 'إكسسوارات رياضية متنوعة');

-- جدول المنتجات - بيانات تجريبية
INSERT INTO products (
  name_ar, 
  name_en, 
  description_ar, 
  price, 
  original_price,
  stock, 
  image_key, 
  category_id, 
  is_new,
  is_featured
) VALUES
(
  'بروتين واي Whey Protein',
  'Whey Protein',
  'بروتين واي عالي الجودة لبناء العضلات',
  350,
  450,
  50,
  'whey-protein.jpg',
  1,
  1,
  1
),
(
  'BCAA أحماض أمينية',
  'BCAA Amino Acids',
  'أحماض أمينية متفرعة للتعافي السريع',
  250,
  NULL,
  30,
  'bcaa.jpg',
  1,
  0,
  0
),
(
  'كريتين مونوهيدرات',
  'Creatine Monohydrate',
  'كريتين نقي 100% لتحسين الأداء',
  200,
  280,
  40,
  'creatine.jpg',
  1,
  0,
  1
),
(
  'حزام رفع ساحة',
  'Weight Lifting Belt',
  'حزام رفع احترافي لحماية الظهر',
  480,
  600,
  25,
  'lifting-belt.jpg',
  3,
  0,
  0
),
(
  'قفازات رفع أثقال',
  'Weight Lifting Gloves',
  'قفازات مريحة وآمنة لرفع الأثقال',
  150,
  NULL,
  60,
  'lifting-gloves.jpg',
  3,
  1,
  0
),
(
  'تي شيرت رياضي',
  'Sports T-Shirt',
  'تي شيرت رياضي مصنوع من مادة تمتص العرق',
  120,
  150,
  100,
  'sports-tshirt.jpg',
  2,
  0,
  0
),
(
  'شورت رياضي',
  'Sports Shorts',
  'شورت رياضي مريح وخفيف',
  180,
  NULL,
  80,
  'sports-shorts.jpg',
  2,
  0,
  0
),
(
  'زجاجة ماء 1 لتر',
  'Water Bottle 1L',
  'زجاجة ماء رياضية معزولة',
  220,
  NULL,
  45,
  'water-bottle.jpg',
  4,
  1,
  0
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_tracking ON orders(tracking_id);
CREATE INDEX idx_orders_status ON orders(status);
