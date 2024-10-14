# Changelog


## v0.1.0


### 🚀 Enhancements

- Add a first version of useWebGLCanvas, onCanvasResize, and add a gradient demo ([f464f08](https://github.com/jsulpis/usegl/commit/f464f08))
- Make the vertex shader optional ([6a987b3](https://github.com/jsulpis/usegl/commit/6a987b3))
- Convert GLSL 100 shader source to GLSL 300 to handle both versions ([3e693ad](https://github.com/jsulpis/usegl/commit/3e693ad))
- Automatically detect the time uniform and trigger the render loop only if it is set ([fd2276e](https://github.com/jsulpis/usegl/commit/fd2276e))
- Automatically detect the UV varying name if a vertex shader is not provided ([4466dd7](https://github.com/jsulpis/usegl/commit/4466dd7))
- Add blob demo + loop and onPointerEvents helpers ([d9aaccf](https://github.com/jsulpis/usegl/commit/d9aaccf))
- Automatically detect the resolution uniform ([4a7f935](https://github.com/jsulpis/usegl/commit/4a7f935))
- Automatically resize the canvas if it is not an OffscreenCanvas ([b89f230](https://github.com/jsulpis/usegl/commit/b89f230))
- Add setAttribute function ([4b9ee84](https://github.com/jsulpis/usegl/commit/4b9ee84))
- Trigger render when updating a uniform ([47ff764](https://github.com/jsulpis/usegl/commit/47ff764))
- Add useRawWebGLCanvas ([2cc2e57](https://github.com/jsulpis/usegl/commit/2cc2e57))
- Add requestRender + code cleanup ([8237d51](https://github.com/jsulpis/usegl/commit/8237d51))
- Add support for particles, draw modes and indices ([4062756](https://github.com/jsulpis/usegl/commit/4062756))
- Add first draft of post processing functions ([9f20196](https://github.com/jsulpis/usegl/commit/9f20196))
- Add more post processing functions ([6f1f3e6](https://github.com/jsulpis/usegl/commit/6f1f3e6))
- Add compositor for post processing ([e855390](https://github.com/jsulpis/usegl/commit/e855390))
- Add lifecycle callbacks ([87e4534](https://github.com/jsulpis/usegl/commit/87e4534))

### 💅 Refactors

- Reorganize into folders and create a barrel file ([a7d84f8](https://github.com/jsulpis/usegl/commit/a7d84f8))

### 📖 Documentation

- Add circle demo ([21b6bf7](https://github.com/jsulpis/usegl/commit/21b6bf7))

### 🏡 Chore

- Code cleanup ([e2c032e](https://github.com/jsulpis/usegl/commit/e2c032e))
- Separate packages for docs and lib ([1857c1c](https://github.com/jsulpis/usegl/commit/1857c1c))
- Add license ([e0801ca](https://github.com/jsulpis/usegl/commit/e0801ca))
- Setup unjs package template ([0dc0d0c](https://github.com/jsulpis/usegl/commit/0dc0d0c))

