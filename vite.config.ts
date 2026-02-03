import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Esbuild Tailwind :is() + ::-webkit-scrollbar-thumb kombinatsiyasida ogohlantirish beradi; minifyni o‘chirish buildni muvaffaqiyatli qiladi
    cssMinify: false,
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
});
