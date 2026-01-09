// translations.js
// ============================================
// إعدادات الـ API و R2
// ============================================

const OriFitConfig = {
  // رابط الـ Worker (الـ API)
  WORKER_URL: 'https://orifit-store.ori00fit.workers.dev',
  
  // رابط R2 لتحميل الصور
  // تأكد من أن الـ R2 مفتوح للعموم أو له domain مخصص
  R2_PUBLIC_URL: 'https://orifit-images.ori00fit.workers.dev',
  
  // اللغة الافتراضية
  DEFAULT_LANGUAGE: 'ar'
};

// ============================================
// قاموس الترجمات
// ============================================

const translations = {
  ar: {
    // العناوين والكلمات الأساسية
    app_title: 'متجر OriFit',
    home: 'الرئيسية',
    cart: 'السلة',
    orders: 'الطلبات',
    tracking: 'التتبع',
    admin: 'الإدارة',
    
    // الأزرار
    buy_now: 'شراء الآن',
    add_to_cart: 'أضف للسلة',
    view_details: 'عرض التفاصيل',
    checkout: 'إتمام الشراء',
    place_order: 'تأكيد الطلب',
    continue_shopping: 'متابعة التسوق',
    update_cart: 'تحديث السلة',
    search: 'بحث',
    
    // المنتج
    price: 'السعر',
    in_stock: 'متوفر في المخزون',
    out_of_stock: 'غير متوفر',
    quantity: 'الكمية',
    discount: 'خصم',
    original_price: 'السعر الأصلي',
    total_price: 'السعر الإجمالي',
    
    // السلة
    your_cart: 'سلتك',
    cart_empty: 'السلة فارغة',
    subtotal: 'المجموع الفرعي',
    shipping: 'الشحن',
    total: 'الإجمالي',
    
    // الطلب
    order_details: 'تفاصيل الطلب',
    full_name: 'الاسم الكامل',
    phone_number: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    address: 'العنوان',
    city: 'المدينة',
    postal_code: 'الرمز البريدي',
    payment_method: 'طريقة الدفع',
    cash_on_delivery: 'الدفع عند الاستلام',
    online_payment: 'الدفع أونلاين',
    notes: 'ملاحظات إضافية',
    
    // الحالات
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'نجح',
    warning: 'تنبيه',
    no_products: 'لا توجد منتجات',
    
    // الرسائل
    added_to_cart: 'تمت الإضافة إلى السلة',
    product_not_found: 'المنتج غير موجود',
    order_created: 'تم إنشاء الطلب بنجاح',
    order_id: 'رقم الطلب',
    tracking_id: 'رقم التتبع',
    
    // Footer
    free_shipping: 'شحن مجاني فوق 500 د.م.',
    original_products: 'منتجات أصلية 100%',
    fast_delivery: 'توصيل سريع 2-5 أيام',
    cash_payment: 'الدفع عند الاستلام',
    about_us: 'من نحن',
    privacy_policy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
    return_policy: 'سياسة الإرجاع',
    contact_us: 'اتصل بنا',
  },
  
  en: {
    app_title: 'OriFit Store',
    home: 'Home',
    cart: 'Cart',
    orders: 'Orders',
    tracking: 'Tracking',
    admin: 'Admin',
    
    buy_now: 'Buy Now',
    add_to_cart: 'Add to Cart',
    view_details: 'View Details',
    checkout: 'Checkout',
    place_order: 'Place Order',
    continue_shopping: 'Continue Shopping',
    update_cart: 'Update Cart',
    search: 'Search',
    
    price: 'Price',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    quantity: 'Quantity',
    discount: 'Discount',
    original_price: 'Original Price',
    total_price: 'Total Price',
    
    your_cart: 'Your Cart',
    cart_empty: 'Your cart is empty',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    
    order_details: 'Order Details',
    full_name: 'Full Name',
    phone_number: 'Phone Number',
    email: 'Email',
    address: 'Address',
    city: 'City',
    postal_code: 'Postal Code',
    payment_method: 'Payment Method',
    cash_on_delivery: 'Cash on Delivery',
    online_payment: 'Online Payment',
    notes: 'Additional Notes',
    
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    no_products: 'No products found',
    
    added_to_cart: 'Added to cart',
    product_not_found: 'Product not found',
    order_created: 'Order created successfully',
    order_id: 'Order ID',
    tracking_id: 'Tracking ID',
    
    free_shipping: 'Free shipping over $50',
    original_products: '100% Original Products',
    fast_delivery: 'Fast Delivery 2-5 days',
    cash_payment: 'Cash on Delivery',
    about_us: 'About Us',
    privacy_policy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    return_policy: 'Return Policy',
    contact_us: 'Contact Us',
  }
};

// ============================================
// دوال مساعدة
// ============================================

