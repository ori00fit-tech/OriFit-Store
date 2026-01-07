// Worker API لمتجر OriFit (src/index.ts)
interface Env {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // تفعيل CORS للسماح للـ Frontend بالاتصال
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json;charset=UTF-8',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers });
        }

        try {
            switch (path) {
                case '/api/products':
                    // 🛍️ استرجاع جميع المنتجات مع صورها
                    if (request.method === 'GET') {
                        const { results } = await env.DB.prepare(
                            `SELECT 
                                p.*, 
                                GROUP_CONCAT(pi.image_url) AS image_urls
                             FROM products p
                             LEFT JOIN product_images pi ON p.id = pi.product_id
                             GROUP BY p.id`
                        ).all();
                        return new Response(JSON.stringify(results), { status: 200, headers });
                    }
                    break;

                case '/api/order':
                    // 🛒 حفظ طلب جديد
                    if (request.method === 'POST') {
                        const data = await request.json() as any;
                        
                        if (!data.customer_name || !data.phone || !data.items || data.items.length === 0) {
                             return new Response(JSON.stringify({ error: "البيانات الأساسية للطلب ناقصة." }), { status: 400, headers });
                        }
                        
                        // إدخال الطلب الرئيسي
                        const orderResult = await env.DB.prepare(`
                            INSERT INTO orders (customer_name, phone, city, address, payment_method, language) 
                            VALUES (?, ?, ?, ?, ?, ?)
                        `).bind(data.customer_name, data.phone, data.city, data.address, data.payment_method, data.language || 'ar')
                        .run();
                        
                        const orderId = orderResult.meta.last_row_id;
                        
                        // إدخال تفاصيل الطلب
                        const itemInserts = data.items.map((item: any) => 
                            env.DB.prepare(`
                                INSERT INTO order_items (order_id, product_id, size, color, quantity) 
                                VALUES (?, ?, ?, ?, ?)
                            `).bind(orderId, item.product_id, item.size, item.color, item.quantity)
                        );
                        
                        await env.DB.batch(itemInserts);
                        
                        return new Response(JSON.stringify({ message: 'تم استلام طلبك بنجاح.', order_id: orderId }), { status: 201, headers });
                    }
                    break;
                
                case '/api/track':
                    // 🚚 تتبع الطلب
                    if (request.method === 'GET') {
                        const orderId = url.searchParams.get('order_id');
                        if (!orderId) {
                            return new Response(JSON.stringify({ error: 'الرجاء إدخال رقم الطلب.' }), { status: 400, headers });
                        }

                        const { results } = await env.DB.prepare('SELECT status, created_at FROM orders WHERE id = ?').bind(orderId).all();
                        
                        if (results.length === 0) {
                            return new Response(JSON.stringify({ error: 'لم يتم العثور على طلب بهذا الرقم.' }), { status: 404, headers });
                        }
                        
                        return new Response(JSON.stringify(results[0]), { status: 200, headers });
                    }
                    break;

                default:
                    return new Response(JSON.stringify({ message: "404 - المسار غير موجود" }), { status: 404, headers });
            }
        } catch (error) {
            console.error(error);
            return new Response(
                JSON.stringify({ 
                    error: 'خطأ داخلي في الخادم',
                    details: error instanceof Error ? error.message : 'غير معروف'
                }), 
                { status: 500, headers }
            );
        }

        return new Response(JSON.stringify({ message: "غير مدعوم" }), { status: 405, headers });
    },
};
