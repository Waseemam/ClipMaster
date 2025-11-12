import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'electron',
        'electron/main',
        'electron/common',
        'electron/renderer',
      ],
    },
  },
});
