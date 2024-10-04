# Changelog


## v0.2.0


### 🚀 Enhancements

- Add a first version of useWebGLCanvas, onCanvasResize, and add a gradient demo ([c48b34e](https://github.com/jsulpis/usegl/commit/c48b34e))
- Make the vertex shader optional ([3b1490e](https://github.com/jsulpis/usegl/commit/3b1490e))
- Convert GLSL 100 shader source to GLSL 300 to handle both versions ([a4be3c8](https://github.com/jsulpis/usegl/commit/a4be3c8))
- Automatically detect the time uniform and trigger the render loop only if it is set ([f6685d8](https://github.com/jsulpis/usegl/commit/f6685d8))
- Automatically detect the UV varying name if a vertex shader is not provided ([cacfc86](https://github.com/jsulpis/usegl/commit/cacfc86))
- Add blob demo + loop and onPointerEvents helpers ([470c9d9](https://github.com/jsulpis/usegl/commit/470c9d9))
- Automatically detect the resolution uniform ([d563bb5](https://github.com/jsulpis/usegl/commit/d563bb5))
- Automatically resize the canvas if it is not an OffscreenCanvas ([da8137a](https://github.com/jsulpis/usegl/commit/da8137a))
- Add setAttribute function ([87be313](https://github.com/jsulpis/usegl/commit/87be313))
- Trigger render when updating a uniform ([61fb3a8](https://github.com/jsulpis/usegl/commit/61fb3a8))
- Add useRawWebGLCanvas ([b13c524](https://github.com/jsulpis/usegl/commit/b13c524))
- Add requestRender + code cleanup ([fe6e291](https://github.com/jsulpis/usegl/commit/fe6e291))
- Add support for particles, draw modes and indices ([53440ac](https://github.com/jsulpis/usegl/commit/53440ac))
- Add first draft of post processing functions ([3e0af59](https://github.com/jsulpis/usegl/commit/3e0af59))
- Add more post processing functions ([06ef9d1](https://github.com/jsulpis/usegl/commit/06ef9d1))
- Add compositor for post processing ([2bb6b14](https://github.com/jsulpis/usegl/commit/2bb6b14))
- Add lifecycle callbacks ([192e00d](https://github.com/jsulpis/usegl/commit/192e00d))

### 💅 Refactors

- Reorganize into folders and create a barrel file ([0f5625a](https://github.com/jsulpis/usegl/commit/0f5625a))

### 📖 Documentation

- Add circle demo ([2cd3215](https://github.com/jsulpis/usegl/commit/2cd3215))

### 🏡 Chore

- Code cleanup ([550f9d5](https://github.com/jsulpis/usegl/commit/550f9d5))
- Separate packages for docs and lib ([f20b767](https://github.com/jsulpis/usegl/commit/f20b767))
- Add license ([307ac5d](https://github.com/jsulpis/usegl/commit/307ac5d))
- Setup unjs package template ([b13fcf3](https://github.com/jsulpis/usegl/commit/b13fcf3))

