import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths so the build works under the GitHub Pages subpath
  // (https://aisdivine.github.io/toddler-tv/counting/) as well as on
  // localhost/LAN. Published into its own subfolder so the repo can host
  // several videos' live previews side by side (like mini-games does).
  base: './',
  build: {
    outDir: 'dist/counting',
    // esnext so top-level await (used in preview.ts / capture.ts) is allowed.
    target: 'esnext',
    rollupOptions: {
      // Two HTML entries: the live preview (index.html) and the headless
      // capture page (capture.html) used by the offline renderer.
      input: {
        main: 'index.html',
        capture: 'capture.html',
      },
    },
  },
  // Bind to 0.0.0.0 so phones/tablets on the same Wi-Fi can watch the live
  // preview at http://<your-mac-LAN-IP>:5173 (Vite prints the Network URL).
  server: { host: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
} as Parameters<typeof defineConfig>[0]);
