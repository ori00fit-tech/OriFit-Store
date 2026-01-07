// translations.js

// **1. قم بتحديث هذا الرابط برابط Worker الخاص بك (الذي يظهر في الصورة الأخيرة)**
const WORKER_URL = 'https://orifit-worker.ori00fit.workers.dev'; 

// **2. قم بتحديث هذا الرابط برابط R2 Public URL الخاص بك**
// إذا لم يكن لديك الرابط العام، يجب أن تجلبه من إعدادات R2 Buckets
const R2_PUBLIC_URL = 'https://c96f59a4c839c1a81ece83aa4bb8269e.r2.cloudflarestorage.com/orifit-images'; // (يجب استبدال هذا بالرابط الحقيقي)

// لغات التطبيق (للتجربة حالياً، يمكنك إضافة المزيد لاحقاً)
const translations = {
    ar: {
        title: "متجر OriFit - الرئيسية",
        product_title: "أفضل منتجات اللياقة",
        buy_button: "شراء الآن",
        // ... يمكنك إضافة جميع النصوص التي تحتاجها هنا
    },
    en: {
        title: "OriFit Store - Home",
        product_title: "Top Fitness Products",
        buy_button: "Buy Now",
    }
};

// الدالة الأساسية لجلب النصوص (لا حاجة لتعديلها حالياً)
const getTranslation = (key) => {
    const lang = localStorage.getItem('language') || 'ar';
    return translations[lang][key] || key;
};
