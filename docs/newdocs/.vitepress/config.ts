import { defineConfig } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";
import container from "markdown-it-container";
import { renderSandbox } from "vitepress-plugin-sandpack";
import { createRequire } from "node:module";
import { examplesSidebar } from "./sidebars";
const require = createRequire(import.meta.url);
const pkg = require("../../node_modules/usegl/package.json");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "useGL",
  description: "Lightweight, reactive WebGL library for working with shaders",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: "Guide",
        link: "/guide/introduction/quick-start",
        activeMatch: "/guide/",
      },
      {
        text: "Examples",
        link: "/examples/basics/full-screen",
        activeMatch: "/examples/",
      },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/jsulpis/usegl/blob/main/lib/CHANGELOG.md",
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          base: "/guide/introduction/",
          items: [{ text: "Quick start ", link: "quick-start" }],
        },
      ],
      "/examples/": examplesSidebar,
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/jsulpis/usegl" },
      { icon: "bluesky", link: "https://bsky.app/profile/jsulpis.dev" },
      { icon: "x", link: "https://x.com/jsulpis" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present Julien Sulpis",
    },
  },

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
      md.use(container, "example-editor", {
        render(tokens, idx) {
          return renderSandbox(tokens, idx, "example-editor");
        },
      });
    },
  },

  transformPageData(pageData) {
    if (pageData.relativePath.startsWith("examples/")) {
      return {
        ...pageData,
        title: `${pageData.frontmatter.title} example`,
        frontmatter: {
          prev: false,
          next: false,
          aside: false,
          layout: "doc",
          pageClass: "example-page",
          ...pageData.frontmatter,
        },
      };
    }
    return pageData;
  },

  vite: {
    plugins: [groupIconVitePlugin()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
        },
      },
    },
  },
});
