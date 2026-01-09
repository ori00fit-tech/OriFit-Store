// src/index.ts
// ============================================
// OriFit Store - Cloudflare Worker API
// ============================================

import { Router } from 'itty-router';

// إنشاء الـ Router
const router = Router();

// ============================================
// Interfaces (أنواع البيانات)
// ============================================

interface Product {
  id: number;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  original_price?: number;
  stock: number;
  image_key?: string;
  category_id: number;
  is_new?: boolean;
  is_featured?: boolean;
  specifications?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
}

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface Order {
  id?: string;
  tracking_id: string;
  customer: Customer;
  items: OrderItem[];
  payment_method: 'cod' | 'card';
  notes?: string;
  total_amount: number;
  shipping_cost: number;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * إنشاء معرّف فريد للطلب
 */
function generateTrackingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORIFIT-${timestamp}-${random}`;
}

/**
 * إنشاء رقم معرّف عشوائي
 */
function generateOrderId(): string {
  return 'ORD-' + Date.now();
}

/**
 * إرسال رد JSON
 */
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * رد الخطأ
 */
function errorResponse(message: string, status = 400): Response {
  return jsonResponse(
    {
      success: false,
      error: message,
    },
    status
  );
}

/**
 * رد النجاح
 */
function successResponse(data: any): Response {
  return jsonResponse({
    success: true,
    data,
  });
}

// ============================================
// Database Helpers
// ============================================

/**
 * تنفيذ استعلام في D1
 */
async function queryDB(db: any, sql: string, params: any[] = []): Promise<any> {
  try {
    const stmt = db.prepare(sql);
    const result = params.length > 0 ? stmt.bind(...params).all() : stmt.all();
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

/**
 * الحصول على قائمة المنتجات
 */
async function getProducts(
  db: any,
  filters: {
    category_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Product[]> {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (filters.category_id) {
    sql += ' AND category_id = ?';
    params.push(filters.category_id);
  }

  if (filters.search) {
    sql += ' AND (name_ar LIKE ? OR name_en LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  sql += ' ORDER BY created_at DESC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters.offset) {
    sql += ' OFFSET ?';
    params.push(filters.offset);
  }

  const result = await queryDB(db, sql, params);
  return result.results || [];
}

/**
 * الحصول على منتج واحد بـ ID
 */
async function getProductById(db: any, id: number): Promise<Product | null> {
  const result = await queryDB(
    db,
    'SELECT * FROM products WHERE id = ?',
    [id]
  );
  const products = result.results || [];
  return products.length > 0 ? products[0] : null;
}

/**
 * إنشاء طلب جديد
 */
async function createOrder(db: any, order: Order): Promise<Order> {
  const orderId = generateOrderId();
  const trackingId = generateTrackingId();

  // تحويل البيانات إلى JSON
  const customerJson = JSON.stringify(order.customer);
  const itemsJson = JSON.stringify(order.items);

  const sql = `
    INSERT INTO orders (
      id,
      tracking_id,
      customer_data,
      items,
      payment_method,
      notes,
      total_amount,
      shipping_cost,
      status,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `;

  await queryDB(db, sql, [
    orderId,
    trackingId,
    customerJson,
    itemsJson,
    order.payment_method,
    order.notes || '',
    order.total_amount,
    order.shipping_cost,
  ]);

  // تحديث المخزون
  for (const item of order.items) {
    await queryDB(
      db,
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [item.quantity, item.product_id]
    );
  }

  return {
    ...order,
    id: orderId,
    tracking_id: trackingId,
    status: 'pending',
  };
}

/**
 * الحصول على الطلب حسب رقم التتبع أو الطلب
 */
async function getOrder(
  db: any,
  searchTerm: string
): Promise<Order | null> {
  const sql = `
    SELECT * FROM orders 
    WHERE id = ? OR tracking_id = ?
    LIMIT 1
  `;

  const result = await queryDB(db, sql, [searchTerm, searchTerm]);
  const orders = result.results || [];

  if (orders.length === 0) return null;

  const order = orders[0];

  // تحويل JSON إلى objects
  const customer = JSON.parse(order.customer_data || '{}');
  const items = JSON.parse(order.items || '[]');

  // جلب أسماء المنتجات
  const itemsWithNames = await Promise.all(
    items.map(async (item: any) => {
      const product = await getProductById(db, item.product_id);
      return {
        ...item,
        product_name: product?.name_ar || 'المنتج',
      };
    })
  );

  return {
    id: order.id,
    tracking_id: order.tracking_id,
    customer,
    items: itemsWithNames,
    payment_method: order.payment_method,
    notes: order.notes,
    total_amount: order.total_amount,
    shipping_cost: order.shipping_cost,
    status: order.status,
    created_at: order.created_at,
  };
}

// ============================================
// API Endpoints
// ============================================

/**
 * GET /api/products
 * الحصول على قائمة المنتجات
 */
router.get('/api/products', async (request, env) => {
  try {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category_id');
    const search = url.searchParams.get('search');
    const limit = url.searchParams.get('limit') || '20';
    const offset = url.searchParams.get('offset') || '0';

    const db = env.DB;

    const products = await getProducts(db, {
      category_id: categoryId ? parseInt(categoryId) : undefined,
      search: search || undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return successResponse(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return errorResponse('خطأ في جلب المنتجات', 500);
  }
});

/**
 * GET /api/products/:id
 * الحصول على منتج واحد
 */
router.get('/api/products/:id', async (request, env) => {
  try {
    const db = env.DB;
    const id = parseInt(request.params.id);

    if (isNaN(id)) {
      return errorResponse('معرّف المنتج غير صحيح', 400);
    }

    const product = await getProductById(db, id);

    if (!product) {
      return errorResponse('المنتج غير موجود', 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return errorResponse('خطأ في جلب المنتج', 500);
  }
});

/**
 * GET /api/categories
 * الحصول على قائمة الفئات
 */
router.get('/api/categories', async (request, env) => {
  try {
    const db = env.DB;
    const result = await queryDB(
      db,
      'SELECT * FROM categories ORDER BY name_ar ASC'
    );

    return successResponse(result.results || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('خطأ في جلب الفئات', 500);
  }
});

/**
 * POST /api/orders
 * إنشاء طلب جديد
 */
router.post('/api/orders', async (request, env) => {
  try {
    const db = env.DB;

    // قراءة البيانات من الـ request
    const orderData: Order = await request.json();

    // التحقق من البيانات المطلوبة
    if (!orderData.customer || !orderData.items || orderData.items.length === 0) {
      return errorResponse('بيانات الطلب غير كاملة', 400);
    }

    if (!orderData.customer.first_name || !orderData.customer.email) {
      return errorResponse('بيانات العميل غير كاملة', 400);
    }

    // التحقق من توفر المنتجات
    for (const item of orderData.items) {
      const product = await getProductById(db, item.product_id);

      if (!product) {
        return errorResponse(`المنتج برقم ${item.product_id} غير موجود`, 404);
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          `المنتج "${product.name_ar}" لا يتوفر بالكمية المطلوبة`,
          400
        );
      }
    }

    // إنشاء الطلب
    const newOrder = await createOrder(db, orderData);

    // إرسال بريد تأكيد (اختياري - يمكن إضافته لاحقاً)
    // await sendConfirmationEmail(newOrder);

    return successResponse(newOrder, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return errorResponse('خطأ في إنشاء الطلب', 500);
  }
});

/**
 * GET /api/orders/track
 * البحث عن الطلب للتتبع
 */
router.get('/api/orders/track', async (request, env) => {
  try {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('id');

    if (!searchTerm) {
      return errorResponse('يجب توفير رقم البحث', 400);
    }

    const db = env.DB;
    const order = await getOrder(db, searchTerm);

    if (!order) {
      return errorResponse('الطلب غير موجود', 404);
    }

    // تحويل البيانات للعرض
    const displayOrder = {
      id: order.id,
      tracking_id: order.tracking_id,
      customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
      customer_phone: order.customer.phone,
      customer_address: order.customer.address,
      customer_city: order.customer.city,
      items: order.items,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
    };

    return successResponse(displayOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    return errorResponse('خطأ في البحث عن الطلب', 500);
  }
});

/**
 * GET /api/health
 * فحص صحة الـ API
 */
router.get('/api/health', async (request, env) => {
  try {
    const db = env.DB;

    // اختبار الاتصال بقاعدة البيانات
    await queryDB(db, 'SELECT 1');

    return successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return errorResponse('Database connection failed', 500);
  }
});

/**
 * OPTIONS - CORS preflight
 */
router.options('*', (request) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
});

/**
 * 404 - Not Found
 */
router.all('*', () => {
  return errorResponse('الـ endpoint غير موجود', 404);
});

// ============================================
// Export Handler
// ============================================

export default router;
