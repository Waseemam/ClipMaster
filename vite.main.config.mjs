import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import { copyFileSync } from 'fs';
import { join } from 'path';

// Plugin to copy database.js to build directory
function copyDatabasePlugin() {
  return {
    name: 'copy-database',
    closeBundle() {
      const srcPath = join(process.cwd(), 'src', 'database.js');
      const destPath = join(process.cwd(), '.vite', 'build', 'database.js');
      copyFileSync(srcPath, destPath);
      console.log('✓ Copied database.js to build directory');
    },
  };
}

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules.flatMap(m => [m, `node:${m}`]),
        'sql.js', // Keep as external, will be unpacked from asar
      ],
    },
  },
  plugins: [copyDatabasePlugin()],
});
