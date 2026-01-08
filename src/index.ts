import { Hono } from 'hono';
import { cors } from 'hono/cors';

// تعريف البيئة مع الـ Bindings
interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ADMIN_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// إعدادات CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ============ واجهة برمجية للمنتجات ============

// جلب جميع المنتجات مع الفلترة
app.get('/api/products', async (c) => {
  try {
    const { category, featured, search } = c.req.query();
    
    let query = 'SELECT * FROM products WHERE is_available = 1';
    const params: any[] = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (featured === 'true') {
      query += ' AND is_featured = 1';
    }
    
    if (search) {
      query += ' AND (name_ar LIKE ? OR description_ar LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    return c.json({ success: false, error: 'فشل جلب المنتجات' }, 500);
  }
});

// جلب منتج واحد بالتفصيل
app.get('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ? AND is_available = 1'
    ).bind(id).all();
    
    if (results.length === 0) {
      return c.json({ success: false, error: 'المنتج غير موجود' }, 404);
    }
    
    return c.json({ success: true, data: results[0] });
  } catch (error) {
    return c.json({ success: false, error: 'فشل جلب المنتج' }, 500);
  }
});

// جلب الفئات
app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY display_order ASC'
    ).all();
    
    return c.json({ success: true, data: results });
  } catch (error) {
    return c.json({ success: false, error: 'فشل جلب الفئات' }, 500);
  }
});

// ============ واجهة برمجية للطلبات ============

// إنشاء طلب جديد
app.post('/api/order', async (c) => {
  try {
    const body = await c.req.json();
    const { customer, items, shipping_cost = 0, notes } = body;
    
    // التحقق من البيانات
    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city) {
      return c.json({ success: false, error: 'البيانات غير مكتملة' }, 400);
    }
    
    if (!items || items.length === 0) {
      return c.json({ success: false, error: 'السلة فارغة' }, 400);
    }
    
    // إنشاء Order ID فريد
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // حساب المجموع
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.price;
    }
    totalAmount += shipping_cost;
    
    // إدراج الطلب
    await c.env.DB.prepare(`
      INSERT INTO orders (order_id, customer_name, phone, email, address, city, 
                         postal_code, total_amount, shipping_cost, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      customer.name,
      customer.phone,
      customer.email || null,
      customer.address,
      customer.city,
      customer.postal_code || null,
      totalAmount,
      shipping_cost,
      customer.payment_method || 'عند الاستلام',
      notes || null
    ).run();
    
    // إدراج تفاصيل الطلب
    for (const item of items) {
      await c.env.DB.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        orderId,
        item.id,
        item.name,
        item.quantity,
        item.price,
        item.quantity * item.price
      ).run();
      
      // تحديث المخزون
      await c.env.DB.prepare(`
        UPDATE products SET stock = stock - ? WHERE id = ?
      `).bind(item.quantity, item.id).run();
    }
    
    // حفظ/تحديث بيانات العميل
    await c.env.DB.prepare(`
      INSERT INTO customers (name, phone, email, total_orders, total_spent)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(phone) DO UPDATE SET
        total_orders = total_orders + 1,
        total_spent = total_spent + ?
    `).bind(
      customer.name,
      customer.phone,
      customer.email || null,
      totalAmount,
      totalAmount
    ).run();
    
    return c.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      order_id: orderId,
      total: totalAmount
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    return c.json({ success: false, error: 'فشل إنشاء الطلب' }, 500);
  }
});

// تتبع الطلب
app.get('/api/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    // جلب بيانات الطلب
    const { results: orderResults } = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE order_id = ?'
    ).bind(orderId).all();
    
    if (orderResults.length === 0) {
      return c.json({ success: false, error: 'الطلب غير موجود' }, 404);
    }
    
    // جلب تفاصيل المنتجات
    const { results: itemResults } = await c.env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    ).bind(orderId).all();
    
    return c.json({
      success: true,
      data: {
        order: orderResults[0],
        items: itemResults
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'فشل جلب الطلب' }, 500);
  }
});

// ============ واجهة إدارية (محمية) ============

// Middleware للتحقق من صلاحية الإدارة
const adminAuth = async (c: any, next: any) => {
  const apiKey = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!apiKey || apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ success: false, error: 'غير مصرّح' }, 401);
  }
  
  await next();
};

// جلب جميع الطلبات (للإدارة)
app.get('/api/admin/orders', adminAuth, async (c) => {
  try {
    const { status } = c.req.query();
    
    let query = 'SELECT * FROM orders';
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({ success: true, data: results });
  } catch (error) {
    return c.json({ success: false, error: 'فشل جلب الطلبات' }, 500);
  }
});

// تحديث حالة الطلب
app.put('/api/admin/orders/:orderId', adminAuth, async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();
    
    await c.env.DB.prepare(
      'UPDATE orders SET status = ?, updated_at = datetime("now") WHERE order_id = ?'
    ).bind(status, orderId).run();
    
    return c.json({ success: true, message: 'تم تحديث الحالة' });
  } catch (error) {
    return c.json({ success: false, error: 'فشل التحديث' }, 500);
  }
});

// إضافة منتج جديد
app.post('/api/admin/products', adminAuth, async (c) => {
  try {
    const product = await c.req.json();
    
    const result = await c.env.DB.prepare(`
      INSERT INTO products (name_ar, name_en, description_ar, description_en, 
                           price, original_price, stock, image_key, category, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      product.name_ar,
      product.name_en || null,
      product.description_ar,
      product.description_en || null,
      product.price,
      product.original_price || null,
      product.stock || 0,
      product.image_key || null,
      product.category || 'عام',
      product.is_featured ? 1 : 0
    ).run();
    
    return c.json({ 
      success: true, 
      message: 'تم إضافة المنتج',
      id: result.meta.last_row_id 
    });
  } catch (error) {
    return c.json({ success: false, error: 'فشل إضافة المنتج' }, 500);
  }
});

// إحصائيات Dashboard
app.get('/api/admin/stats', adminAuth, async (c) => {
  try {
    const stats = await c.env.DB.batch([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM orders'),
      c.env.DB.prepare('SELECT SUM(total_amount) as total FROM orders WHERE status != "ملغي"'),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE stock > 0'),
      c.env.DB.prepare('SELECT COUNT(*) as count FROM customers')
    ]);
    
    return c.json({
      success: true,
      data: {
        total_orders: stats[0].results[0].count,
        total_revenue: stats[1].results[0].total || 0,
        available_products: stats[2].results[0].count,
        total_customers: stats[3].results[0].count
      }
    });
  } catch (error) {
    return c.json({ success: false, error: 'فشل جلب الإحصائيات' }, 500);
  }
});

// ============ رفع الصور إلى R2 ============
app.post('/api/upload', adminAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: 'لم يتم رفع ملف' }, 400);
    }
    
    const fileName = `products/${Date.now()}-${file.name}`;
    await c.env.R2_BUCKET.put(fileName, file.stream(), {
      httpMetadata: { contentType: file.type }
    });
    
    return c.json({
      success: true,
      image_key: fileName,
      message: 'تم رفع الصورة بنجاح'
    });
  } catch (error) {
    return c.json({ success: false, error: 'فشل رفع الصورة' }, 500);
  }
});

export default app;
