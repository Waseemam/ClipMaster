import { defineConfig } from 'vite';
import { builtinModules } from 'module';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'electron',
        'electron/main',
        'electron/common',
        'electron/renderer',
        // Let Vite bundle everything else
        ...builtinModules,
        ...builtinModules.map(m => `node:${m}`),
      ],
      output: {
        // Ensure proper module format
        format: 'cjs',
      },
    },
  },
});
