import react from '@vitejs/plugin-react';
import { runtime } from '@taucad/runtime/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env['GITHUB_PAGES'] === 'true' ? '/tau-gallery/' : '/',
  plugins: [...runtime(), react()],
});
