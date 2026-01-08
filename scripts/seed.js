// OriFit Store - Seed Script
// Run: node scripts/seed.js

const products = [
  {
    sku: 'GYM-001',
    name_ar: 'دمبل قابل للتعديل 20 كجم',
    name_en: 'Adjustable Dumbbell 20kg',
    description_ar: 'دمبل احترافي قابل للتعديل من 2 إلى 20 كجم. مثالي للتمارين المنزلية وتقوية العضلات. مصنوع من مواد عالية الجودة ومتين للاستخدام طويل الأمد.',
    price: 899.00,
    original_price: 1200.00,
    stock: 15,
    category_id: 1,
    brand: 'PowerGym',
    is_featured: 1,
    is_new: 1
  },
  {
    sku: 'SUP-001',
    name_ar: 'بروتين واي 2 كجم - نكهة الشوكولاتة',
    name_en: 'Whey Protein 2kg Chocolate',
    description_ar: 'بروتين واي عالي الجودة 100% من مصل الحليب. يحتوي على 25g بروتين لكل حصة. مثالي لبناء العضلات والاستشفاء السريع بعد التمارين.',
    price: 450.00,
    original_price: 550.00,
    stock: 30,
    category_id: 2,
    brand: 'NutriMax',
    is_featured: 1,
    is_trending: 1
  },
  {
    sku: 'CLO-001',
    name_ar: 'قميص رياضي رجالي - Dry Fit',
    name_en: 'Men Sports T-Shirt Dry Fit',
    description_ar: 'قميص رياضي قابل للتنفس مع تقنية Dry Fit. مقاوم للعرق ومريح. مناسب لجميع أنواع الرياضات والتمارين.',
    price: 129.00,
    stock: 50,
    category_id: 3,
    brand: 'SportLine',
    is_new: 1
  },
  {
    sku: 'ACC-001',
    name_ar: 'حقيبة رياضية 40 لتر',
    name_en: 'Sports Gym Bag 40L',
    description_ar: 'حقيبة رياضية متعددة الجيوب بسعة 40 لتر. مقاومة للماء مع تصميم عصري. مثالية للصالة الرياضية والسفر.',
    price: 199.00,
    original_price: 250.00,
    stock: 25,
    category_id: 4,
    brand: 'BagPro'
  },
  {
    sku: 'GYM-002',
    name_ar: 'سجادة يوجا احترافية',
    name_en: 'Professional Yoga Mat',
    description_ar: 'سجادة يوجا سميكة 6 مم مع سطح غير قابل للانزلاق. مثالية للياقة البدنية واليوجا والتمدد.',
    price: 149.00,
    stock: 40,
    category_id: 1,
    brand: 'YogaPro',
    is_featured: 1
  },
  {
    sku: 'SUP-002',
    name_ar: 'كرياتين مونوهيدرات 300 جرام',
    name_en: 'Creatine Monohydrate 300g',
    description_ar: 'كرياتين نقي 100% لزيادة القوة والكتلة العضلية. سريع الامتصاص ومثبت علمياً.',
    price: 199.00,
    stock: 35,
    category_id: 2,
    brand: 'MuscleTech',
    is_trending: 1
  },
  {
    sku: 'CLO-002',
    name_ar: 'سروال رياضي نسائي - Leggings',
    name_en: 'Women Sports Leggings',
    description_ar: 'سروال رياضي نسائي مرن ومريح. مصنوع من أقمشة عالية الجودة تسمح بالتنفس.',
    price: 159.00,
    stock: 45,
    category_id: 3,
    brand: 'FitWear'
  },
  {
    sku: 'ACC-002',
    name_ar: 'زجاجة ماء رياضية 1 لتر',
    name_en: 'Sports Water Bottle 1L',
    description_ar: 'زجاجة ماء رياضية خالية من BPA مع غطاء محكم. مثالية للرياضة والاستخدام اليومي.',
    price: 49.00,
    stock: 100,
    category_id: 4,
    brand: 'HydroMax'
  },
  {
    sku: 'GYM-003',
    name_ar: 'حبل قفز احترافي',
    name_en: 'Professional Jump Rope',
    description_ar: 'حبل قفز قابل للتعديل مع مقابض مريحة. ممتاز لتمارين الكارديو وحرق السعرات.',
    price: 79.00,
    original_price: 99.00,
    stock: 60,
    category_id: 1,
    brand: 'FitJump'
  },
  {
    sku: 'SUP-003',
    name_ar: 'مالتي فيتامين يومي - 90 كبسولة',
    name_en: 'Daily Multivitamin 90 Caps',
    description_ar: 'مكمل فيتامينات ومعادن شامل. يدعم الصحة العامة والطاقة اليومية.',
    price: 169.00,
    stock: 50,
    category_id: 2,
    brand: 'VitaHealth'
  }
];

console.log('='.repeat(60));
console.log('OriFit Store - Seed Data');
console.log('='.repeat(60));
console.log('
📦 منتجات تجريبية جاهزة للإدخال:
');

products.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name_ar}`);
  console.log(`   السعر: ${p.price} د.م. | المخزون: ${p.stock}`);
  console.log(`   SKU: ${p.sku}
`);
});

console.log('='.repeat(60));
console.log('
💡 لإضافة هذه المنتجات إلى D1:');
console.log('
1️⃣ افتح Cloudflare Dashboard');
console.log('2️⃣ اذهب إلى D1 Database');
console.log('3️⃣ افتح Console واستخدم الأوامر التالية:
');

products.forEach(p => {
  console.log(`INSERT INTO products (sku, name_ar, name_en, description_ar, price, original_price, stock, category_id, brand, is_featured, is_new, is_trending)
VALUES ('${p.sku}', '${p.name_ar}', '${p.name_en || ''}', '${p.description_ar}', ${p.price}, ${p.original_price || 'NULL'}, ${p.stock}, ${p.category_id}, '${p.brand || ''}', ${p.is_featured || 0}, ${p.is_new || 0}, ${p.is_trending || 0});
`);
});

console.log('='.repeat(60));
console.log('
✅ انتهى! يمكنك الآن نسخ الأوامر أعلاه 🚀
');
