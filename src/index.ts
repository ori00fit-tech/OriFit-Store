import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  ADMIN_API_KEY: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type','Authorization'],
}));

// --- API Routes ---
app.get('/api/products', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM products').all();
  return c.json({ success: true, data: results });
});

// ... باقي API اللي عندك هنا ...

// --- Serve static files from R2 ---
app.get('/*', async (c) => {
  if (c.req.path.startsWith('/api')) return c.next();

  // determine file
  let filePath = c.req.path === '/' ? 'index.html' : c.req.path.slice(1);
  const object = await c.env.R2_BUCKET.get(filePath);

  if (!object) return c.text('404 Not Found', 404);

  // content type
  const contentType = filePath.endsWith('.css') ? 'text/css' :
                      filePath.endsWith('.js') ? 'application/javascript' :
                      'text/html';

  return new Response(await object.text(), {
    headers: { 'Content-Type': contentType }
  });
});

export default app;
