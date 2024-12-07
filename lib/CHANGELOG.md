# Changelog

## v0.3.0

[compare changes](https://github.com/jsulpis/usegl/compare/v0.2.0...v0.3.0)

### 🚀 Enhancements

- Add mipmaps and anisotropic filtering ([4b875d0](https://github.com/jsulpis/usegl/commit/4b875d0))
- Allow crossorigin textures ([170cd40](https://github.com/jsulpis/usegl/commit/170cd40))
- Add manual render mode in useWebGLCanvas ([92183d4](https://github.com/jsulpis/usegl/commit/92183d4))

### 📖 Documentation

- Create documentation with Astro and Starlight ([ec7524d](https://github.com/jsulpis/usegl/commit/ec7524d))
- Setup interactive examples ([7e084a0](https://github.com/jsulpis/usegl/commit/7e084a0))

## v0.2.0

[compare changes](https://github.com/jsulpis/usegl/compare/v0.1.0...v0.2.0)

### 🚀 Enhancements

- Add basic support for textures without mipmaps ([5fc5341](https://github.com/jsulpis/usegl/commit/5fc5341))
- Allow to provide the canvas as a CSS selector ([a7f8d0f](https://github.com/jsulpis/usegl/commit/a7f8d0f))
- Add useLoop hook with play/pause controls ([f3e2cf3](https://github.com/jsulpis/usegl/commit/f3e2cf3))
- Add useBoundingRect hook ([8d1851e](https://github.com/jsulpis/usegl/commit/8d1851e))
- ⚠️ Change onPointerEvents to usePointerEvents and add more events ([ddeabd9](https://github.com/jsulpis/usegl/commit/ddeabd9))

### 🩹 Fixes

- Broken types ([011be36](https://github.com/jsulpis/usegl/commit/011be36))
- DevicePixelContentBoxSize not available on Safari ([f699ed8](https://github.com/jsulpis/usegl/commit/f699ed8))

### 💅 Refactors

- ⚠️ Change `onCanvasResize` to `useResizeObserver` and provide controls on the observer ([31e38ff](https://github.com/jsulpis/usegl/commit/31e38ff))

### 🏡 Chore

- Update dependencies ([45efec1](https://github.com/jsulpis/usegl/commit/45efec1))
- Enforce Typescript consistent type imports ([70d9e4a](https://github.com/jsulpis/usegl/commit/70d9e4a))
- Setup the playground ([a0d37d1](https://github.com/jsulpis/usegl/commit/a0d37d1))
- Move the playground in the lib package ([6e58fc8](https://github.com/jsulpis/usegl/commit/6e58fc8))

### ✅ Tests

- Add screenshot tests with playwright ([67517c8](https://github.com/jsulpis/usegl/commit/67517c8))

### 🤖 CI

- Add basic workflow ([32aaf60](https://github.com/jsulpis/usegl/commit/32aaf60))

#### ⚠️ Breaking Changes

- ⚠️ Change onPointerEvents to usePointerEvents and add more events ([ddeabd9](https://github.com/jsulpis/usegl/commit/ddeabd9))
- ⚠️ Change `onCanvasResize` to `useResizeObserver` and provide controls on the observer ([31e38ff](https://github.com/jsulpis/usegl/commit/31e38ff))

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
