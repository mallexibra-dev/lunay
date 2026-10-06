import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // 'threads' lebih stabil daripada 'forks' (default) di Windows
    pool: 'threads',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'drizzle/',
        '.next/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: [
      // schemas/ & types/ hidup di root project (konvensi AGENTS.md),
      // sisanya di bawah src/.
      { find: /^@\/schemas\/(.*)/, replacement: resolve(__dirname, './schemas/$1') },
      { find: /^@\/types\/(.*)/, replacement: resolve(__dirname, './types/$1') },
      { find: /^@\/(.*)/, replacement: resolve(__dirname, './src/$1') },
    ],
  },
});
