// Generate .eleventyignore dynamically so every non-en locale OUTPUT dir is
// excluded (otherwise Eleventy re-reads the generated <code>/index.html as a
// template and emits junk). Scales to any number of locales in _data/locales.json.
import { writeFileSync, readFileSync } from "fs";

const locales = JSON.parse(readFileSync(new URL("./_data/locales.json", import.meta.url)));
const lines = [
  "index.html",
  "node_modules",
  "privacy",
  "og",
  "CLAUDE.md",
  ...locales.filter((c) => c !== "en"), // generated locale output dirs
];
writeFileSync(".eleventyignore", lines.join("\n") + "\n");
