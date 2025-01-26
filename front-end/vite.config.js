import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    watch: {
      usePolling: true, // Enables polling for file changes
    },
    host: true, // Allows access from other devices if needed
    port: 5173, // Optional: Specify a port
  },
})
