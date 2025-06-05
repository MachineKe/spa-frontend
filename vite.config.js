import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-staticwebapp-config',
      writeBundle() {
        const src = resolve(__dirname, 'staticwebapp.config.json');
        const dest = resolve(__dirname, 'dist', 'staticwebapp.config.json');
        copyFileSync(src, dest);
        console.log(`Copied ${src} to ${dest}`);
      }
    }
  ],
  build: {
    outDir: 'dist'
  }
})