/**
 * الحصول على اللغة الحالية من localStorage
 */
function getCurrentLanguage() {
  const stored = localStorage.getItem('orifit_language');
  if (stored === 'ar' || stored === 'en') return stored;
  return OriFitConfig.DEFAULT_LANGUAGE;
}

/**
 * تعيين اللغة الجديدة
 */
function setLanguage(lang) {
  if (lang === 'ar' || lang === 'en') {
    localStorage.setItem('orifit_language', lang);
    window.location.reload(); // إعادة تحميل لتطبيق اللغة
  }
}

/**
 * الحصول على ترجمة نص معين
 * @param {string} key - مفتاح النص
 * @returns {string} النص المترجم
 */
function t(key) {
  const lang = getCurrentLanguage();
  const dict = translations[lang] || translations['ar'];
  return dict[key] || key; // إذا لم يوجد، أرجع المفتاح نفسه
}

/**
 * تنسيق السعر بصيغة عملة مغربية
 * @param {number} price - السعر
 * @returns {string} السعر المنسق
 */
function formatPrice(price) {
  return new Intl.NumberFormat('ar-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
}

/**
 * الحصول على رابط الصورة من R2
 * @param {string} imageKey - مفتاح الصورة (اسم الملف)
 * @returns {string} رابط الصورة الكامل
 */
function getImageUrl(imageKey) {
  if (!imageKey) {
    // صورة افتراضية إذا لم تكن هناك صورة
    return 'https://via.placeholder.com/300x250?text=OriFit+Product';
  }
  
  // إذا كان الرابط كاملاً بالفعل (URL)
  if (imageKey.startsWith('http')) {
    return imageKey;
  }
  
  // بناء الرابط من R2
  return `${OriFitConfig.R2_PUBLIC_URL}/${imageKey}`;
}

/**
 * حساب نسبة الخصم
 * @param {number} originalPrice - السعر الأصلي
 * @param {number} currentPrice - السعر الحالي
 * @returns {number} نسبة الخصم
 */
function calculateDiscount(originalPrice, currentPrice) {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
}

/**
 * عرض إشعار (Toast) للمستخدم
 * @param {string} message - الرسالة
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 * @param {number} duration - مدة الظهور بالميلي ثانية
 */
function showToast(message, type = 'info', duration = 3000) {
  // إنشاء عنصر Toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // تعريف الألوان حسب النوع
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };
  
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    animation: slideInUp 0.3s ease-out;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  // إضافة أنيميشن
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInUp {
      from {
        transform: translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // إضافة Toast للصفحة
  document.body.appendChild(toast);
  
  // إزالة Toast بعد المدة المحددة
  setTimeout(() => {
    toast.style.animation = 'slideInUp 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * تحويل تاريخ إلى صيغة مقروءة
 * @param {string} dateString - تاريخ ISO
 * @returns {string} التاريخ بصيغة مقروءة
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} هل البريد صحيح
 */
function isValidEmail(email) {
  const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف المغربي
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} هل الرقم صحيح
 */
function isValidPhoneNumber(phone) {
  // أرقام مغربية عادة تبدأ بـ 06 أو 07 أو 212 وتكون 10 أرقام
  const phoneRegex = /^(+212|0)[67]d{8}$/;
  return phoneRegex.test(phone.replace(/s/g, ''));
}

/**
 * حفظ البيانات في localStorage بصيغة JSON
 * @param {string} key - المفتاح
 * @param {any} data - البيانات
 */
function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    showToast('خطأ في حفظ البيانات', 'error');
  }
}

/**
 * استرجاع البيانات من localStorage
 * @param {string} key - المفتاح
 * @param {any} defaultValue - القيمة الافتراضية
 * @returns {any} البيانات
 */
function getFromLocalStorage(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * حساب إجمالي السلة
 * @param {array} cart - مصفوفة السلة
 * @returns {object} الإجمالي والتفاصيل
 */
function calculateCartTotal(cart) {
  if (!Array.isArray(cart)) return { subtotal: 0, shipping: 0, total: 0, itemCount: 0 };
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // حساب الشحن (مثلاً: مجاني فوق 500)
  const shipping = subtotal >= 500 ? 0 : 50;
  
  const total = subtotal + shipping;
  
  return { subtotal, shipping, total, itemCount };
}

/**
 * تنسيق رقم الهاتف للعرض
 * @param {string} phone - رقم الهاتف
 * @returns {string} الرقم المنسق
 */
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  return phone;
}

/**
 * إنشاء معرّف فريد (UUID مبسط)
 * @returns {string} معرّف فريد
 */
function generateUniqueId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * تأخير التنفيذ (للـ async)
 * @param {number} ms - الميلي ثانية
 * @returns {Promise}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
