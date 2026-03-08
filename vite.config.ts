import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://54.180.223.140:8080',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Basic Auth 팝업의 원인인 헤더 제거
            delete proxyRes.headers['www-authenticate'];
            delete proxyRes.headers['WWW-Authenticate'];
          });
        },
      },
    },
  },
});
