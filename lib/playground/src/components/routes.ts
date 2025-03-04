import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sections = readdirSync(path.join(__dirname, "../pages"), { withFileTypes: true })
  .filter((file) => file.isDirectory())
  .map((folder) => folder.name);

export const routes = sections.flatMap((section) => {
  const files = readdirSync(path.join(__dirname, "../pages", section));

  return files.map((file) => {
    const route = file.replace(".astro", "");
    return { section, route };
  });
});
