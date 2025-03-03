import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const examplesDir = "examples";

const sections = fs
  .readdirSync(examplesDir)
  .filter((file) => fs.statSync(path.join(examplesDir, file)).isDirectory());

export const examplesSidebar = sections.map((section) => {
  const sectionPath = path.join(examplesDir, section);
  const pages = fs
    .readdirSync(sectionPath)
    .filter((file) => fs.statSync(path.join(sectionPath, file)).isDirectory());

  return {
    text: upperFirst(section),
    items: pages
      .map((page) => {
        const indexPath = path.join(sectionPath, page, "index.md");
        const { data } = matter(fs.readFileSync(indexPath, "utf8"));
        return {
          title: data.title || page,
          slug: page,
          position: data.position || 0,
        };
      })
      .sort((a, b) => a.position - b.position)
      .map((data) => {
        return {
          text: data.title,
          link: `/examples/${section}/${data.slug}/`,
        };
      }),
  };
});

function upperFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
