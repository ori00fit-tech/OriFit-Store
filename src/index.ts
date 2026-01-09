interface Product {
  id: number;
  name_ar: string;
  price: number;
  stock: number;
}

interface Customer {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

interface Order {
  id?: string;
  tracking_id: string;
  customer: Customer;
  items: any[];
  payment_method: string;
  total_amount: number;
  shipping_cost: number;
}

function generateTrackingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORIFIT-${timestamp}-${random}`;
}

function generateOrderId(): string {
  return 'ORD-' + Date.now();
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function successResponse(data: any): Response {
  return jsonResponse({ success: true, data });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}

async function queryDB(db: any, sql: string, params: any[] = []): Promise<any> {
  try {
    const stmt = db.prepare(sql);
    const result = params.length > 0 ? stmt.bind(...params).all() : stmt.all();
    return result;
  } catch (error: any) {
    console.error('DB Error:', error.message);
    throw error;
  }
}

async function getProductById(db: any, id: number): Promise<Product | null> {
  const result = await queryDB(db, 'SELECT * FROM products WHERE id = ?', [id]);
  const products = result.results || [];
  return products.length > 0 ? products[0] : null;
}

async function getProducts(db: any, categoryId?: number, limit = 20, offset = 0): Promise<Product[]> {
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (categoryId) {
    sql += ' AND category_id = ?';
    params.push(categoryId);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await queryDB(db, sql, params);
  return result.results || [];
}

async function createOrder(db: any, order: Order): Promise<Order> {
  const orderId = generateOrderId();
  const trackingId = generateTrackingId();
  const customerJson = JSON.stringify(order.customer);
  const itemsJson = JSON.stringify(order.items);

  const sql = `INSERT INTO orders (id, tracking_id, customer_data, items, payment_method, notes, total_amount, shipping_cost, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`;

  await queryDB(db, sql, [orderId, trackingId, customerJson, itemsJson, order.payment_method, order.notes || '', order.total_amount, order.shipping_cost]);

  for (const item of order.items) {
    await queryDB(db, 'UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
  }

  return { ...order, id: orderId, tracking_id: trackingId, status: 'pending' };
}

async function getOrder(db: any, searchTerm: string): Promise<any> {
  const sql = `SELECT * FROM orders WHERE id = ? OR tracking_id = ? LIMIT 1`;
  const result = await queryDB(db, sql, [searchTerm, searchTerm]);
  const orders = result.results || [];

  if (orders.length === 0) return null;

  const order = orders[0];
  const customer = JSON.parse(order.customer_data || '{}');
  const items = JSON.parse(order.items || '[]');

  const itemsWithNames = await Promise.all(items.map(async (item: any) => {
    const product = await getProductById(db, item.product_id);
    return { ...item, product_name: product?.name_ar || 'المنتج' };
  }));

  return {
    id: order.id,
    tracking_id: order.tracking_id,
    customer_name: `${customer.first_name} ${customer.last_name}`,
    customer_phone: customer.phone,
    customer_address: customer.address,
    customer_city: customer.city,
    items: itemsWithNames,
    payment_method: order.payment_method,
    total_amount: order.total_amount,
    status: order.status,
  };
}

async function handleRequest(request: Request, env: any): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    if (method === 'GET' && pathname === '/api/products') {
      const categoryId = url.searchParams.get('category_id');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const products = await getProducts(env.DB, categoryId ? parseInt(categoryId) : undefined, limit, offset);
      return successResponse(products);
    }

    if (method === 'GET' && pathname.startsWith('/api/products/')) {
      const id = parseInt(pathname.replace('/api/products/', ''));
      if (isNaN(id)) return errorResponse('معرّف غير صحيح', 400);
      const product = await getProductById(env.DB, id);
      if (!product) return errorResponse('المنتج غير موجود', 404);
      return successResponse(product);
    }

    if (method === 'GET' && pathname === '/api/categories') {
      const result = await queryDB(env.DB, 'SELECT * FROM categories ORDER BY name_ar ASC');
      return successResponse(result.results || []);
    }

    if (method === 'GET' && pathname === '/api/health') {
      try {
        await queryDB(env.DB, 'SELECT 1');
        return successResponse({ status: 'healthy', timestamp: new Date().toISOString(), database: 'connected' });
      } catch {
        return errorResponse('Database connection failed', 500);
      }
    }

    if (method === 'POST' && pathname === '/api/orders') {
      const orderData: Order = await request.json();
      if (!orderData.customer || !orderData.items || orderData.items.length === 0) {
        return errorResponse('بيانات الطلب غير كاملة', 400);
      }

      for (const item of orderData.items) {
        const product = await getProductById(env.DB, item.product_id);
        if (!product) return errorResponse(`المنتج برقم ${item.product_id} غير موجود`, 404);
        if (product.stock < item.quantity) return errorResponse(`المنتج لا يتوفر بالكمية المطلوبة`, 400);
      }

      const newOrder = await createOrder(env.DB, orderData);
      return successResponse(newOrder);
    }

    if (method === 'GET' && pathname === '/api/orders/track') {
      const searchTerm = url.searchParams.get('id');
      if (!searchTerm) return errorResponse('يجب توفير رقم البحث', 400);
      const order = await getOrder(env.DB, searchTerm);
      if (!order) return errorResponse('الطلب غير موجود', 404);
      return successResponse(order);
    }

    return errorResponse('الـ endpoint غير موجود', 404);
  } catch (error: any) {
    console.error('Error:', error);
    return errorResponse('خطأ في معالجة الطلب', 500);
  }
}

export default { fetch: (request: Request, env: any) => handleRequest(request, env) };
