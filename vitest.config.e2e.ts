import swc from "unplugin-swc"
import TsConfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    root: "./",
    globals: true,
    include: ["src/**/*.e2e-spec.ts"],
    setupFiles: ["./test/setup.e2e.ts"],
  },
  plugins: [
    TsConfigPaths(),
    swc.vite({
      module: {
        type: "es6",
      },
    }),
  ],
})
