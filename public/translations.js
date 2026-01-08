// ⚠️ استبدل هذه القيم بالروابط الحقيقية بعد النشر
const CONFIG = {
  WORKER_URL: 'https://orifit-store.your-account.workers.dev', // ⬅️ رابط الـ Worker
  R2_PUBLIC_URL: 'https://pub-xxxxx.r2.dev', // ⬅️ رابط R2 العام
  CURRENCY: {
    code: 'MAD',
    symbol: 'د.م.',
    symbolPosition: 'after', // before أو after
    decimalSeparator: ',',
    thousandSeparator: '.',
    decimals: 2
  },
  SHIPPING: {
    freeShippingThreshold: 500, // شحن مجاني فوق 500 درهم
    defaultShippingCost: 30,
    expressCost: 50
  },
  CITIES_MOROCCO: [
    'الرباط', 'الدار البيضاء', 'فاس', 'مراكش', 'طنجة', 
    'أكادير', 'مكناس', 'وجدة', 'القنيطرة', 'تطوان',
    'الصويرة', 'العيون', 'الجديدة', 'بني ملال', 'المحمدية'
  ]
};

// دالة تنسيق العملة
function formatPrice(price) {
  const formatted = price.toFixed(CONFIG.CURRENCY.decimals)
    .replace('.', CONFIG.CURRENCY.decimalSeparator)
    .replace(/B(?=(d{3})+(?!d))/g, CONFIG.CURRENCY.thousandSeparator);
  
  return CONFIG.CURRENCY.symbolPosition === 'before' 
    ? `${CONFIG.CURRENCY.symbol} ${formatted}`
    : `${formatted} ${CONFIG.CURRENCY.symbol}`;
}

// دالة حساب تكلفة الشحن
function calculateShipping(total, city = '') {
  if (total >= CONFIG.SHIPPING.freeShippingThreshold) {
    return 0;
  }
  
  // مدن كبرى - شحن عادي، مدن أخرى - شحن أعلى
  const majorCities = ['الرباط', 'الدار البيضاء', 'فاس', 'مراكش', 'طنجة'];
  return majorCities.includes(city) 
    ? CONFIG.SHIPPING.defaultShippingCost 
    : CONFIG.SHIPPING.expressCost;
}

// نصوص الترجمة
const translations = {
  storeName: 'متجر OriFit',
  slogan: 'منتجات اللياقة البدنية الأصلية',
  cart: 'سلة التسوق',
  checkout: 'إتمام الطلب',
  addToCart: 'أضف للسلة',
  buyNow: 'اشتر الآن',
  price: 'السعر',
  stock: 'المخزون',
  available: 'متوفر',
  outOfStock: 'نفذت الكمية',
  freeShipping: 'شحن مجاني',
  shippingCost: 'تكلفة الشحن',
  total: 'المجموع',
  subtotal: 'المجموع الفرعي',
  orderNow: 'اطلب الآن',
  orderPlaced: 'تم تقديم طلبك بنجاح',
  orderNumber: 'رقم الطلب',
  trackOrder: 'تتبع الطلب',
  paymentMethods: {
    cod: 'الدفع عند الاستلام',
    card: 'بطاقة ائتمان',
    transfer: 'تحويل بنكي'
  },
  orderStatus: {
    'قيد المراجعة': 'قيد المراجعة',
    'جاري التحضير': 'جاري التحضير',
    'تم الشحن': 'تم الشحن',
    'تم التسليم': 'تم التسليم',
    'ملغي': 'ملغي'
  }
};

// دالة الحصول على رابط الصورة الكامل
function getImageUrl(imageKey) {
  if (!imageKey) return 'https://via.placeholder.com/400x300?text=No+Image';
  return `${CONFIG.R2_PUBLIC_URL}/${imageKey}`;
}

// تصدير للاستخدام العام
window.OriFitConfig = CONFIG;
window.translations = translations;
window.formatPrice = formatPrice;
window.calculateShipping = calculateShipping;
window.getImageUrl = getImageUrl;
