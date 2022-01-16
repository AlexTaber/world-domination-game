import { defineConfig } from "vite";
import replace from "@rollup/plugin-replace";
import vuePlugin from "@vitejs/plugin-vue";

export default defineConfig({
  server: {
    hmr: {
      port: 443,
    },
  },
  define: {
    "process.env": {},
  },
  plugins: [vuePlugin()],
  build: {
    rollupOptions: {
      plugins: [
        //  Toggle the booleans here to enable / disable Phaser 3 features:
        replace({
          "typeof CANVAS_RENDERER": "'true'",
          "typeof WEBGL_RENDERER": "'true'",
          "typeof EXPERIMENTAL": "'true'",
          "typeof PLUGIN_CAMERA3D": "'false'",
          "typeof PLUGIN_FBINSTANT": "'false'",
          "typeof FEATURE_SOUND": "'true'",
        }),
      ],
    },
  },
});
