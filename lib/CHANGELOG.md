# Changelog

## v0.6.0

[compare changes](https://github.com/jsulpis/usegl/compare/v0.5.0...v0.6.0)

### 🚀 Enhancements

- Add support for ping pong FBO technique ([39c7004](https://github.com/jsulpis/usegl/commit/39c7004))
- Add 'onCanvasReady' is useWebGLCanvas ([ee41ecc](https://github.com/jsulpis/usegl/commit/ee41ecc))
- Add a "transparent" option on the renderPass ([e73e9db](https://github.com/jsulpis/usegl/commit/e73e9db))
- Add useTransformFeedback to do maths on the GPU ([2a3bb42](https://github.com/jsulpis/usegl/commit/2a3bb42))

### 🩹 Fixes

- Wrong count of texture units ([c8a77aa](https://github.com/jsulpis/usegl/commit/c8a77aa))

### 📖 Documentation

- Update the examples with the new synchronous loaders api ([4c76307](https://github.com/jsulpis/usegl/commit/4c76307))
- Add an example of multi-pass post-processing effect (bloom) ([ae7fdcc](https://github.com/jsulpis/usegl/commit/ae7fdcc))

### 🏡 Chore

- Update dependencies ([18f0c9b](https://github.com/jsulpis/usegl/commit/18f0c9b))

## v0.5.0

[compare changes](https://github.com/jsulpis/usegl/compare/v0.4.0...v0.5.0)

### 🚀 Enhancements

- Handle multi-pass post-processing effects ([3250a47](https://github.com/jsulpis/usegl/commit/3250a47))
- Add useCompositeEffectPass hook to have more control over multi pass effects ([45a0528](https://github.com/jsulpis/usegl/commit/45a0528))
- Make the texture loaders synchronous and re-render when loaded ([9829a6c](https://github.com/jsulpis/usegl/commit/9829a6c))

### 📖 Documentation

- Add an example for drawing modes ([0ef7432](https://github.com/jsulpis/usegl/commit/0ef7432))
- Add an example for particles ([a4deedd](https://github.com/jsulpis/usegl/commit/a4deedd))
- **examples:** Add an example of data texture ([7653a1a](https://github.com/jsulpis/usegl/commit/7653a1a))
- **examples:** Add an example of image texture ([20a6a00](https://github.com/jsulpis/usegl/commit/20a6a00))
- **examples:** Add an example of canvas 2D texture ([83ac9fd](https://github.com/jsulpis/usegl/commit/83ac9fd))
- **examples:** Add an example of play/pause ([1441aff](https://github.com/jsulpis/usegl/commit/1441aff))
- **examples:** Add an example of pointer coordinates ([cdc6159](https://github.com/jsulpis/usegl/commit/cdc6159))
- **examples:** Add an example for uniforms ([bd0cbd0](https://github.com/jsulpis/usegl/commit/bd0cbd0))
- **examples:** Display render count ([47ce9c2](https://github.com/jsulpis/usegl/commit/47ce9c2))
- **examples:** Add example of vertices with indices ([bfb1293](https://github.com/jsulpis/usegl/commit/bfb1293))
- **examples:** Add an example of video texture ([229b2a8](https://github.com/jsulpis/usegl/commit/229b2a8))
- **examples:** Add an example of single pass post-processing ([05bad31](https://github.com/jsulpis/usegl/commit/05bad31))
- Setup Vitepress with Sandpack ([a77b367](https://github.com/jsulpis/usegl/commit/a77b367))
- Setup example editor in VitePress ([875fb38](https://github.com/jsulpis/usegl/commit/875fb38))
- Import all examples in VitePress ([78ca377](https://github.com/jsulpis/usegl/commit/78ca377))
- Complete the migration to VitePress ([9f20077](https://github.com/jsulpis/usegl/commit/9f20077))

## v0.4.0

[compare changes](https://github.com/jsulpis/usegl/compare/v0.3.0...v0.4.0)

### 🚀 Enhancements

- Add support for video textures ([b2b9e74](https://github.com/jsulpis/usegl/commit/b2b9e74))
- Add a colorSpace option to facilitate the usage of display-p3 ([7193197](https://github.com/jsulpis/usegl/commit/7193197))

### 🔥 Performance

- Use 1 triangle instead of 2 for full screen quads ([84d4556](https://github.com/jsulpis/usegl/commit/84d4556))

### 🩹 Fixes

- Indexed rendering broken when there is no index attribute in the shaders ([15fd1eb](https://github.com/jsulpis/usegl/commit/15fd1eb))
- Uniforms and attributes detection broken when there is a comment at the end of the line ([1369fa8](https://github.com/jsulpis/usegl/commit/1369fa8))

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
