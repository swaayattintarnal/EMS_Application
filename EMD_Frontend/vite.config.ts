import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',    // Accept connections from any IP
    port: 3001,         // Run on port 3001
    strictPort: true    // Fail if port is already in use
  }
});
