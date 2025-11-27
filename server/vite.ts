import type { ViteDevServer } from 'vite';
import app from './index';

export async function setupViteProxy(viteServer: ViteDevServer) {
  app.use(viteServer.middlewares);
  
  // API routes
  const server = app.listen(5000, '0.0.0.0', () => {
    console.log('Express server running on http://0.0.0.0:5000');
  });

  return server;
}

export default app;
