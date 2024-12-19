// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      components: {
        Search: "./src/components/CustomHeader.astro",
      },
      plugins: [],
      title: "useGL",
      social: {
        github: "https://github.com/jsulpis/usegl",
        blueSky: "https://bsky.app/profile/jsulpis.dev",
        "x.com": "https://x.com/jsulpis",
      },
      pagination: true,
      customCss: ["./src/styles/custom.scss"],
      sidebar: [
        {
          label: "Introduction",
          autogenerate: { directory: "docs/introduction" },
        },
      ],
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
