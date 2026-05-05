// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      // Esto le enseña a Vitest a entender el alias '@/' como hicimos en Vite
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Eliminamos la línea de setupFiles para que no dé error.
    // setupFiles: './src/setupTests.ts',
    css: true,
  },
});