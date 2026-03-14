---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Radiance
  text: Lightweight, reactive WebGL library
  tagline: for working with shaders
  actions:
    - theme: brand
      text: Get started
      link: /guide/introduction/quick-start
    - theme: alt
      text: Examples
      link: /examples/basics/full-screen/

features:
  - title: Lightweight
    icon: ⚡️
    details: ~5kB minzipped for the full library. Down to ~3kB for the simplest setup.
  - title: Reactive
    icon: ↺
    details: Automatically re-renders when uniforms are updated, or the canvas is resized
  - title: TypeScript
    icon: 🛠️
    details: "Autocompletion and type-safety for everything, including uniforms"
  - title: Developer friendly
    icon: 🤝
    details: Modern syntax, time and resolution uniforms automatically provided and updated
---
