import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  /**
   * The base path of your application.
   * For GitHub Pages, this should be the name of your repository.
   * Example: '/your-repo-name/'
   */
  base: '/student-tech/',
  
  build: {
    outDir: 'dist',
  },
  
  server: {
    host: "::",
    port: 8080,
  },
  
  plugins: [
    react(),
    // Lovable Tagger is enabled only in development mode for better performance.
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      // Sets up a convenient alias for importing modules from the 'src' directory.
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));