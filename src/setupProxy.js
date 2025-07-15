const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // API Proxy
  app.use(
    ['/api', '/socket.io', '/ws'],
    createProxyMiddleware({
      target: 'http://13.234.42.114:3333', // Your API server
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.log('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Something went wrong with the proxy: ' + err.message);
      }
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.newztok.in',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Handle large file uploads
        if (req.headers['content-type']?.includes('multipart/form-data')) {
          proxyReq.setHeader('Content-Type', req.headers['content-type']);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept';
        
        // Handle large file uploads
        if (proxyRes.statusCode === 413) {
          res.status(413).json({
            success: false,
            message: 'File size too large. Please reduce the file size and try again.'
          });
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({
          success: false,
          message: 'Proxy server error'
        });
      }
    })
  );
}; 