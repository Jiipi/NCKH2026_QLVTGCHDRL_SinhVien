/**
 * CRA Proxy Setup
 * Proxy /uploads requests to backend to avoid CORS/mixed-content issues
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Detect Docker environment - check if running in container
  // In Docker, we need to use the service name 'backend-dev' instead of 'localhost'
  const isDocker = process.env.DOCKER === '1' || 
                   require('fs').existsSync('/.dockerenv') ||
                   (process.env.HOSTNAME && process.env.HOSTNAME.length === 12); // Docker container IDs
  
  // Use backend-dev service name in Docker, localhost otherwise
  const backendUrl = process.env.REACT_APP_API_URL || 
                     (isDocker ? 'http://backend-dev:3001' : 'http://localhost:3001');
  
  console.log(`[setupProxy] Using backend URL: ${backendUrl} (isDocker: ${isDocker})`);
  
  // Proxy /uploads to backend
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      logLevel: 'warn',
      onError: (err, req, res) => {
        console.error('[Proxy /uploads] Error:', err.message, `(target: ${backendUrl})`);
        // Return 404 instead of 500 for missing files
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      },
      onProxyRes: (proxyRes, req, _res) => {
        // Log non-200 responses for debugging
        if (proxyRes.statusCode !== 200) {
          console.warn(`[Proxy /uploads] ${req.url} returned ${proxyRes.statusCode}`);
        }
      }
    })
  );
};
