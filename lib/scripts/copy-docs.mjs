import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const libDir = path.resolve(scriptDir, "..");
const srcDir = path.join(libDir, "src");
const docsApiDir = path.resolve(libDir, "../docs/api");

/**
 * Cross-platform equivalent of `rsync -R` for copying .md files while preserving directory structure.
 */
async function copyMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const sourcePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await copyMarkdownFiles(sourcePath);
        return;
      }

      if (!entry.isFile() || path.extname(entry.name) !== ".md") {
        return;
      }

      const relativePath = path.relative(srcDir, sourcePath);
      const destinationPath = path.join(docsApiDir, relativePath);

      await mkdir(path.dirname(destinationPath), { recursive: true });
      await copyFile(sourcePath, destinationPath);
    }),
  );
}

await copyMarkdownFiles(srcDir);
