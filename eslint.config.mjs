import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "sample-css.tsx",
    // Native build output — these directories contain copies of the web
    // bundle and minified vendor chunks from Capacitor. They are generated
    // artifacts, not source, and should never be linted.
    "android/app/build/**",
    "android/app/src/main/assets/**",
    "ios/App/App/public/**",
  ]),
]);

export default eslintConfig;
