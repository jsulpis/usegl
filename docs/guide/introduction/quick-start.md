# Quick start

The documentation is a work in progress, and the API of useGL is still subject to changes. For now, you can browse the [examples](/examples/basics/full-screen/) to get an idea of how the library works.

A proper documentation will come soon !

## Installation

::: code-group

```sh [npm]
$ npm add -D usegl
```

```sh [pnpm]
$ pnpm add -D usegl
```

```sh [yarn]
$ yarn add -D usegl
```

```sh [bun]
$ bun add -D usegl
```

:::

## Usage

```js
import { useWebGLCanvas } from "usegl";

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 vUv; // automatically provided
    uniform float uTime; // automatically provided and updated

    void main() {
      gl_FragColor = vec4(vUv, sin(uTime) / 2. + .5, 1.);
    }
  `,
});
```
