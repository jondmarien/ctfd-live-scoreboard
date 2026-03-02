import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const token = env.CTFD_API_TOKEN;
  return {
  plugins: [
    // Inject React DevTools standalone connector in dev only (before React loads)
    {
      name: "react-devtools-inject",
      transformIndexHtml(html, ctx) {
        if (ctx.server) {
          return html.replace(
            "<div id=\"root\">",
            `<script src="http://localhost:8097"></script>\n    <div id="root">`,
          );
        }
        return html;
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // In profiling mode, swap react-dom for the profiling build
      ...(mode === "profiling" && {
        "react-dom/client": "react-dom/profiling",
      }),
    },
  },
  server: {
    port: 8000,
    proxy: {
      "/api": {
        target: "https://issessionsctf.ctfd.io",
        changeOrigin: true,
        secure: true,
        headers: token ? { Authorization: `Token ${token}` } : {},
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode === "profiling",
    rollupOptions: {
      output: {
        manualChunks: {
          "framer-motion": ["framer-motion", "motion"],
          gsap: ["gsap", "@gsap/react"],
          particles: [
            "@tsparticles/engine",
            "@tsparticles/react",
            "@tsparticles/slim",
          ],
          recharts: ["recharts"],
        },
      },
    },
  },
  };
});
