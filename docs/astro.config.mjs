// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightUtils from "@lorenzo_lewis/starlight-utils";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightUtils({
          navLinks: {
            leading: { useSidebarLabelled: "leadingNavLinks" },
          },
        }),
      ],
      title: "useGL",
      social: {
        github: "https://github.com/jsulpis/usegl",
        blueSky: "https://bsky.app/profile/jsulpis.dev",
        "x.com": "https://x.com/jsulpis",
      },
      pagination: false,
      sidebar: [
        {
          label: "leadingNavLinks",
          items: [
            { label: "Guides", link: "/introduction/quick-start" },
            { label: "Examples", link: "/examples/basics/gradient" },
          ],
        },
        {
          label: "Introduction",
          autogenerate: { directory: "introduction" },
        },
      ],
      customCss: ["./src/styles/custom.scss"],
    }),
    react(),
    mdx(),
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern",
        },
      },
    },
  },
});
