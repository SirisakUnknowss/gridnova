import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Wrangler bundles .md files as text; mirror that so tests import the same knowledge base.
export default defineConfig({
  plugins: [
    {
      name: "md-as-text",
      load(id) {
        if (id.endsWith(".md")) return `export default ${JSON.stringify(readFileSync(id, "utf8"))};`;
      },
    },
  ],
});
