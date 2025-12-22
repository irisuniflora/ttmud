import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ttmud/',  // GitHub Pages 배포용 (레포지토리 이름)
  server: {
    port: 3000,
    open: true
  }
})
