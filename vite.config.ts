import react from '@vitejs/plugin-react';
import { runtime } from '@taucad/runtime/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [...runtime(), react()],
});
