import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
build: {
    rollupOptions: {
      external: [
        "react-pdf/dist/esm/Page/AnnotationLayer.css",
        "react-pdf/dist/esm/Page/TextLayer.css",
      ],
    },
  },
});
