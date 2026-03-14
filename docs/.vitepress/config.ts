import { defineConfig, loadEnv } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";
import container from "markdown-it-container";
import { renderSandbox } from "vitepress-plugin-sandpack";
import { withMermaid } from "vitepress-plugin-mermaid";
import { apiSidebar, examplesSidebar } from "./sidebars";
import pkg from "../../lib/package.json";

const env = loadEnv(process.env.VERCEL_ENV || "development", process.cwd(), "");

// https://vitepress.dev/reference/site-config
const config = defineConfig({
  title: "Radiance",
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
        link: "/examples/basics/full-screen/",
        activeMatch: "/examples/",
      },
      {
        text: "API",
        link: "/api/",
        activeMatch: "/api/",
      },
      {
        text: `v${pkg.version}`,
        items: [
          {
            text: "Changelog",
            link: "https://github.com/jsulpis/radiance/releases",
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
      "/api/": apiSidebar,
    },

    socialLinks: [{ icon: "github", link: "https://github.com/jsulpis/radiance" }],

    outline: {
      level: "deep",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "© 2024-present Julien Sulpis",
    },
  },

  head: [
    [
      "script",
      {
        defer: "true",
        src: env.UMAMI_SCRIPT_URL || "",
        "data-website-id": env.UMAMI_WEBSITE_ID || "",
      },
    ],
  ],

  markdown: {
    languageAlias: {
      frag: "glsl",
      vert: "glsl",
    },
    config(md) {
      md.use(groupIconMdPlugin);
      md.use(container, "example-editor", {
        render(tokens: unknown[], idx: number) {
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

  outDir: "dist",

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

  ignoreDeadLinks: [/\.agents/],
});

export default withMermaid(config);
