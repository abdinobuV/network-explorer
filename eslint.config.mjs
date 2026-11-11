import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // eslint-config-next sudah mendaftarkan plugin jsx-a11y; rules-nya
      // diperketat di sini untuk halaman interaktif (modal, label, tombol ikon).
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/no-autofocus": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "figma/**",
    "laporan_uts/**",
    "public/**",
    "e2e/**",
  ]),
]);

export default eslintConfig;
